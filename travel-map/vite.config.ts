import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import autoprefixer from "autoprefixer";
import { qrcode } from "vite-plugin-qrcode";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react({
      babel: { plugins: [["babel-plugin-react-compiler", { target: "18" }]] },
    }),
    svgr(),
    nodeResolve(),
    qrcode(),
  ],
  base: "/",
  server: { watch: { usePolling: true }, host: true },
  css: { postcss: { plugins: [autoprefixer({})] } },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
  build: {
    chunkSizeWarningLimit: 1100,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (normalizedId.includes("/src/data/")) return "data";
          if (normalizedId.endsWith("/src/utils/parameters.ts"))
            return "parameters";
          if (normalizedId.includes("/src/assets/icons/")) return "icons";

          if (!normalizedId.includes("node_modules")) return;

          if (
            normalizedId.includes("apexcharts") ||
            normalizedId.includes("react-apexcharts")
          ) {
            return "apexcharts";
          }

          if (
            normalizedId.includes("react-photo-album") ||
            normalizedId.includes("react-image-gallery")
          ) {
            return "gallery";
          }

          if (
            normalizedId.includes("react-simple-maps") ||
            normalizedId.includes("d3") ||
            normalizedId.includes("topojson")
          ) {
            return "map";
          }

          if (normalizedId.includes("react-router")) {
            return "vendor";
          }

          return "vendor";
        },
      },
    },
  },
  envDir: "./env",
});
