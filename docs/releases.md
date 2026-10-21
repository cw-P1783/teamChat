# Versioned Production releases

Team Chat declares `0.1.0` in `package.json` and both root version entries of `package-lock.json`. This is the existing baseline, not evidence of a verified Production release. `workshop-start` is a workshop marker, not a version tag. Do not retroactively tag an unverified deployment.

## Version policy

Use stable `MAJOR.MINOR.PATCH` versions for Production. `package.json` is authoritative; the lockfile must match. Each release advances beyond the version on `main`; individual feature branches need not bump versions.

- Patch: compatible fixes, documentation, tooling, or deployment maintenance.
- Minor: new compatible chat features.
- Major: incompatible public behavior/API changes after 1.0. Before 1.0, use a minor bump for breaking changes and describe them explicitly; 1.0 is a deliberate stable-API milestone.

These project conventions follow [SemVer](https://semver.org/). Production versions exclude prerelease/build suffixes. A version identifies a release candidate until deployment is verified; the deployed SHA identifies the exact artifact.

## Prepare the version and release PR

1. Fetch `origin` and tags. Review `origin/main...origin/develop`, versions, and open `develop` → `main` PRs.
2. If needed, create a maintenance branch from latest `origin/develop`. Use one appropriate [npm version](https://docs.npmjs.com/cli/v11/commands/npm-version/) command, for example `npm version patch --no-git-tag-version`. This updates package metadata without creating a commit or tag. Do not bump again if the intended version is already pending on `develop`.
3. Run `npm run version:check -- --base-ref origin/main` and `npm run check`. Review and commit the two package files through the usual PR process to `develop`.
4. Once integrated, create or update the shared PR with **base `main`, head `develop`**, titled `chore(release): deploy vVERSION to main`. Record old/new versions, source SHA, included changes, actual checks, and remaining verification. Reuse an existing release PR; pending feature PRs are not included automatically.
5. CI validates matching versions on every check. PRs to `main` additionally require head `develop`, a version greater than the PR's base SHA, and an unused `vVERSION` tag. Behind/conflicting PRs are not ready merely because earlier checks passed.

Version preparation does not authorize merge, bypass, deployment, tag publication, or a GitHub Release. Another human must review. The canonical AI workflow is [git-issue-pr](../.claude/skills/git-issue-pr/SKILL.md).

## Deployment and release record

A `main` push runs `.github/workflows/workshop.yml`: CI first, then Production deployment of that SHA. Preserve the Production Redis room prefix and history. Verify deployed SHA/URL and message sending in an approved shared room; record unperformed checks.

After successful deployment, an explicitly requested annotated tag `vVERSION` must point to the deployed `main` commit. Verify existing tags before publishing; never move or reuse a published version tag. Tagging/GitHub Release publication is manual, not currently automated. PR creation, merge, and passing builds are not proof of deployment. A failed deployment remains incomplete; rollback requires an authorized revert/redeployment.
