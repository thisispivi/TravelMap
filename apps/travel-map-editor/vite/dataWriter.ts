import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

/**
 * Payload accepted by the local JSON writer endpoints.
 * @property {string} path - Dataset-relative JSON path
 * @property {unknown} [value] - Serializable JSON value to write
 */
interface WritePayload {
  path: string;
  value?: unknown;
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
  if (!relativePath.endsWith(".json") || !path.startsWith(`${dataRoot}${sep}`)) {
    throw new Error("Only JSON files inside data/ can be changed.");
  }
  return path;
}

/**
 * Sends a concise JSON response from the localhost-only editor middleware.
 * @param {ServerResponse} response - HTTP response
 * @param {number} status - HTTP status code
 * @param {object} body - JSON response body
 * @returns {void}
 */
function sendJson(response: ServerResponse, status: number, body: object): void {
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
    configureServer(server) {
      server.middlewares.use("/__data", async (request, response) => {
        if (request.method !== "POST") return;
        try {
          const payload = await readPayload(request);
          const path = resolveDataPath(dataRoot, payload.path);
          if (request.url === "/write") {
            await mkdir(dirname(path), { recursive: true });
            await writeFile(path, `${JSON.stringify(payload.value, null, 2)}\n`);
            sendJson(response, 200, { ok: true });
            return;
          }
          if (request.url === "/delete") {
            await rm(path);
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
