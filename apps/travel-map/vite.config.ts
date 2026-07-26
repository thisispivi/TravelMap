import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

/**
 * Emits site metadata from the forkable dataset instead of static app files.
 * @param {SiteDetails} site - Site metadata loaded from the dataset
 * @returns {Plugin} Vite HTML and bundle asset plugin
 */
function siteBranding(site: SiteDetails): Plugin {
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
     * Adds generated domain and manifest assets to the production bundle.
     * @returns {void}
     */
    generateBundle() {
      if (site.domain) {
        this.emitFile({
          fileName: "CNAME",
          source: site.domain,
          type: "asset",
        });
      }
      this.emitFile({
        fileName: "site.webmanifest",
        source: JSON.stringify({
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
        }),
        type: "asset",
      });
    },
  };
}

const site = JSON.parse(
  readFileSync(resolve(__dirname, "../../data/site.config.json"), "utf8"),
).site as SiteDetails;

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr(),
    qrcode(),
    siteBranding(site),
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
          if (n.includes("framer-motion")) return "framer";
          if (
            n.includes("i18next") ||
            n.includes("react-i18next") ||
            n.includes("i18next-http-backend")
          )
            return "i18n";
          if (
            n.includes("react-tooltip") ||
            n.includes("react-transition-group") ||
            n.includes("mobile-device-detect")
          )
            return "ui";
          if (n.includes("remeda")) return "utils";

          return "vendor";
        },
      },
    },
  },
  envDir: "./env",
});
