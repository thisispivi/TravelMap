import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import autoprefixer from "autoprefixer";
import { qrcode } from "vite-plugin-qrcode";

export default defineConfig(() => {
  return defineConfig({
    plugins: [react(), svgr(), nodeResolve(), qrcode()],
    base: "/",
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
    },
    css: {
      postcss: {
        plugins: [autoprefixer({})],
      },
    },
  });
});
