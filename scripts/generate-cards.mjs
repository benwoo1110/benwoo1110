import { mkdir, readFile, writeFile } from "node:fs/promises";

if (!process.env.PAT_1 && process.env.GITHUB_TOKEN) {
  process.env.PAT_1 = process.env.GITHUB_TOKEN;
}
if (!process.env.PAT_1) {
  throw new Error("Set GITHUB_TOKEN to generate the public GitHub cards.");
}

// Import after setting PAT_1: the upstream fetchers read it during initialization.
const { api, pin, topLangs } = await import(
  "@stats-organization/github-readme-stats-core"
);
const config = JSON.parse(await readFile("cards.json", "utf8"));
const options = {
  username: config.username,
  theme: "dark",
  border_color: "000000",
  disable_animations: "true",
};
const jobs = config.repositories.map((repository) => {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    throw new Error(`Invalid repository: ${repository}`);
  }
  const [username, repo] = repository.split("/");
  return {
    path: `cards/${username}-${repo}.svg`,
    render: () => pin({ ...options, username, repo }),
  };
});
jobs.push(
  {
    path: "cards/stats.svg",
    render: () => api({ ...options, show_icons: "true", icon_color: "FF0000" }),
  },
  {
    path: "cards/top-langs.svg",
    render: () => topLangs({ ...options, layout: "compact" }),
  },
);

// Finish and validate every card before replacing any of the saved SVGs.
// An API outage must not replace working cards with upstream error cards.
const cards = [];
for (const job of jobs) {
  console.log(`Generating ${job.path}`);
  const result = await job.render();
  if (
    String(result?.status).startsWith("error") ||
    !result?.content?.includes("<svg") ||
    result.content.includes("Something went wrong!")
  ) {
    throw new Error(
      `${job.path}: ${result?.error?.message ?? "Card generation failed"}`,
    );
  }
  cards.push({ path: job.path, content: result.content });
}

await mkdir("cards", { recursive: true });
for (const card of cards) {
  await writeFile(card.path, card.content, "utf8");
}
console.log(`Saved ${cards.length} cards.`);
