import { resolve } from "node:path";

import { sharedViteConfig } from "@travelmap/ui/vite";
import { defineConfig, mergeConfig } from "vite";

import { assetWriter } from "./vite/assetWriter.ts";
import { cityIndex } from "./vite/cityIndex.ts";
import { dataWriter } from "./vite/dataWriter.ts";
import { mediaUploader } from "./vite/mediaUploader.ts";
import { siteFlags } from "./vite/siteFlags.ts";
import { snapshots } from "./vite/snapshots.ts";

const appSource = resolve(import.meta.dirname, "../travel-map/src");

export default defineConfig(
  mergeConfig(sharedViteConfig(), {
    plugins: [
      dataWriter(resolve(import.meta.dirname, "../../data")),
      assetWriter(resolve(import.meta.dirname, "../../data/logos")),
      cityIndex(),
      mediaUploader(
        resolve(import.meta.dirname, "../.."),
        resolve(import.meta.dirname, "../../data"),
      ),
      snapshots(resolve(import.meta.dirname, "../../.data-snapshots")),
      siteFlags(resolve(import.meta.dirname, "../travel-map/public/flags")),
    ],
    resolve: {
      alias: [
        { find: /^@app\//, replacement: `${appSource}/` },
        { find: /^@\//, replacement: `${appSource}/` },
      ],
    },
    envDir: resolve(import.meta.dirname, "../travel-map/env"),
    server: { host: "localhost", port: 5174 },
  }),
);
