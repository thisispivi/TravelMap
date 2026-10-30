import { readFile } from "node:fs/promises";

import type { Plugin, ViteDevServer } from "vite";

import { resolveOwnedPath } from "./files.ts";
import { sendError } from "./http.ts";

/**
 * Serves the public app's flag pack at the path the site serves it from.
 * Components the editor borrows from the site, such as the language menu, ask
 * for `/flags/<Country>.svg`, and the editor keeps its own public directory for
 * its favicons and translations, so without this those flags never load.
 * @param {string} flagsRoot - Absolute path of the site's flag directory
 * @returns {Plugin} Vite dev-server plugin
 */
export function siteFlags(flagsRoot: string): Plugin {
  return {
    name: "travel-map-site-flags",
    apply: "serve",

    /**
     * Answers `/flags/<Country>.svg` from the site's pack, passing anything
     * else, or a flag the pack lacks, on to Vite.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      server.middlewares.use("/flags", async (request, response, next) => {
        /* Left encoded: a flag name is plain letters, so an escape never matches. */
        const name = new URL(
          request.url ?? "",
          "http://localhost",
        ).pathname.slice(1);
        if (request.method !== "GET" || !/^[A-Za-z]+\.svg$/.test(name)) {
          next();
          return;
        }
        try {
          const svg = await readFile(await resolveOwnedPath(flagsRoot, name));
          response.setHeader("Content-Type", "image/svg+xml");
          response.end(svg);
        } catch (error) {
          if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
          )
            next();
          else sendError(response, error, "The flag could not be read.");
        }
      });
    },
  };
}
