import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import { type Zippable, zipSync } from "fflate";
import type { Plugin, ViteDevServer } from "vite";

import { assertLocalRequest, sendError, sendJson } from "./http.ts";

/**
 * Adds every regular file under a directory to a zip, keyed by its path inside
 * `data/`. Links are never followed, so one cannot pull a file from outside the
 * dataset into the archive; `readdir`'s own `recursive` option does follow
 * them. The `.tmp` files an interrupted atomic write leaves behind are skipped.
 * @param {string} dataRoot - Absolute dataset directory
 * @param {string} directory - Absolute directory being walked
 * @param {Zippable} files - The archive's entries, filled in place
 * @returns {Promise<void>} Completion once the directory is read
 */
async function addDirectory(
  dataRoot: string,
  directory: string,
  files: Zippable,
): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await addDirectory(dataRoot, path, files);
    else if (entry.isFile() && !entry.name.endsWith(".tmp"))
      files[`data/${relative(dataRoot, path).split(sep).join("/")}`] =
        await readFile(path);
  }
}

/**
 * Serves the whole dataset, logos and photo manifests included, as one zip the
 * author can keep somewhere other than this machine.
 * @param {string} dataRoot - Absolute dataset directory
 * @returns {Plugin} Serve-only Vite plugin
 */
export function dataExport(dataRoot: string): Plugin {
  return {
    name: "data-export",
    apply: "serve",

    /**
     * Installs the download endpoint on the development server.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      server.middlewares.use("/__export", async (request, response) => {
        try {
          assertLocalRequest(request);
          if (request.method !== "GET") {
            sendJson(response, 405, { error: "Use GET to export the data." });
            return;
          }
          const files: Zippable = {};
          await addDirectory(dataRoot, dataRoot, files);
          const archive = zipSync(files);
          const day = new Date().toISOString().slice(0, 10);
          response.writeHead(200, {
            "Content-Disposition": `attachment; filename="travelmap-data-${day}.zip"`,
            "Content-Length": archive.byteLength,
            "Content-Type": "application/zip",
          });
          response.end(archive);
        } catch (error) {
          sendError(response, error, "The data could not be exported.");
        }
      });
    },
  };
}
