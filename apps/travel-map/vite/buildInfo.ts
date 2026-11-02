import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "zod";

/**
 * Reads the commit being built. The Docker build context excludes `.git`, and a
 * source archive has none either, so a missing commit is normal, not a failure.
 * @param {string} appDir - The app's directory
 * @returns {string | undefined} The short commit, or undefined when unknown
 */
function readShortCommit(appDir: string): string | undefined {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: appDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

/**
 * Builds the Vite `define` entries naming this build. They are `import.meta.env`
 * keys so `shared/lib/env.ts` validates them with every other build-time value.
 * @param {string} appDir - The app's directory
 * @returns {Record<string, string>} The define entries
 */
export function buildInfoDefine(appDir: string): Record<string, string> {
  const { version } = z
    .object({ version: z.string().min(1) })
    .parse(JSON.parse(readFileSync(resolve(appDir, "package.json"), "utf8")));
  const commit = readShortCommit(appDir);

  return {
    "import.meta.env.VITE_BUILD_DATE": JSON.stringify(new Date().toISOString()),
    "import.meta.env.VITE_BUILD_VERSION": JSON.stringify(version),
    ...(commit
      ? { "import.meta.env.VITE_BUILD_COMMIT": JSON.stringify(commit) }
      : {}),
  };
}
