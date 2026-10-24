# GitHub cards

The profile embeds committed SVGs from `cards/`. The Update GitHub cards workflow
refreshes all repository cards, statistics, and top languages daily at 03:17 UTC
(11:17 Singapore time), on relevant pushes to `main`, or via **Run workflow** in
GitHub Actions. Scheduled runs may be delayed by GitHub.

Generation uses the same upstream core package as
[GitHub Readme Stats Action](https://github.com/stats-organization/github-readme-stats-action),
installed once for all cards. Its version and dependencies are locked in
`package-lock.json`. The workflow uses the automatic `GITHUB_TOKEN` for public
data, so no personal access token or Vercel deployment needs to be maintained.

To add a repository, add its `owner/repository` to `cards.json` and link its
`cards/owner-repository.svg` file in `README.md`. Keep the repository's exact case.
The generator preserves the dark theme and black borders used by the profile.

To regenerate locally with Node.js 24 and an authenticated GitHub CLI:

```sh
npm ci --ignore-scripts
GITHUB_TOKEN="$(gh auth token)" npm run cards
```

All cards must generate successfully before any saved SVG is replaced. A failed
refresh leaves the last successful cards committed and visible. Inspect the
failed Actions run, fix the cause (for example, a renamed repository), and rerun.
The workflow needs permission to push to `main`; branch rules must allow the bot
to write the generated cards. GitHub can disable scheduled workflows in public
repositories after 60 days without repository activity; re-enable the workflow
in Actions if that happens.
