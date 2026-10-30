import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

/*
 * The components are tested in jsdom; the plain libraries run there too,
 * which costs nothing and keeps one environment for the whole package. SVGs
 * import as components here as they do in the apps.
 */
export default defineConfig({
  plugins: [svgr()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
