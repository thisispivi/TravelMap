# Agent instructions

## Mandatory coding standard

Read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) completely before editing
code. It is the canonical coding standard for this repository and applies to
every code file, regardless of the size of the change. Existing deviations are
not precedent for new code.

This file holds the workflow rules. `CLAUDE.md` and
`.github/copilot-instructions.md` are thin adapters that point here; put
shared coding rules only in `CODING_GUIDELINES.md` so the assistants cannot
drift apart.

## Repository layout

- `apps/travel-map/` contains the React, TypeScript, Vite, and SCSS application.
- `apps/travel-map-editor/` contains the companion authoring tool for `data/` content.
- `packages/core/` contains `@travelmap/core`, the shared domain model used by both apps.
- `packages/ui/` contains `@travelmap/ui`, the components, styles, i18n, map base, and Vite preset both apps share.
- `scripts/uploader/` contains the typed Python media uploader.
- `logos/` contains source and exported brand assets.

## Required verification

For application changes, run `pnpm check` from the repository root. It runs
typecheck, lint, formatting, tests, and dead-code analysis across every
workspace project, plus the React Doctor scan of both apps. Also run `pnpm build`
when behavior, dependencies, configuration, routing, or production output can be
affected.

For uploader changes, run `python -m compileall -q scripts/uploader` and
`python -m unittest discover -s scripts/uploader -p "test_*.py"` from the
repository root, using the uploader's virtual environment. Never use real
credentials or upload media merely to verify a code change.

Inspect every changed file before finishing and resolve all guideline
violations introduced or exposed by the change.

## Versioning and releases

`apps/travel-map/package.json` holds the version, and it is what triggers a release. When
CI passes on `main` and that version has no tag yet, the Release workflow tags
it, publishes the GitHub release with generated notes. Then `pnpm --filter travel-map deploygh` publishes the site from your machine; it refuses to run unless `main` is clean, in sync with `origin/main`, and its version is released. Nobody
releases by hand, and nothing is committed back to `main`.

Every change that reaches `main` bumps the version in the same pull request,
following [Semantic Versioning](https://semver.org/):

| Bump  | When                                                                           | Commit type                                  |
| ----- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| major | Breaking: removed or renamed behavior, config, API, or data users must migrate | `feat!:` or a `BREAKING CHANGE:` footer      |
| minor | A new user-visible feature                                                     | `feat:`                                      |
| patch | A fix, performance work, refactor, or dependency update                        | `fix:`, `perf:`, `refactor:`, `chore(deps):` |
| none  | Docs, tests, CI, or agent configuration only                                   | `docs:`, `test:`, `ci:`, `chore:`            |

- Compare against the last tag (`git describe --tags --abbrev=0`) and pick
  the highest bump the change needs. Bump once per pull request.
- The settings page shows the version and links to the repository and the
  author page.
- Never create tags, GitHub releases, or changelog entries yourself.
- The pull request title is the release note. The "Version bump" check fails
  when code changes without a bump, unless the title type is `docs`, `test`,
  `ci`, `style`, `build`, or `chore` (but not `chore(deps)`).

## Commits and pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/). Name
  branches `<type>/<short-description>`.
- The repository owner is the only author. Never add `Co-Authored-By`
  trailers, "Generated with" lines, or any other attribution to commits or pull
  requests.
- Do not bypass git hooks or CI checks.

## Security

Dependabot alerts and security updates are on. To triage and fix them, use the
`fix-vulnerabilities` skill in `.claude/skills/fix-vulnerabilities/`.
