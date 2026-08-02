import {
  mkdir,
  readdir,
  readFile,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, resolve, sep } from "node:path";

import type { Plugin, ViteDevServer } from "vite";

/**
 * Payload accepted by the local JSON writer endpoints.
 * @property {string} path - Dataset-relative JSON path
 * @property {unknown} [value] - Serializable JSON value to write
 * @property {unknown} [base] - What the editor believes is currently on disk
 */
interface WritePayload {
  path: string;
  value?: unknown;
  base?: unknown;
}

/**
 * Reads a JSON request body without adding a server dependency to the editor.
 * @param {IncomingMessage} request - Incoming HTTP request
 * @returns {Promise<WritePayload>} Parsed local editor payload
 */
async function readPayload(request: IncomingMessage): Promise<WritePayload> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) chunks.push(chunk as Uint8Array);
  return JSON.parse(Buffer.concat(chunks).toString()) as WritePayload;
}

/**
 * Returns a dataset file only when it remains inside the configured data root.
 * @param {string} dataRoot - Absolute data directory
 * @param {string} relativePath - User-supplied dataset-relative path
 * @returns {string} Validated absolute JSON file path
 */
function resolveDataPath(dataRoot: string, relativePath: string): string {
  const path = resolve(dataRoot, relativePath);
  if (
    !relativePath.endsWith(".json") ||
    !path.startsWith(`${dataRoot}${sep}`)
  ) {
    throw new Error("Only JSON files inside data/ can be changed.");
  }
  return path;
}

/**
 * Removes directories left empty by a delete, stopping at the data root.
 * A country lives at `<Id>/<Id>.json` and a city at `<Country>/<Id>/<Id>.json`,
 * so deleting one would otherwise strand an empty folder that still reads as an
 * existing entity to anyone browsing the dataset.
 * @param {string} dataRoot - Absolute data directory
 * @param {string} directory - Directory the deleted file lived in
 * @returns {Promise<void>} Completion once empty parents are gone
 */
async function pruneEmptyDirectories(
  dataRoot: string,
  directory: string,
): Promise<void> {
  let current = directory;
  while (current.startsWith(`${dataRoot}${sep}`)) {
    const entries = await readdir(current);
    if (entries.length > 0) return;
    await rmdir(current);
    current = dirname(current);
  }
}

/**
 * Reports whether the file on disk still holds what the editor last read.
 * Compares parsed values rather than raw text so a hand-formatted file is not
 * mistaken for a conflict. This is the guard that stops a browser tab holding a
 * stale draft from silently overwriting a change made outside it — including
 * one made by another tab of the editor itself.
 * @param {string} path - Absolute JSON file path
 * @param {unknown} base - What the editor believes is currently on disk
 * @returns {Promise<boolean>} Whether the write may proceed
 */
async function isUnchanged(path: string, base: unknown): Promise<boolean> {
  let existing: string;
  try {
    existing = await readFile(path, "utf8");
  } catch {
    /* A file that does not exist yet cannot have been changed under us. */
    return true;
  }
  try {
    return JSON.stringify(JSON.parse(existing)) === JSON.stringify(base);
  } catch {
    return false;
  }
}

/**
 * Sends a concise JSON response from the localhost-only editor middleware.
 * @param {ServerResponse} response - HTTP response
 * @param {number} status - HTTP status code
 * @param {object} body - JSON response body
 * @returns {void}
 */
function sendJson(
  response: ServerResponse,
  status: number,
  body: object,
): void {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

/**
 * Provides local-only endpoints for writing the fork's JSON dataset.
 * @param {string} dataRoot - Absolute path of the repository data directory
 * @returns {Plugin} Serve-only Vite plugin
 */
export function dataWriter(dataRoot: string): Plugin {
  return {
    name: "data-writer",
    apply: "serve",

    /**
     * Installs the local JSON endpoints on the development server.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      // data/ lives outside the editor's Vite root, so only the JSON files
      // already in the module graph are watched. Without this the directory is
      // unwatched and a newly created country or city never reaches the eager
      // globs, no matter how hard the browser reloads.
      server.watcher.add(dataRoot);

      server.middlewares.use("/__data", async (request, response) => {
        if (request.method !== "POST") return;
        try {
          const payload = await readPayload(request);
          const path = resolveDataPath(dataRoot, payload.path);
          if (request.url === "/write") {
            if (
              payload.base !== undefined &&
              !(await isUnchanged(path, payload.base))
            ) {
              sendJson(response, 409, {
                error:
                  "This file changed on disk since the editor read it. Reload the editor to pick up the change before saving.",
              });
              return;
            }
            await mkdir(dirname(path), { recursive: true });
            await writeFile(
              path,
              `${JSON.stringify(payload.value, null, 2)}\n`,
            );
            sendJson(response, 200, { ok: true });
            return;
          }
          if (request.url === "/delete") {
            await rm(path);
            await pruneEmptyDirectories(dataRoot, dirname(path));
            sendJson(response, 200, { ok: true });
            return;
          }
          sendJson(response, 404, { error: "Unknown local data endpoint." });
        } catch (error) {
          sendJson(response, 400, {
            error: error instanceof Error ? error.message : "Invalid request.",
          });
        }
      });
    },
  };
}
