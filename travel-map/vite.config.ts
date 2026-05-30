import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { resolve } from "path";
import { defineConfig } from "vite";
import { qrcode } from "vite-plugin-qrcode";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr(),
    qrcode(),
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
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_getters: true,
        unsafe_proto: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          const n = id.replace(/\\/g, "/");

          if (n.includes("/src/data/")) return "data";
          if (n.endsWith("/src/utils/parameters.ts")) return "parameters";
          if (n.includes("/src/assets/icons/")) return "icons";

          if (!n.includes("node_modules")) return;

          if (n.includes("apexcharts") || n.includes("react-apexcharts"))
            return "apexcharts";
          if (
            n.includes("react-photo-album") ||
            n.includes("react-image-gallery")
          )
            return "gallery";
          if (
            n.includes("react-simple-maps") ||
            n.includes("/d3") ||
            n.includes("d3-") ||
            n.includes("topojson")
          )
            return "map";

          if (
            n.includes("/react/") ||
            n.includes("/react-dom/") ||
            n.includes("/react-compiler-runtime/") ||
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
