import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

import { assetWriter } from "./vite/assetWriter.ts";
import { cityIndex } from "./vite/cityIndex.ts";
import { dataWriter } from "./vite/dataWriter.ts";
import { snapshots } from "./vite/snapshots.ts";

/*
 * The editor shares the public app's design tokens rather than copying them.
 * The Sass load path gives both apps the same `@use "variables" as v` imports.
 */
const appSource = resolve(import.meta.dirname, "../travel-map/src");
const appStyles = resolve(appSource, "styles");

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dataWriter(resolve(import.meta.dirname, "../../data")),
    assetWriter(resolve(import.meta.dirname, "../../data/logos")),
    cityIndex(),
    snapshots(resolve(import.meta.dirname, "../../.data-snapshots")),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "i18next", "react-i18next"],
    alias: [
      { find: /^@app\//, replacement: `${appSource}/` },
      { find: /^@\//, replacement: `${appSource}/` },
    ],
  },
  css: {
    preprocessorOptions: { scss: { loadPaths: [appStyles] } },
    postcss: { plugins: [autoprefixer({})] },
  },
  envDir: resolve(import.meta.dirname, "../travel-map/env"),
  server: { host: "localhost", port: 5174 },
});
