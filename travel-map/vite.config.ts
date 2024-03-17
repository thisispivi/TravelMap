import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import autoprefixer from "autoprefixer";

export default defineConfig(() => {
  return defineConfig({
    plugins: [react(), svgr(), nodeResolve()],
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
