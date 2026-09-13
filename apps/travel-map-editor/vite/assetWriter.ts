import { mkdir, writeFile } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";

import type { Plugin, ViteDevServer } from "vite";
import { z } from "zod";

import {
  assertLocalRequest,
  errorBody,
  readJsonBody,
  sendJson,
} from "./http.ts";

const ALLOWED_EXTENSIONS = new Set([".svg", ".png"]);

/** Payload accepted by the local asset writer endpoint. */
const WritePayloadSchema = z.strictObject({
  base64: z
    .string()
    .min(1)
    .max(6_000_000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  filename: z.string().trim().min(1).max(128),
});

/**
 * Returns a logo file path only when the filename is a bare, allowed-extension
 * name that stays inside the configured logos root.
 * @param {string} logosRoot - Absolute dataset logos directory
 * @param {string} filename - User-supplied destination filename
 * @returns {string} Validated absolute logo file path
 */
function resolveLogoPath(logosRoot: string, filename: string): string {
  const path = resolve(logosRoot, filename);
  const pathFromRoot = relative(logosRoot, path);
  if (
    filename.includes("/") ||
    filename.includes("\\") ||
    !ALLOWED_EXTENSIONS.has(extname(filename).toLowerCase()) ||
    pathFromRoot.startsWith("..") ||
    isAbsolute(pathFromRoot)
  ) {
    throw new Error("Only a bare .svg or .png filename can be written.");
  }
  return path;
}

/**
 * Rejects mislabeled PNGs and SVG features that can execute or load remote
 * content when somebody opens an uploaded logo directly.
 * @param {string} filename - Validated destination filename
 * @param {Buffer} content - Decoded asset bytes
 * @returns {void}
 */
function validateAssetContent(filename: string, content: Buffer): void {
  if (extname(filename).toLowerCase() === ".png") {
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (
      content.length < pngSignature.length ||
      !content.subarray(0, 8).equals(pngSignature)
    )
      throw new Error("The uploaded file is not a valid PNG.");
    return;
  }

  const svg = content.toString("utf8");
  if (
    !/<svg\b/i.test(svg) ||
    /<!DOCTYPE|<!ENTITY/i.test(svg) ||
    /<(?:script|foreignObject|iframe|object|embed)\b/i.test(svg) ||
    /\son[a-z]+\s*=/i.test(svg) ||
    /(?:href|src)\s*=\s*["']\s*(?:https?:|javascript:|data:)/i.test(svg) ||
    /(?:@import|url\()\s*["']?\s*(?:https?:|data:)/i.test(svg)
  )
    throw new Error("The uploaded SVG contains unsupported active content.");
}

/**
 * Provides a local-only endpoint for writing uploaded transport-company logos
 * into the dataset, so a fork owner can add a company without touching the
 * filesystem by hand.
 * @param {string} logosRoot - Absolute path of the dataset's logos directory
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
      /*
       * logos/ lives outside the editor's Vite root, so without this it stays
       * unwatched and a newly uploaded logo never reaches dataset.ts's eager
       * glob, no matter how hard the browser reloads.
       */
      server.watcher.add(logosRoot);

      server.middlewares.use("/__assets/write", async (request, response) => {
        if (request.method !== "POST") return;
        try {
          assertLocalRequest(request);
          const payload = await readJsonBody(
            request,
            WritePayloadSchema,
            6_100_000,
          );
          const path = resolveLogoPath(logosRoot, payload.filename);
          const content = Buffer.from(payload.base64, "base64");
          validateAssetContent(payload.filename, content);
          await mkdir(logosRoot, { recursive: true });
          await writeFile(path, content);
          sendJson(response, 200, { path: `/logos/${payload.filename}` });
        } catch (error) {
          sendJson(response, 400, errorBody(error, "Invalid request."));
        }
      });
    },
  };
}
