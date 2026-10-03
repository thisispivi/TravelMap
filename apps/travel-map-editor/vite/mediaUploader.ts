import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { readFile, rm, stat } from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";

import { type Image } from "@travelmap/core";
import sharp from "sharp";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { loadEnv } from "vite";
import { z } from "zod";

import { resolveOwnedPath, writeAtomically } from "./files.ts";
import {
  assertLocalRequest,
  errorBody,
  RequestError,
  sendJson,
} from "./http.ts";

const run = promisify(execFile);

/* A phone video runs to a few hundred megabytes; anything larger is a mistake. */
const UPLOAD_LIMIT_BYTES = 300 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
  ".heic",
  ".avif",
]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".avi", ".mkv", ".flv"]);
const DEFAULT_MEDIA_ROOT = "/Travels";

/**
 * A size window and resolution for one encoded variant, in the same units the
 * Python uploader's `example.env` used so an existing configuration carries over.
 * @property {number} minKb - Smallest acceptable file size in kilobytes
 * @property {number} maxKb - Largest acceptable file size in kilobytes
 * @property {number} resolution - Longest edge in pixels
 */
export interface VariantSettings {
  minKb: number;
  maxKb: number;
  resolution: number;
}

/**
 * Where an upload is going and how its variants are encoded.
 * @property {VariantSettings} compressed - The full-size gallery image
 * @property {VariantSettings} thumbnail - The small preview
 * @property {BunnySettings | null} bunny - Bunny Storage credentials, when configured
 */
interface UploadSettings {
  compressed: VariantSettings;
  thumbnail: VariantSettings;
  bunny: BunnySettings | null;
}

/**
 * Bunny Storage credentials. Read on the server only and never sent to the
 * browser, which is why none of them carries Vite's `VITE_` prefix.
 * @property {string} zone - Storage zone name
 * @property {string} region - Storage region, empty for the default
 * @property {string} key - Storage zone API key
 * @property {string} basePath - Folder inside the zone that mirrors the media root
 */
interface BunnySettings {
  zone: string;
  region: string;
  key: string;
  basePath: string;
}

/** A folder or file name segment: no separators, no dot-only names. */
const SegmentSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[^/\\:*?"<>|]+$/)
  .refine((value) => value !== "." && value !== "..");

const UploadQuerySchema = z.strictObject({
  city: SegmentSchema,
  country: SegmentSchema,
  name: z.string().trim().min(1).max(200),
  target: z.enum(["local", "bunny"]),
});

const SiteMediaSchema = z.looseObject({
  media: z.looseObject({ root: z.string().trim().min(1) }).optional(),
});

/**
 * Reduces a width and height to their smallest whole ratio, which is what the
 * gallery stores: it only needs the shape, not the pixel count.
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {{ width: number; height: number }} The reduced ratio
 */
export function reduceRatio(
  width: number,
  height: number,
): { width: number; height: number } {
  /**
   * Finds the greatest common divisor.
   * @param {number} a - First value
   * @param {number} b - Second value
   * @returns {number} Their greatest common divisor
   */
  const divisor = (a: number, b: number): number =>
    b === 0 ? a : divisor(b, a % b);
  const common = divisor(width, height) || 1;
  return { height: height / common, width: width / common };
}

/**
 * Turns an uploaded file's name into a safe, stable file stem, so uploading
 * the same photo twice overwrites rather than duplicates it.
 * @param {string} name - The original file name
 * @returns {string} A stem of letters, digits, dots, dashes and underscores
 */
export function safeStem(name: string): string {
  const stem = (name.split(/[\\/]/).pop() ?? "")
    .replace(/\.[^.]*$/, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^[-.]+|-+$/g, "");
  return stem || "photo";
}

/**
 * Encodes one WEBP variant, stepping quality down from 100 until the file
 * fits the size window — the same rule the Python uploader followed, so a
 * gallery made either way looks the same. A small source is kept at full
 * quality instead of being crushed to reach a minimum it can never hit.
 * @param {Buffer} source - The decoded-orientation source bytes
 * @param {VariantSettings} settings - Size window and resolution
 * @returns {Promise<Buffer>} The encoded WEBP
 */
export async function encodeWithinSize(
  source: Buffer,
  settings: VariantSettings,
): Promise<Buffer> {
  const resized = sharp(source)
    .rotate()
    .resize(settings.resolution, settings.resolution, {
      fit: "inside",
      withoutEnlargement: true,
    });
  let encoded = await resized.clone().webp({ quality: 100 }).toBuffer();
  if (source.byteLength / 1024 < settings.minKb) return encoded;

  for (let quality = 100; quality > 5; quality -= 5) {
    encoded = await resized.clone().webp({ quality }).toBuffer();
    const kb = encoded.byteLength / 1024;
    if (kb <= settings.maxKb || kb < settings.minKb) break;
  }
  return encoded;
}

/**
 * Reads the encoding and Bunny settings from the editor's env directory.
 * @param {Record<string, string>} env - Loaded environment values
 * @returns {UploadSettings} The resolved settings
 */
function readSettings(env: Record<string, string>): UploadSettings {
  /**
   * Reads one positive integer setting.
   * @param {string} key - The variable name
   * @param {number} fallback - Value used when it is unset
   * @returns {number} The setting
   */
  const number = (key: string, fallback: number): number => {
    const value = Number(env[key] ?? fallback);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };
  const zone = env.CDN_STORAGE_ZONE_NAME ?? "";
  const region = env.CDN_STORAGE_ZONE_REGION ?? "";
  const key = env.CDN_STORAGE_ZONE_API_KEY ?? "";
  const isBunnyValid =
    /^[a-zA-Z0-9-]+$/.test(zone) &&
    key !== "" &&
    /^[a-zA-Z0-9-]*$/.test(region);

  return {
    bunny: isBunnyValid
      ? {
          basePath: (env.CDN_BASE_STORAGE_PATH ?? "").replace(/^\/+|\/+$/g, ""),
          key,
          region,
          zone,
        }
      : null,
    compressed: {
      maxKb: number("COMPRESSED_MAX_SIZE", 1500),
      minKb: number("COMPRESSED_MIN_SIZE", 750),
      resolution: number("COMPRESSED_RESOLUTION", 2000),
    },
    thumbnail: {
      maxKb: number("THUMBNAIL_MAX_SIZE", 250),
      minKb: number("THUMBNAIL_MIN_SIZE", 70),
      resolution: number("THUMBNAIL_RESOLUTION", 900),
    },
  };
}

/**
 * Builds the Bunny Storage URL for one file.
 * @param {BunnySettings} bunny - Bunny credentials
 * @param {string} relativePath - Path below the configured base folder
 * @returns {string} The storage URL
 */
export function bunnyUrl(bunny: BunnySettings, relativePath: string): string {
  const host =
    bunny.region === "" || bunny.region === "de"
      ? "storage.bunnycdn.com"
      : `${bunny.region}.storage.bunnycdn.com`;
  const path = [bunny.basePath, relativePath].filter(Boolean).join("/");
  return `https://${host}/${bunny.zone}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Streams a request body to a temporary file, refusing anything over the limit
 * before it fills the disk.
 * @param {IncomingMessage} request - The upload request
 * @returns {Promise<string>} The temporary file path
 */
async function receiveFile(request: IncomingMessage): Promise<string> {
  const declared = Number(request.headers["content-length"] ?? 0);
  if (declared > UPLOAD_LIMIT_BYTES)
    throw new RequestError("The file is larger than 300 MB.");
  const path = join(tmpdir(), `travelmap-upload-${randomUUID()}`);
  let received = 0;
  request.on("data", (chunk: Buffer) => {
    received += chunk.byteLength;
    if (received > UPLOAD_LIMIT_BYTES)
      request.destroy(new RequestError("The file is larger than 300 MB."));
  });
  try {
    await pipeline(request, createWriteStream(path));
  } catch (error) {
    await rm(path, { force: true });
    throw error instanceof RequestError
      ? error
      : new RequestError("The upload was interrupted.");
  }
  return path;
}

/**
 * Reports whether ffmpeg can be run, which video thumbnails need.
 * @returns {Promise<boolean>} Whether ffmpeg answered
 */
async function hasFfmpeg(): Promise<boolean> {
  try {
    await run("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Turns an upload into its gallery files and its manifest entry: a photo
 * becomes a full-size and a thumbnail WEBP; a video becomes a thumbnail of its
 * first frame and an entry waiting for its YouTube id.
 * @param {string} file - The received temporary file
 * @param {string} name - The original file name
 * @param {UploadSettings} settings - Encoding settings
 * @returns {Promise<{ files: { name: string; content: Buffer }[]; ratio: { width: number; height: number }; isVideo: boolean }>} Files to store, the reduced ratio, and whether it was a video
 */
async function processUpload(
  file: string,
  name: string,
  settings: UploadSettings,
): Promise<{
  files: { name: string; content: Buffer }[];
  ratio: { width: number; height: number };
  isVideo: boolean;
}> {
  const extension = extname(name).toLowerCase();
  const stem = safeStem(name);

  if (VIDEO_EXTENSIONS.has(extension)) {
    if (!(await hasFfmpeg()))
      throw new RequestError("Install ffmpeg to upload videos.");
    const frame = `${file}.png`;
    try {
      await run("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-i",
        file,
        "-frames:v",
        "1",
        frame,
      ]);
      const source = await readFile(frame);
      const { height = 1, width = 1 } = await sharp(source).metadata();
      return {
        files: [
          {
            content: await encodeWithinSize(source, settings.thumbnail),
            name: `${stem}t.webp`,
          },
        ],
        isVideo: true,
        ratio: reduceRatio(width, height),
      };
    } finally {
      await rm(frame, { force: true });
    }
  }

  if (!IMAGE_EXTENSIONS.has(extension))
    throw new RequestError(
      `${extension || "This file type"} is not a photo or video.`,
    );

  const source = await readFile(file);
  const {
    height = 1,
    orientation = 1,
    width = 1,
  } = await sharp(source).metadata();
  /* EXIF orientations 5–8 are quarter turns, so the stored ratio swaps. */
  const isTurned = orientation >= 5;
  return {
    files: [
      {
        content: await encodeWithinSize(source, settings.compressed),
        name: `${stem}c.webp`,
      },
      {
        content: await encodeWithinSize(source, settings.thumbnail),
        name: `${stem}t.webp`,
      },
    ],
    isVideo: false,
    ratio: isTurned ? reduceRatio(height, width) : reduceRatio(width, height),
  };
}

/**
 * Provides the editor's media endpoints: one that takes a photo or video,
 * encodes it the way the gallery expects, and stores it locally or on Bunny
 * Storage, and one that tells the browser which of those it can do.
 * @param {string} repoRoot - Absolute repository root, which holds `media/`
 * @param {string} dataRoot - Absolute dataset root, which holds the site config
 * @returns {Plugin} Serve-only Vite plugin
 */
export function mediaUploader(repoRoot: string, dataRoot: string): Plugin {
  let settings: UploadSettings = readSettings({});

  /**
   * Reads the media root the site configuration names.
   * @returns {Promise<string>} A root such as `/Travels`
   */
  async function mediaRoot(): Promise<string> {
    try {
      const config = SiteMediaSchema.parse(
        JSON.parse(await readFile(join(dataRoot, "site.config.json"), "utf8")),
      );
      const parts = (config.media?.root ?? DEFAULT_MEDIA_ROOT)
        .split(/[\\/]/)
        .filter((part) => part && part !== "." && part !== "..");
      return parts.length ? `/${parts.join("/")}` : DEFAULT_MEDIA_ROOT;
    } catch {
      /* A dataset without a site configuration yet uses the documented default. */
      return DEFAULT_MEDIA_ROOT;
    }
  }

  return {
    name: "media-uploader",
    apply: "serve",

    /**
     * Loads encoding and Bunny settings from the env directory Vite uses.
     * @param {ResolvedConfig} config - The resolved Vite config
     * @returns {void}
     */
    configResolved(config: ResolvedConfig): void {
      if (config.envDir)
        settings = readSettings(
          loadEnv(config.mode, config.envDir, [
            "CDN_",
            "COMPRESSED_",
            "THUMBNAIL_",
          ]),
        );
    },

    /**
     * Installs the media endpoints on the development server.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      server.middlewares.use("/__media/config", async (request, response) => {
        try {
          assertLocalRequest(request);
          sendJson(response, 200, {
            bunny: settings.bunny !== null,
            ffmpeg: await hasFfmpeg(),
            mediaRoot: await mediaRoot(),
          });
        } catch (error) {
          sendJson(response, 400, errorBody(error, "Invalid request."));
        }
      });

      server.middlewares.use("/__media/upload", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Use POST to upload media." });
          return;
        }
        let file: string | undefined;
        try {
          assertLocalRequest(request);
          const query = UploadQuerySchema.parse(
            Object.fromEntries(
              new URL(request.url ?? "", "http://localhost").searchParams,
            ),
          );
          if (query.target === "bunny" && !settings.bunny)
            throw new RequestError("Bunny Storage is not configured.");
          file = await receiveFile(request);
          if ((await stat(file)).size === 0)
            throw new RequestError("The file is empty.");

          const { files, isVideo, ratio } = await processUpload(
            file,
            query.name,
            settings,
          );
          const root = await mediaRoot();
          const folder = `${query.country}/${query.city}`;
          for (const output of files) {
            if (query.target === "bunny" && settings.bunny) {
              const upload = await fetch(
                bunnyUrl(settings.bunny, `${folder}/${output.name}`),
                {
                  body: new Uint8Array(output.content),
                  headers: {
                    AccessKey: settings.bunny.key,
                    "Content-Type": "application/octet-stream",
                  },
                  method: "PUT",
                  redirect: "error",
                },
              );
              if (!upload.ok)
                throw new RequestError(
                  `Bunny Storage rejected the upload (HTTP ${upload.status}).`,
                );
              continue;
            }
            const mediaDirectory = join(repoRoot, "media");
            await writeAtomically(
              await resolveOwnedPath(
                mediaDirectory,
                `${root.slice(1)}/${folder}/${output.name}`,
              ),
              output.content,
            );
          }

          /**
           * Builds the media-root path a manifest stores for one file.
           * @param {string} name - The stored file name
           * @returns {string} The path below the CDN or local media base
           */
          const url = (name: string): string => `${root}/${folder}/${name}`;
          const image: Image = isVideo
            ? { ...ratio, thumbnail: url(files[0]!.name), youtube: true }
            : {
                ...ratio,
                original: url(files[0]!.name),
                thumbnail: url(files[1]!.name),
              };
          sendJson(response, 200, image);
        } catch (error) {
          sendJson(
            response,
            400,
            errorBody(error, "The file could not be processed."),
          );
        } finally {
          if (file) await rm(file, { force: true });
        }
      });
    },
  };
}
