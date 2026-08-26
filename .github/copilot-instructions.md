# GitHub Copilot repository instructions

`CODING_GUIDELINES.md` at the repository root is the canonical coding standard.
Read it before generating, editing, reviewing, or suggesting code. Apply it to
every code file without exceptions; existing deviations are not precedent.

Keep shared rules in `CODING_GUIDELINES.md`, not in this adapter.

- The web application is in `apps/travel-map/`; its companion authoring tool
  is `apps/travel-map-editor/`; both depend on the shared domain model in
  `packages/core/` (`@travelmap/core`).
- The typed Python media uploader is in `scripts/uploader/`.
- The editor aliases `@app/*` into `apps/travel-map/src/*` and imports modules
  and three stylesheets from it. Never delete, rename, or un-export anything
  there without first running `grep -r "@app/" apps/travel-map-editor/src`, and
  never restyle `_global.scss`, `_typography.scss`, or `_scrollbar.scss` — the
  public app's own base is `_record.scss`.
- Prefer the least code that works, comments that explain why, native platform
  features, explicit types, and accessible UI.
- Never use real credentials or upload media while verifying uploader changes.
- For app changes, run `pnpm check` from the repository root; run `pnpm build`
  when production behavior or output can be affected.
- For uploader changes, run
  `python -m compileall -q scripts/uploader` from the repository root.
- Inspect every changed file and resolve all guideline violations introduced or
  exposed by the change.
