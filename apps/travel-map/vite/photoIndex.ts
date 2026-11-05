import { readFileSync } from "node:fs";

import type { Plugin } from "vite";
import { z } from "zod";

import {
  hasSource,
  ImageSchema,
} from "../../../packages/core/src/schema/index.ts";

/** The import query that asks for a manifest's publish flags instead of its entries. */
const PHOTO_INDEX_QUERY = "photo-index";

/**
 * Reduces a photo manifest to one character per entry, `1` where it can be
 * published, so the world graph can count every visit's photos without the
 * entry chunk carrying thousands of paths. The full manifest is still bundled,
 * as its own chunk the album loads on demand. A malformed manifest stops the
 * build here, naming the file, rather than surfacing on the first page load.
 * @returns {Plugin} Vite plugin answering `*.json?photo-index` imports
 */
export function photoIndex(): Plugin {
  return {
    name: "photo-index",
    enforce: "pre",

    /**
     * Loads a manifest as a module exporting its publish flags. The module type
     * is stated because the `.json` extension would otherwise send the code to
     * the JSON parser.
     * @param {string} id - The resolved module id
     * @returns {{ code: string; moduleType: "js" } | undefined} The module, or nothing for other ids
     */
    load(id): { code: string; moduleType: "js" } | undefined {
      const [path, query] = id.split("?");
      if (query !== PHOTO_INDEX_QUERY || !path) return;

      const parsed = ImageSchema.array().safeParse(
        JSON.parse(readFileSync(path, "utf8")),
      );
      if (!parsed.success)
        throw new Error(`${path}: ${z.prettifyError(parsed.error)}`);
      const flags = parsed.data
        .map((image) => (hasSource(image) ? "1" : "0"))
        .join("");
      return {
        code: `export default ${JSON.stringify(flags)};`,
        moduleType: "js",
      };
    },
  };
}
