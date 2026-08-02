import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import { join, resolve, sep } from "node:path";

import type { Plugin, ViteDevServer } from "vite";

/**
 * A complete copy of every authored JSON document, kept outside `data/`.
 * `data/` is gitignored, so this is the only thing standing between an
 * authoring mistake and content that cannot be recovered from anywhere.
 * @property {string} createdAt - ISO timestamp the snapshot was taken
 * @property {string} reason - Why it was taken, shown when restoring
 * @property {{ path: string; value: unknown }[]} documents - Every document
 */
interface SnapshotBundle {
  createdAt: string;
  reason: string;
  documents: { path: string; value: unknown }[];
}

/* Enough history to undo a bad session without filling the disk. */
const SNAPSHOT_LIMIT = 30;

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
 * Rejects a snapshot name that could escape the snapshot directory.
 * @param {string} name - Requested snapshot file name
 * @returns {boolean} Whether the name is a plain file name
 */
function isSafeName(name: string): boolean {
  return /^[A-Za-z0-9._-]+\.json$/.test(name) && !name.startsWith(".");
}

/**
 * Deletes the oldest snapshots once the directory outgrows its cap.
 * @param {string} directory - Absolute snapshot directory
 * @returns {Promise<void>} Completion once pruning is done
 */
async function prune(directory: string): Promise<void> {
  const names = (await readdir(directory)).filter((name) =>
    name.endsWith(".json"),
  );
  /* Names begin with an ISO timestamp, so lexical order is chronological. */
  for (const name of names.toSorted().slice(0, -SNAPSHOT_LIMIT))
    await rm(join(directory, name));
}

/**
 * Serves snapshot storage for the editor's backup and restore.
 * @param {string} snapshotRoot - Absolute directory snapshots are kept in
 * @returns {Plugin} Serve-only Vite plugin
 */
export function snapshots(snapshotRoot: string): Plugin {
  return {
    name: "snapshots",
    apply: "serve",

    /**
     * Installs the snapshot list, read, and write endpoints.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      server.middlewares.use("/__snapshots", async (request, response) => {
        try {
          await mkdir(snapshotRoot, { recursive: true });
          const url = new URL(request.url ?? "/", "http://localhost");
          const name = url.searchParams.get("name") ?? "";

          if (request.method === "GET" && !name) {
            const names = (await readdir(snapshotRoot))
              .filter((entry) => entry.endsWith(".json"))
              .toSorted()
              .toReversed();
            sendJson(response, 200, { snapshots: names });
            return;
          }
          if (!isSafeName(name)) {
            sendJson(response, 400, { error: "Invalid snapshot name." });
            return;
          }

          const path = resolve(snapshotRoot, name);
          if (!path.startsWith(`${snapshotRoot}${sep}`)) {
            sendJson(response, 400, { error: "Invalid snapshot name." });
            return;
          }
          if (request.method === "GET") {
            sendJson(
              response,
              200,
              JSON.parse(await readFile(path, "utf8")) as SnapshotBundle,
            );
            return;
          }
          if (request.method === "POST") {
            const chunks: Uint8Array[] = [];
            for await (const chunk of request) chunks.push(chunk as Uint8Array);
            const bundle = JSON.parse(
              Buffer.concat(chunks).toString(),
            ) as SnapshotBundle;
            await writeFile(path, `${JSON.stringify(bundle, null, 2)}\n`);
            await prune(snapshotRoot);
            sendJson(response, 200, { name, ok: true });
            return;
          }
          sendJson(response, 404, { error: "Unknown snapshot endpoint." });
        } catch (error) {
          sendJson(response, 500, {
            error:
              error instanceof Error
                ? error.message
                : "Snapshot request failed.",
          });
        }
      });
    },
  };
}
