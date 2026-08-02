# Codex repository instructions

## Mandatory coding standard

Read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) completely before editing
code. It is the canonical coding standard for this repository and applies to
every code file, regardless of the size of the change. Existing deviations are
not precedent for new code.

Keep this file, `CLAUDE.md`, and `.github/copilot-instructions.md` as thin
adapters. Put shared coding rules only in `CODING_GUIDELINES.md` so the
assistants cannot drift apart.

## Repository layout

- `apps/travel-map/` contains the React, TypeScript, Vite, and SCSS application.
- `apps/travel-map-editor/` contains the companion authoring tool for `data/` content.
- `packages/core/` contains `@travelmap/core`, the shared domain model used by both apps.
- `scripts/uploader/` contains the typed Python media uploader.
- `logos/` contains source and exported brand assets.

## Required verification

For application changes, run `pnpm check` from the repository root (it runs
typecheck/lint across the workspace plus `travel-map`'s format/knip/
react:doctor checks). Also run `pnpm build` when behavior, dependencies,
configuration, routing, or production output can be affected.

For uploader changes, run
`python -m compileall -q scripts/uploader` from the repository root. Never use
real credentials or upload media merely to verify a code change.

Inspect every changed file before finishing and resolve all guideline
violations introduced or exposed by the change.
