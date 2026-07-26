import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { dataWriter } from "./vite/dataWriter";

export default defineConfig({
  plugins: [react(), dataWriter(resolve(__dirname, "../../data"))],
  server: { host: "localhost" },
});
