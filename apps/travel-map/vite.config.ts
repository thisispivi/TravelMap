import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig, Plugin } from "vite";
import { qrcode } from "vite-plugin-qrcode";
import svgr from "vite-plugin-svgr";

import { siteBranding } from "./vite/siteBranding.ts";

/*
 * Dependencies grouped by runtime concern, so a chunk's contents change only when
 * that concern's dependencies do and the rest stay cached.
 *
 * List only what the first page load actually needs. Assigning a chunk to a
 * lazily imported dependency makes that chunk a static import, and everything
 * sharing it then loads eagerly too — a catch-all `return "vendor"` used to put
 * apexcharts in the same chunk as zod, which preloaded ~250 kB of charting on
 * every visit for a statistics page most visitors never open. Anything absent
 * here is left to automatic splitting, which keeps a dynamic import async.
 */
const CHUNKS_BY_PACKAGE: Record<string, string> = {
  "react-image-gallery": "gallery",
  "react-photo-album": "gallery",
  "maplibre-gl": "map",
  "react-map-gl": "map",
  "topojson-client": "map",
  react: "react-core",
  "react-dom": "react-core",
  scheduler: "react-core",
  "react-router": "router",
  "framer-motion": "framer",
  i18next: "i18n",
  "i18next-browser-languagedetector": "i18n",
  "i18next-http-backend": "i18n",
  "react-i18next": "i18n",
  "mobile-device-detect": "ui",
  "react-tooltip": "ui",
  remeda: "utils",
  swr: "vendor",
  zod: "vendor",
};

const MEDIA_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Resolves a development media request only when it remains below media/.
 * @param {string} mediaRoot - Absolute repository media directory
 * @param {string} requestUrl - Middleware-relative request URL
 * @returns {string} Validated absolute media file path
 */
function resolveMediaPath(mediaRoot: string, requestUrl: string): string {
  const relativePath = decodeURIComponent(requestUrl.split("?")[0]).replace(
    /^\/+/,
    "",
  );
  const path = resolve(mediaRoot, relativePath);
  if (!path.startsWith(`${mediaRoot}${sep}`))
    throw new Error("Only files inside media/ can be served.");
  return path;
}

/**
 * Serves the repository media volume during development without adding it to
 * the production bundle, where nginx owns the same URL prefix.
 * @param {string} mediaRoot - Absolute repository media directory
 * @returns {Plugin} Serve-only Vite plugin
 */
function mediaServer(mediaRoot: string): Plugin {
  return {
    name: "media-server",
    apply: "serve",

    /**
     * Mounts read-only local media under `/media`.
     * @param {import("vite").ViteDevServer} server - Active Vite server
     * @returns {void}
     */
    configureServer(server): void {
      server.middlewares.use("/media", (request, response) => {
        try {
          const path = resolveMediaPath(mediaRoot, request.url ?? "");
          const contentType = MEDIA_TYPES[extname(path).toLowerCase()];
          if (!contentType) {
            response.writeHead(404);
            response.end();
            return;
          }
          const stream = createReadStream(path);
          stream.on("error", () => {
            if (!response.headersSent) response.writeHead(404);
            response.end();
          });
          response.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
          response.setHeader("Content-Type", contentType);
          stream.pipe(response);
        } catch {
          response.writeHead(403);
          response.end();
        }
      });
    },
  };
}

const siteConfigPath = resolve(
  import.meta.dirname,
  "../../data/site.config.json",
);
const siteConfig: unknown = existsSync(siteConfigPath)
  ? JSON.parse(readFileSync(siteConfigPath, "utf8"))
  : {};

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr(),
    qrcode(),
    siteBranding(siteConfig),
    mediaServer(resolve(import.meta.dirname, "../../media")),
  ],
  base: "/",
  server: { watch: { usePolling: true }, host: true },
  css: { postcss: { plugins: [autoprefixer({})] } },
  resolve: {
    alias: [{ find: "@", replacement: resolve(import.meta.dirname, "./src") }],
  },
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 800,
    minify: "oxc",
    rolldownOptions: {
      output: {
        /**
         * Groups large dependencies by runtime concern for stable cacheable chunks.
         * @param {string} id - The resolved module identifier
         * @returns {string | undefined} The manual chunk name when the module is grouped
         */
        manualChunks(id) {
          const path = id.replace(/\\/g, "/");
          const marker = "node_modules/";
          const at = path.lastIndexOf(marker);
          if (at === -1) return;

          /*
           * Read the package name from the last node_modules segment rather than
           * testing the whole id for substrings: pnpm nests a dependency's own
           * copies under its parent, so react-apexcharts/node_modules/react/...
           * has to read as `react` and not match an earlier rule by accident.
           */
          const segments = path.slice(at + marker.length).split("/");
          const name = segments[0]?.startsWith("@")
            ? `${segments[0]}/${segments[1]}`
            : (segments[0] ?? "");

          return CHUNKS_BY_PACKAGE[name];
        },
      },
    },
  },
  envDir: "./env",
});
