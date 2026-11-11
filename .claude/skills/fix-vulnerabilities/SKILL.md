---
name: fix-vulnerabilities
description: Triage and fix every open Dependabot alert, Dependabot pull request, and any other dependency vulnerability in this repository, then ship one pull request with the right version bump. Use when asked to fix vulnerabilities, handle Dependabot, or check security.
---

# Fix vulnerabilities

Goal: no known vulnerability left in this repository, every open Dependabot
pull request resolved, and one green pull request that releases the fixes.

Read `AGENTS.md` first. Its quality gate, versioning rules, and commit rules
apply to everything here.

## 1. Collect the work

Run these from the repository root (`gh` resolves the repository from git):

```bash
gh api "repos/{owner}/{repo}/dependabot/alerts?state=open&per_page=100" \
  --jq '.[] | [.number, .security_advisory.severity, .dependency.package.ecosystem, .dependency.package.name, .dependency.manifest_path, (.security_vulnerability.first_patched_version.identifier // "no fix"), .security_advisory.summary] | @tsv'
gh pr list --author "app/dependabot" --json number,title,headRefName,statusCheckRollup
```

Then run each ecosystem's own audit, because Dependabot misses transitive and
non-manifest issues. Use the ones that apply:

| Ecosystem      | Audit                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| pnpm           | `pnpm audit --prod` then `pnpm audit`                                       |
| npm            | `npm audit`                                                                 |
| Python (uv)    | `uvx pip-audit` (or `uv export --no-hashes \| uvx pip-audit -r /dev/stdin`) |
| Python (pip)   | `pip-audit -r requirements.txt`                                             |
| .NET           | `dotnet list package --vulnerable --include-transitive`                     |
| Docker images  | Check base image tags against the latest patched release                    |
| GitHub Actions | Every third-party action is pinned to a full commit SHA                     |

## 2. Decide, per finding

Pick the first option that works, and write the decision down for the pull
request description:

1. **Upgrade within range.** A patched version exists and is semver-compatible:
   update the manifest and lockfile.
2. **Upgrade across a major.** Read the dependency's changelog or migration
   guide, apply the code changes, and cover the touched behavior with tests.
3. **Transitive only.** Upgrade the direct parent first. If the parent has no
   fixed release, pin with the package manager's override (`pnpm.overrides`,
   npm `overrides`, uv `override-dependencies`, a NuGet direct reference) and
   add a comment saying which advisory it fixes and when to remove it.
4. **No fix exists.** Check whether the vulnerable code path is reachable here.
   If it is, replace the dependency or mitigate in code. If it is not, dismiss
   the alert with a reason:
   `gh api -X PATCH "repos/{owner}/{repo}/dependabot/alerts/<n>" -f state=dismissed -f dismissed_reason=not_used -f dismissed_comment="<why>"`.
   Never dismiss a reachable vulnerability.
5. **Dev-only tooling.** Still fix it. It runs on the owner's machine and in CI.

For each open Dependabot pull request: fold its update into this branch if it
is still relevant, or explain why it is superseded. Close superseded ones after
this pull request merges, never before.

Also fix anything the audits find that Dependabot did not report, and any
vulnerable pattern you see while making the changes (secrets in code, unpinned
actions, `latest` image tags, missing input validation at a trust boundary).
Mention each extra fix separately.

## 3. Ship

1. Branch from an up-to-date `main`: `fix/security-<yyyy-mm-dd>`.
2. Run the full quality gate from `AGENTS.md`. Re-run every audit from step 1;
   it must come back clean apart from dismissed, unreachable findings.
3. Bump the version per `AGENTS.md`: patch for dependency and security fixes,
   minor or major only if a migration changed behavior.
4. Commit as `fix(deps): ...` or `fix(security): ...`, with no co-author or
   generated-by lines, push, and open a pull request whose body lists each
   alert number, the decision, and how it was verified.
5. Report back: what was fixed, what was dismissed and why, and anything that
   still needs the owner.
