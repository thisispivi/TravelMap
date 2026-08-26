# Claude repository instructions

@CODING_GUIDELINES.md

Before editing code, read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) in
full. It is the single source of truth for this repository's coding style and
applies to every code file without exceptions. Existing deviations are not
precedent for new code.

Do not duplicate or redefine shared coding rules here. Update the canonical
guidelines when a repository-wide rule changes.

Repository areas:

- `apps/travel-map/`: React, TypeScript, Vite, and SCSS application.
- `apps/travel-map-editor/`: the companion authoring tool for `data/` content.
- `packages/core/`: `@travelmap/core`, the shared domain model used by both apps.
- `scripts/uploader/`: typed Python media uploader.
- `logos/`: source and exported brand assets.

## The editor boundary

`apps/travel-map-editor/` aliases `@app/*` to `apps/travel-map/src/*` and
imports thirteen modules from the public app, including `styles/_global.scss`,
`styles/_typography.scss`, and `styles/_scrollbar.scss`. Those three
stylesheets are the editor's baseline and must not be restyled — the public
app's own base is `styles/_record.scss`. Before deleting, renaming, or
un-exporting anything under `apps/travel-map/src`, run
`grep -r "@app/" apps/travel-map-editor/src`. `knip` cannot see those
consumers; `apps/travel-map/knip.json` lists them as entry points.

Verification:

- From the repository root, run `pnpm check` for application changes (it runs
  typecheck/lint across the workspace plus `travel-map`'s format/knip/
  react:doctor checks, plus the Node-based tests).
- Also run `pnpm build` for behavior, dependency, configuration, routing, or
  production-output changes.
- From the repository root, run
  `python -m compileall -q scripts/uploader` for uploader changes.
- Do not use real credentials or upload media as part of verification.

Inspect every changed file before finishing and resolve every coding-guideline
violation introduced or exposed by the change.
