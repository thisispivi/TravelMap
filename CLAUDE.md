# Claude repository instructions

@CODING_GUIDELINES.md

Before editing code, read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) in
full. It is the single source of truth for this repository's coding style and
applies to every code file without exceptions. Existing deviations are not
precedent for new code.

Do not duplicate or redefine shared coding rules here. Update the canonical
guidelines when a repository-wide rule changes.

Repository areas:

- `travel-map/`: React, TypeScript, Vite, and SCSS application.
- `scripts/uploader/`: typed Python media uploader.
- `logos/`: source and exported brand assets.

Verification:

- From `travel-map/`, run `pnpm check` for application changes.
- Also run `pnpm build` for behavior, dependency, configuration, routing, or
  production-output changes.
- From the repository root, run
  `python -m compileall -q scripts/uploader` for uploader changes.
- Do not use real credentials or upload media as part of verification.

Inspect every changed file before finishing and resolve every coding-guideline
violation introduced or exposed by the change.
