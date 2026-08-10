import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

import { assetWriter } from "./vite/assetWriter";
import { cityIndex } from "./vite/cityIndex";
import { dataWriter } from "./vite/dataWriter";
import { snapshots } from "./vite/snapshots";

/*
 * The editor shares the public app's design tokens rather than copying them.
 * The Sass load path gives both apps the same `@use "variables" as v` imports.
 */
const appSource = resolve(__dirname, "../travel-map/src");
const appStyles = resolve(appSource, "styles");
const appPublic = resolve(__dirname, "../travel-map/public");

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dataWriter(resolve(__dirname, "../../data")),
    assetWriter(resolve(appPublic, "logos")),
    cityIndex(),
    snapshots(resolve(__dirname, "../../.data-snapshots")),
  ],
  resolve: {
    /*
     * Reused app components resolve their own `@/*` imports while editor code
     * uses the explicit `@app/*` form. Anchored patterns prevent shadowing.
     */
    alias: [
      { find: /^@app\//, replacement: `${appSource}/` },
      { find: /^@\//, replacement: `${appSource}/` },
    ],
  },
  css: {
    preprocessorOptions: { scss: { loadPaths: [appStyles] } },
    postcss: { plugins: [autoprefixer({})] },
  },
  envDir: resolve(__dirname, "../travel-map/env"),
  server: { host: "localhost", port: 5174 },
});
