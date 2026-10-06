import type { Plugin } from "vite";

import { SiteConfigSchema } from "../../../packages/core/src/schema/index.ts";

/**
 * Encodes metadata for both HTML text and quoted attribute contexts.
 * @param {string} value - Authored metadata
 * @returns {string} Inert HTML text
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Emits site metadata from the forkable dataset instead of static app files.
 * @param {unknown} config - Authored configuration, or an empty object for a new fork
 * @returns {Plugin} Vite HTML and bundle asset plugin
 */
export function siteBranding(config: unknown): Plugin {
  const configuredSite = SiteConfigSchema.pick({ site: true })
    .loose()
    .parse(config).site;
  const site = {
    name: "Travel Map",
    domain: "",
    description: "A personal map of travels.",
    author: "",
    keywords: [],
    ...configuredSite,
  };
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
      const replacements: Record<string, string> = {
        "%SITE_NAME%": site.name,
        "%SITE_DESCRIPTION%": site.description,
        "%SITE_AUTHOR%": site.author,
        "%SITE_KEYWORDS%": site.keywords.join(", "),
      };
      return html.replace(
        /%SITE_(?:NAME|DESCRIPTION|AUTHOR|KEYWORDS)%/g,
        (placeholder) => escapeHtml(replacements[placeholder]),
      );
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
