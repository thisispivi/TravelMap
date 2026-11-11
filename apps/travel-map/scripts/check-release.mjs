/*
 * Runs before `deploygh`: GitHub Pages only ever serves a released main, so the
 * checkout must be a clean, up-to-date main whose version the Release workflow
 * has already tagged.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * Runs git and returns its trimmed output.
 * @param {...string} args - Git arguments
 * @returns {string} Standard output
 */
function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

/**
 * Stops the deploy with a reason.
 * @param {string} reason - Why nothing is published
 * @returns {never} Never returns
 */
function stop(reason) {
  console.error(`✗ ${reason} Nothing was published.`);
  process.exit(1);
}

git("fetch", "--quiet", "--tags", "origin", "main");
if (git("branch", "--show-current") !== "main")
  stop("Deploys start from main.");
if (git("status", "--porcelain", "--untracked-files=no")) {
  stop("Commit or stash your changes first.");
}
if (git("rev-parse", "HEAD") !== git("rev-parse", "origin/main")) {
  stop("main is not in sync with origin/main: pull or push first.");
}
const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
try {
  git("rev-parse", "--quiet", "--verify", `refs/tags/v${version}`);
} catch {
  stop(
    `v${version} is not released yet: wait for the Release workflow on main.`,
  );
}
