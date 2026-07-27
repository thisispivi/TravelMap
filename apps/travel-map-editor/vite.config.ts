import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

import { cityIndex } from "./vite/cityIndex";
import { dataWriter } from "./vite/dataWriter";

// The editor shares the public app's design tokens rather than copying them, so
// a change to a colour or mixin lands in both. Putting the app's styles folder
// on the Sass load path lets editor stylesheets write `@use "variables" as v`
// exactly like the app's own stylesheets do.
const appSource = resolve(__dirname, "../travel-map/src");
const appStyles = resolve(appSource, "styles");

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dataWriter(resolve(__dirname, "../../data")),
    cityIndex(),
  ],
  resolve: {
    // `@app/*` is how editor code reaches the public app. `@/*` exists only so
    // reused app components resolve their own internal imports; editor files
    // address each other with relative paths. Anchored patterns keep the two
    // from shadowing one another.
    alias: [
      { find: /^@app\//, replacement: `${appSource}/` },
      { find: /^@\//, replacement: `${appSource}/` },
    ],
  },
  css: {
    preprocessorOptions: { scss: { loadPaths: [appStyles] } },
    postcss: { plugins: [autoprefixer({})] },
  },
  server: { host: "localhost" },
});
