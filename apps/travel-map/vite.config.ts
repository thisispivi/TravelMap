import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig, Plugin } from "vite";
import { qrcode } from "vite-plugin-qrcode";
import svgr from "vite-plugin-svgr";

/**
 * Metadata used in generated browser and deployment assets.
 * @property {string} name - Public site name
 * @property {string} domain - Optional custom domain
 * @property {string} description - Search description
 * @property {string} author - Site author
 * @property {string[]} keywords - Search keywords
 */
interface SiteDetails {
  name: string;
  domain: string;
  description: string;
  author: string;
  keywords: string[];
}

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

/**
 * Emits site metadata from the forkable dataset instead of static app files.
 * @param {SiteDetails} site - Site metadata loaded from the dataset
 * @returns {Plugin} Vite HTML and bundle asset plugin
 */
function siteBranding(site: SiteDetails): Plugin {
  const manifest = JSON.stringify({
    icons: [
      {
        sizes: "192x192",
        src: "/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/android-chrome-512x512.png",
        type: "image/png",
      },
    ],
    name: site.name,
    short_name: site.name,
    start_url: "/",
  });

  return {
    name: "site-branding",

    /**
     * Replaces metadata placeholders in the Vite HTML entry point.
     * @param {string} html - HTML source to transform
     * @returns {string} Branded HTML source
     */
    transformIndexHtml(html: string): string {
      return html
        .replaceAll("%SITE_NAME%", site.name)
        .replaceAll("%SITE_DESCRIPTION%", site.description)
        .replaceAll("%SITE_AUTHOR%", site.author)
        .replaceAll("%SITE_KEYWORDS%", site.keywords.join(", "));
    },

    /**
     * Serves the generated manifest during development. Without this middleware
     * Vite's history fallback returns index.html for the manifest request.
     * @param {import("vite").ViteDevServer} server - The active Vite server
     * @returns {void}
     */
    configureServer(server): void {
      server.middlewares.use((request, response, next) => {
        if (request.url !== "/site.webmanifest") {
          next();
          return;
        }
        response.setHeader("Content-Type", "application/manifest+json");
        response.end(manifest);
      });
    },

    /**
     * Adds generated domain and manifest assets to the production bundle.
     * @returns {void}
     */
    generateBundle(): void {
      if (site.domain) {
        this.emitFile({
          fileName: "CNAME",
          source: site.domain,
          type: "asset",
        });
      }
      this.emitFile({
        fileName: "site.webmanifest",
        source: manifest,
        type: "asset",
      });
    },
  };
}

/*
 * A fork starts with an empty data/, so the build must not require
 * site.config.json or a fully populated site block to exist yet.
 */
const DEFAULT_SITE: SiteDetails = {
  name: "Travel Map",
  domain: "",
  description: "A personal map of travels.",
  author: "",
  keywords: [],
};
const siteConfigPath = resolve(__dirname, "../../data/site.config.json");
const configuredSite = existsSync(siteConfigPath)
  ? (JSON.parse(readFileSync(siteConfigPath, "utf8")).site as
      Partial<SiteDetails> | undefined)
  : undefined;
const site: SiteDetails = { ...DEFAULT_SITE, ...configuredSite };

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr(),
    qrcode(),
    siteBranding(site),
    mediaServer(resolve(__dirname, "../../media")),
  ],
  base: "/",
  server: { watch: { usePolling: true }, host: true },
  css: { postcss: { plugins: [autoprefixer({})] } },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
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
          const n = id.replace(/\\/g, "/");

          if (!n.includes("node_modules")) return;

          if (
            n.includes("react-photo-album") ||
            n.includes("react-image-gallery")
          )
            return "gallery";
          if (
            n.includes("react-map-gl") ||
            n.includes("maplibre-gl") ||
            n.includes("topojson")
          )
            return "map";

          if (
            n.includes("/react/") ||
            n.includes("/react-dom/") ||
            n.includes("/scheduler/")
          )
            return "react-core";
          if (n.includes("react-router")) return "router";
          if (
            n.includes("i18next") ||
            n.includes("react-i18next") ||
            n.includes("i18next-http-backend")
          )
            return "i18n";
          if (n.includes("remeda")) return "utils";

          return "vendor";
        },
      },
    },
  },
  envDir: "./env",
});
