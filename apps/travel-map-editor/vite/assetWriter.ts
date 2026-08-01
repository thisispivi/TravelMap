import { mkdir, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, resolve, sep } from "node:path";

import type { Plugin, ViteDevServer } from "vite";

const ALLOWED_EXTENSIONS = new Set([".svg", ".png"]);

/**
 * Payload accepted by the local asset writer endpoint.
 * @property {string} filename - Destination filename, no directory segments
 * @property {string} base64 - The file's contents, base64-encoded
 */
interface WritePayload {
  filename: string;
  base64: string;
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
 * Returns a logo file path only when the filename is a bare, allowed-extension
 * name that stays inside the configured logos root.
 * @param {string} logosRoot - Absolute public/logos directory
 * @param {string} filename - User-supplied destination filename
 * @returns {string} Validated absolute logo file path
 */
function resolveLogoPath(logosRoot: string, filename: string): string {
  const path = resolve(logosRoot, filename);
  if (
    filename.includes("/") ||
    filename.includes("\\") ||
    !ALLOWED_EXTENSIONS.has(extname(filename).toLowerCase()) ||
    !path.startsWith(`${logosRoot}${sep}`)
  ) {
    throw new Error("Only a bare .svg or .png filename can be written.");
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
function sendJson(
  response: ServerResponse,
  status: number,
  body: object,
): void {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

/**
 * Provides a local-only endpoint for writing uploaded transport-company logos
 * into the public app's static assets, so a fork owner can add a company
 * without touching the filesystem by hand.
 * @param {string} logosRoot - Absolute path of the public app's logos directory
 * @returns {Plugin} Serve-only Vite plugin
 */
export function assetWriter(logosRoot: string): Plugin {
  return {
    name: "asset-writer",
    apply: "serve",

    /**
     * Installs the local logo-upload endpoint on the development server.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      // logos/ lives outside the editor's Vite root, so without this it stays
      // unwatched and a newly uploaded logo never reaches dataset.ts's eager
      // glob, no matter how hard the browser reloads.
      server.watcher.add(logosRoot);

      server.middlewares.use("/__assets/write", async (request, response) => {
        if (request.method !== "POST") return;
        try {
          const payload = await readPayload(request);
          const path = resolveLogoPath(logosRoot, payload.filename);
          await mkdir(logosRoot, { recursive: true });
          await writeFile(path, Buffer.from(payload.base64, "base64"));
          sendJson(response, 200, { path: `/logos/${payload.filename}` });
        } catch (error) {
          sendJson(response, 400, {
            error: error instanceof Error ? error.message : "Invalid request.",
          });
        }
      });
    },
  };
}
