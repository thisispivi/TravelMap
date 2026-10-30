import { resolve } from "node:path";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import type { UserConfig } from "vite";
import svgr from "vite-plugin-svgr";

import { sharedPublic } from "./sharedPublic.ts";

const stylesDir = resolve(import.meta.dirname, "../src/styles");
const publicDir = resolve(import.meta.dirname, "../public");

/**
 * The Vite configuration both apps start from, so they compile React the same
 * way (with React Compiler), import SVGs as components, and read the shared
 * design tokens with a bare `@use "variables" as v`. Both also serve the
 * shared public files: flags, map glyphs and common translations. Each app merges its own
 * plugins, server, and build settings on top with `mergeConfig`.
 * @returns {UserConfig} The shared configuration
 */
export function sharedViteConfig(): UserConfig {
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      svgr(),
      sharedPublic(publicDir),
    ],
    css: {
      preprocessorOptions: { scss: { loadPaths: [stylesDir] } },
      postcss: { plugins: [autoprefixer({})] },
    },
    resolve: { dedupe: ["react", "react-dom", "i18next", "react-i18next"] },
  };
}
