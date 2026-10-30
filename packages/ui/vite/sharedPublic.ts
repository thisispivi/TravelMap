import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

import type { Plugin, ViteDevServer } from "vite";

const MEDIA_TYPES: Record<string, string> = {
  ".json": "application/json",
  ".pbf": "application/x-protobuf",
  ".svg": "image/svg+xml",
};

/**
 * Lists every file below a directory, as paths relative to it with forward
 * slashes, the form a URL and an emitted asset name both use.
 * @param {string} root - The directory to walk
 * @returns {string[]} The relative file paths
 */
function listFiles(root: string): string[] {
  return readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((path) => statSync(resolve(root, path)).isFile())
    .map((path) => path.split(sep).join("/"));
}

/**
 * Reads the shared file's relative path out of a request URL.
 * @param {string} url - The request URL
 * @returns {string | undefined} The path without its leading slash, unless malformed
 */
function requestedPath(url: string): string | undefined {
  try {
    return decodeURI(new URL(url, "http://localhost").pathname).slice(1);
  } catch {
    /* A malformed path is not a shared file; Vite answers it. */
    return undefined;
  }
}

/**
 * Serves the shared public files (flags, map glyphs, common translations) next
 * to each app's own public directory, which Vite allows only one of. The dev
 * server answers them from the UI package, and a build copies them into the
 * output at the same paths, so `/flags/Italy.svg` works the same in both apps.
 * @param {string} publicRoot - The UI package's public directory
 * @returns {Plugin} The Vite plugin
 */
export function sharedPublic(publicRoot: string): Plugin {
  return {
    name: "travel-map-shared-public",

    /**
     * Answers a request for a shared file, passing anything else on to Vite.
     * @param {ViteDevServer} server - The dev server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      /*
       * Listed once rather than checked on disk per request, since every
       * module the dev server answers passes through here. Only a listed path
       * is ever read, so a request cannot leave the directory. A file added
       * meanwhile needs a restart.
       */
      const files = new Set(listFiles(publicRoot));
      server.middlewares.use((request, response, next) => {
        const path = requestedPath(request.url ?? "");
        const contentType = path ? MEDIA_TYPES[extname(path)] : undefined;
        if (
          request.method !== "GET" ||
          !path ||
          !files.has(path) ||
          !contentType
        ) {
          next();
          return;
        }
        response.setHeader("Content-Type", contentType);
        response.end(readFileSync(resolve(publicRoot, path)));
      });
    },

    /**
     * Copies every shared file into the build output at its public path.
     * @returns {void}
     */
    generateBundle(): void {
      for (const fileName of listFiles(publicRoot))
        this.emitFile({
          fileName,
          source: readFileSync(resolve(publicRoot, fileName)),
          type: "asset",
        });
    },
  };
}
