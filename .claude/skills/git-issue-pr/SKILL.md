---
name: git-issue-pr
description: Prepare Team Chat Lab commits, issue PRs, and versioned deployment PRs from develop to main. Use before drafting, editing, or publishing commit messages or PR titles and bodies in this repository.
---

# Git issues, commits, and pull requests

Canonical source: `.claude/skills/git-issue-pr/SKILL.md`. `.agents/skills/git-issue-pr` is a relative symlink to this directory; edit the canonical file only. Resolve repository-relative paths from the repository root.

Apply this skill whenever preparing a commit or PR, including text-only suggestions. Read the repository's `AGENTS.md`, `CONTRIBUTING.md`, and `.github/pull_request_template.md`. Keep existing user authorization: a request for wording permits drafting; a request to commit permits a local commit; a request to open a PR includes its necessary branch push. Do not repeat permission questions for an already authorized action. Creating a commit or PR does not authorize merge, deployment, or changes to repository settings.

## Establish the change and issue

- Inspect `git status`, the current branch, relevant staged/unstaged diffs, and the intended remote. Preserve unrelated work and existing staged files. Never use a broad `git add .` to collect unrelated changes.
- For a new feature/fix task, fetch `origin` and start from the latest `origin/develop`, following `CONTRIBUTING.md`. Use `feature/<actual-issue-number>-<slug>` for a feature and `fix/<actual-issue-number>-<slug>` for a bug fix. Maintenance work also starts from and targets `develop`; use a descriptive branch without inventing an issue number. Reuse the existing task branch when already working on it; do not switch or recreate branches over uncommitted work. Never push directly to `develop` or `main`, force-push, or amend someone else's commits.
- Verify the assigned issue number against the intended repository when GitHub access is available, for example with `gh issue view NUMBER --repo OWNER/REPO`. Read its acceptance criteria. `CHAT-01` is a planning identifier, not GitHub issue `#1`. Never invent an issue number or mark unrelated issues as resolved.
- If a maintenance change has no issue, omit the issue suffix and closing line. If the user intends to fix a particular issue but its number is missing, prepare the change summary while requesting that number; do not publish a fabricated reference.
- Use Node.js 24 and `npm ci` for dependency setup. Run `npm run check` after implementation and record the results. State any checks not run and their reasons; do not claim browser or shared-Redis verification from unit tests alone. Preserve the repository's storage, secret, room-prefix, and human-review rules.

## Commit and PR titles

Write English [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) subjects:

```text
<type>[(optional-scope)][!]: <imperative description> (#<actual-issue-number>)
```

Allowed types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`. Choose the type from the actual change: a new emoji picker is `feat`, correcting broken behavior is `fix`. `style` is formatting-only; a visible UI feature can be `feat`. Use `!` and a `BREAKING CHANGE:` footer only for an actual breaking change. Keep the subject concise, preferably within 72 characters, without a trailing period.

```text
feat(chat): add an emoji picker (#42)
fix(chat): preserve a failed message draft (#57)
docs: clarify the workshop setup
```

Use the same convention for the PR title. Include each fully addressed issue in the PR body as described below; do not force every title to use `fix:` just because an issue is being closed. For commits addressing an issue, the `(#42)` suffix identifies it without prematurely closing it. Keep closure directives in the PR body. Git-generated merge commits may retain their standard merge message.

Before an authorized commit, stage only the intended paths, inspect `git diff --staged`, and verify that unrelated staged changes are excluded. If staging cannot be separated safely, report the exact conflict rather than committing someone else's work. Do not commit secrets, environment files, `.vercel`, dependency directories, or generated build files.

## PR body and issue completion

- Feature/fix PRs target **`develop`**. Follow the current PR template and describe the concrete problem, resulting behavior, acceptance evidence, automated/manual checks, and material limitations. Preserve the author's responsibility to explain the change and obtain another person's review.
- For **each fully resolved issue in this repository**, put one standalone line in the PR body, outside comments, quotes, lists, or code fences:

```text
Fixes #42
Fixes #57
```

- The numbers must be actual same-repository issues, not PR numbers. Maximum 20 closing references per PR. For partial work, prerequisites, or context, use `Refs #42` instead; it deliberately leaves that issue open. Never add `Fixes` when its acceptance criteria remain incomplete.
- Do not combine multiple references on one line or use a cross-repository closing reference. Replace or remove template placeholders such as `#ISSUE_NUMBER`. A PR unrelated to an issue should explicitly say that no issue is associated.
- GitHub's native closing keywords only close issues when merging to the default branch. Query the current default rather than assuming `main`. Here `.github/workflows/close-linked-issues.yml` handles `develop`: a push must match an actually merged PR's merge commit and base branch before it closes that PR's explicitly referenced issues. `Refs` does not close anything. Integration into `develop` does not mean Production deployment.
- The workflow and its helper must first be merged into `develop` to activate this behavior. Do not change the default branch or claim a workflow ran before it exists there. A closed but unmerged PR, an ordinary feature push, or a PR targeting another branch does not trigger this workflow's closures.
- Release PRs use base `main`, compare `develop`, and the facilitator's release procedure. Do not manufacture a feature issue merely to describe a release, or merge/publish a release without authorization.

For GitHub CLI, write the complete PR body to a temporary UTF-8 file and use `gh pr create --base develop --head BRANCH --title TITLE --body-file PATH` (or `gh pr edit ... --body-file PATH`). When asked to open/create a GitHub Draft PR, add `--draft`; a request for draft text alone remains text generation. Pass literal arguments safely; do not put multiline bodies or untrusted issue text into shell command substitutions. Respect the authorized scope and avoid creating a second PR if the task already has one.

After an authorized action, report the commit hash or PR URL, the actual issue reference(s), base branch, validation results, and remaining manual checks. Do not close issues manually while preparing the PR or claim they are closed before the merge workflow succeeds.

## Deployment PRs and versioning

Read `docs/releases.md` when asked for a deployment/release PR.

1. Fetch `origin` and tags. Inspect remote `main...develop` commits, files, package versions, and open PRs with base `main` / head `develop`. Reuse an existing release PR. Recheck refs after fetching; local tracking refs may be stale.
2. Use **base `main`, compare `develop`**. Include changes already integrated into remote `develop`; do not merge pending feature PRs just to include them. Record the actual included PRs and source SHA.
3. Each Production release needs a stable `MAJOR.MINOR.PATCH` greater than `origin/main`, with an unused `vVERSION` tag. `package.json` is authoritative; both root version entries in `package-lock.json` must match. Run `npm run version:check -- --base-ref origin/main`.
4. If needed, prepare a version bump on a maintenance branch from latest `origin/develop` using `npm version patch|minor|major --no-git-tag-version`, following `docs/releases.md`. Review both package files and run `npm run check`. A deployment-PR request includes necessary version preparation and its PR to `develop`, but not merging it. Keep the release PR Draft with the blocker explained until that bump is integrated. Never claim the unmerged version is included or increment again when the intended unreleased version is already on `develop`.
5. Use an English title such as `chore(release): deploy v0.1.1 to main`. Adapt the PR template to include version transition, included changes, source SHA, actual check results, outstanding checks/conflicts, deployment trigger, and post-deployment verification. Do not invent a release issue or repeat issue-closing directives from already integrated feature PRs.
6. Check current CI, conflicts, and whether the head is behind `main` before reporting readiness. Report required synchronization or prepare it within the authorized scope; do not silently merge `main` into shared `develop`. Earlier source checks are historical evidence, not validation of the current release candidate.
7. PR creation does not authorize merge, deployment, tagging, publishing a GitHub Release, or changing/bypassing protections. Human review remains required. After an explicitly authorized merge, `.github/workflows/workshop.yml` deploys the exact `main` push SHA after CI passes. Preserve Production Redis credentials, room prefix, and history.
8. After verified deployment, record version, SHA, URL, and shared-chat smoke checks. Only when tag/release publication is explicitly requested, create `vVERSION` on the deployed `main` commit. Verify existing tags and never move a published tag. A failed deploy is not a completed release; rollback requires an authorized revert/redeployment.
