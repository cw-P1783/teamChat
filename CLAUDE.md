# Claude Code instructions for Team Chat Lab

Read and follow [AGENTS.md](AGENTS.md) for the repository's implementation, validation, storage, and collaboration rules.

Before **any** commit-message suggestion, commit, PR-title/body draft, PR creation, or PR update, invoke the **`git-issue-pr`** skill with `/git-issue-pr` and apply its instructions. This is required even when the request is only to generate text.

The canonical skill is [`.claude/skills/git-issue-pr/SKILL.md`](.claude/skills/git-issue-pr/SKILL.md). Codex's `.agents/skills/git-issue-pr` is a relative symlink to that directory. Edit only the canonical file. If discovery is unavailable, read it directly and apply it.

Use English Conventional Commit subjects and the real GitHub issue number. Fully resolved issues use standalone `Fixes #NUMBER` lines in a PR targeting `develop`; partial/context references use `Refs #NUMBER`. The repository's merge workflow performs develop-time issue closure after a verified PR merge. Keep human review and the existing action authorization boundaries.
