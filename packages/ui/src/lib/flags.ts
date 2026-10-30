/*
 * Only the file names are read here, to know which flags exist; the flags
 * themselves are served at /flags by the shared Vite preset.
 */
const flagFiles = import.meta.glob("../../public/flags/*.svg");

/** The name of every flag in the pack, such as `Italy` or `UnitedKingdom`. */
export const FLAG_NAMES: ReadonlySet<string> = new Set(
  Object.keys(flagFiles).map((path) =>
    path.slice(path.lastIndexOf("/") + 1, -".svg".length),
  ),
);

/**
 * Names the public URL of one flag in the pack.
 * @param {string} name - The flag's name, a country id
 * @returns {string} Its URL
 */
export function flagUrl(name: string): string {
  return `/flags/${name}.svg`;
}
