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
- `packages/ui/`: `@travelmap/ui`, the components, styles, i18n, map base, and
  Vite preset both apps share.
- `scripts/uploader/`: typed Python media uploader.
- `logos/`: source and exported brand assets.

Verification:

- From the repository root, run `pnpm check` for application changes. It runs
  typecheck, lint, formatting, tests, and dead-code analysis across every
  workspace project, plus the React Doctor scan of both apps.
- Also run `pnpm build` for behavior, dependency, configuration, routing, or
  production-output changes.
- For uploader changes, run `python -m compileall -q scripts/uploader` and
  `python -m unittest discover -s scripts/uploader -p "test_*.py"` from the
  repository root, using the uploader's virtual environment.
- Do not use real credentials or upload media as part of verification.

Inspect every changed file before finishing and resolve every coding-guideline
violation introduced or exposed by the change.
