import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

import type { Plugin, ViteDevServer } from "vite";

import { SnapshotBundleSchema } from "../src/features/backup/lib/snapshot.ts";
import {
  assertLocalRequest,
  errorBody,
  readJsonBody,
  sendJson,
} from "./http.ts";

/* Enough history to undo a bad session without filling the disk. */
const SNAPSHOT_LIMIT = 30;

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
          assertLocalRequest(request);
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
              SnapshotBundleSchema.parse(
                JSON.parse(await readFile(path, "utf8")),
              ),
            );
            return;
          }
          if (request.method === "POST") {
            const bundle = await readJsonBody(
              request,
              SnapshotBundleSchema,
              15_000_000,
            );
            await writeFile(path, `${JSON.stringify(bundle, null, 2)}\n`);
            await prune(snapshotRoot);
            sendJson(response, 200, { name, ok: true });
            return;
          }
          sendJson(response, 404, { error: "Unknown snapshot endpoint." });
        } catch (error) {
          sendJson(response, 500, errorBody(error, "Snapshot request failed."));
        }
      });
    },
  };
}
