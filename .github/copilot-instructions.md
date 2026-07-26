# GitHub Copilot repository instructions

`CODING_GUIDELINES.md` at the repository root is the canonical coding standard.
Read it before generating, editing, reviewing, or suggesting code. Apply it to
every code file without exceptions; existing deviations are not precedent.

Keep shared rules in `CODING_GUIDELINES.md`, not in this adapter.

- The web application is in `travel-map/`.
- The typed Python media uploader is in `scripts/uploader/`.
- Prefer the least code that works, comments that explain why, native platform
  features, explicit types, and accessible UI.
- Never use real credentials or upload media while verifying uploader changes.
- For app changes, run `pnpm check` from `travel-map/`; run `pnpm build` when
  production behavior or output can be affected.
- For uploader changes, run
  `python -m compileall -q scripts/uploader` from the repository root.
- Inspect every changed file and resolve all guideline violations introduced or
  exposed by the change.
