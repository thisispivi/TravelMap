import { readdir, readFile, rm, rmdir } from "node:fs/promises";
import { dirname, sep } from "node:path";
import { isDeepStrictEqual } from "node:util";

import type { Plugin, ViteDevServer } from "vite";
import { z } from "zod";

import {
  DatasetDocumentSchema,
  DatasetPathSchema,
} from "../../../packages/core/src/schema/document.ts";
import { resolveOwnedPath, writeAtomically } from "./files.ts";
import {
  assertLocalRequest,
  readJsonBody,
  RequestError,
  sendError,
  sendJson,
} from "./http.ts";

/** Payload accepted by the local JSON writer endpoints. */
const WritePayloadSchema = z.strictObject({
  base: z.unknown().optional(),
  path: DatasetPathSchema,
  value: z.unknown().optional(),
});

/**
 * Reports whether a URL is an HTTPS Google Maps destination. Redirects are
 * checked before each request so a short link cannot pivot into an internal
 * service or arbitrary third-party host.
 * @param {URL} url - Redirect target to inspect
 * @returns {boolean} Whether the editor may request the URL
 */
function isGoogleMapsUrl(url: URL): boolean {
  return (
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    !url.port &&
    (url.hostname === "goo.gl" ||
      url.hostname === "maps.app.goo.gl" ||
      url.hostname === "google.com" ||
      url.hostname.endsWith(".google.com"))
  );
}

/**
 * Resolves a Google Maps short link while re-validating every redirect target.
 * @param {URL} initialUrl - Validated short link
 * @returns {Promise<string>} Final Google Maps URL
 */
async function resolveGoogleMapsUrl(initialUrl: URL): Promise<string> {
  let current = initialUrl;
  for (let redirectCount = 0; redirectCount < 5; redirectCount += 1) {
    if (!isGoogleMapsUrl(current))
      throw new RequestError("Only Google Maps share links can be resolved.");

    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) return response.url;
    current = new URL(location, current);
  }
  throw new RequestError("Google Maps link redirected too many times.");
}

/**
 * Removes directories left empty by a delete, stopping at the data root.
 * A country lives at `cities/<Id>/<Id>.json` and a city at
 * `cities/<Country>/<Id>/<Id>.json`, so deleting one would otherwise strand an
 * empty folder that still reads as an existing entity to anyone browsing the
 * dataset.
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
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return base === null;
    throw error;
  }
  try {
    return isDeepStrictEqual(JSON.parse(existing), base);
  } catch {
    return false;
  }
}

/**
 * Provides local-only endpoints for writing the fork's JSON dataset.
 * @param {string} dataRoot - Absolute path of the repository data directory
 * @returns {Plugin} Serve-only Vite plugin
 */
export function dataWriter(dataRoot: string): Plugin {
  /* Serialize the conflict check and write across tabs; a rejected write cannot block the queue. */
  let pending = Promise.resolve();
  return {
    name: "data-writer",
    apply: "serve",

    /**
     * Installs the local JSON endpoints on the development server.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      /*
       * data/ lives outside the editor's Vite root. Watching it explicitly is
       * what lets newly created documents reach the eager globs after reload.
       */
      server.watcher.add(dataRoot);

      server.middlewares.use("/__data", async (request, response) => {
        try {
          assertLocalRequest(request);
          if (
            request.method === "GET" &&
            request.url?.startsWith("/resolve-map-link")
          ) {
            const requestUrl = new URL(request.url, "http://localhost");
            const target = URL.parse(requestUrl.searchParams.get("url") ?? "");
            if (
              !target ||
              (target.hostname !== "goo.gl" &&
                target.hostname !== "maps.app.goo.gl")
            )
              throw new RequestError(
                "Only Google Maps share links can be resolved.",
              );
            const resolvedUrl = await resolveGoogleMapsUrl(target);
            sendJson(response, 200, { url: resolvedUrl });
            return;
          }
          if (request.method !== "POST") {
            sendJson(response, 405, { error: "Use POST for dataset changes." });
            return;
          }
          const payload = await readJsonBody(request, WritePayloadSchema);
          const operation = pending.then(async () => {
            const path = await resolveOwnedPath(dataRoot, payload.path);
            if (
              payload.base !== undefined &&
              !(await isUnchanged(path, payload.base))
            ) {
              sendJson(response, 409, {
                error:
                  "This file changed on disk since the editor read it. Reload before saving or deleting it.",
              });
              return;
            }
            if (request.url === "/write") {
              if (payload.value === undefined)
                throw new RequestError("A write request must include a value.");
              const document = DatasetDocumentSchema.parse({
                path: payload.path,
                value: payload.value,
              });
              await writeAtomically(
                path,
                `${JSON.stringify(document.value, null, 2)}\n`,
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
          });
          pending = operation.catch(() => undefined);
          await operation;
        } catch (error) {
          sendError(response, error, "The dataset could not be updated.");
        }
      });
    },
  };
}
