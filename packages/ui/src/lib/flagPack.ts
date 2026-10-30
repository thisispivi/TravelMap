import { flagNameOf } from "./flags";

/*
 * Only the file names are read here, to know which flags exist; the flags
 * themselves are served at /flags by the shared Vite preset. This stays apart
 * from `flags.ts` because the glob emits a chunk per flag into any bundle that
 * imports it, and the site only ever needs a flag's URL.
 */
const flagFiles = import.meta.glob("../../public/flags/*.svg");

const FLAG_NAMES: ReadonlySet<string> = new Set(
  Object.keys(flagFiles).map((path) =>
    path.slice(path.lastIndexOf("/") + 1, -".svg".length),
  ),
);

/**
 * Tells whether the pack has a flag for a country id.
 * @param {string} countryId - The country id
 * @returns {boolean} Whether `flagUrl` leads to a real file
 */
export function hasFlag(countryId: string): boolean {
  return FLAG_NAMES.has(flagNameOf(countryId));
}
