import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createServer } from "vite";
import { afterAll, describe, expect, it } from "vitest";

import { photoIndex } from "./photoIndex.ts";

const dir = mkdtempSync(join(tmpdir(), "photo-index-"));
const server = await createServer({
  configFile: false,
  plugins: [photoIndex()],
  root: dir,
  server: { middlewareMode: true, watch: null },
});

afterAll(async () => {
  await server.close();
  rmSync(dir, { force: true, recursive: true });
});

/**
 * Writes a manifest and imports it the way the site's photo index does.
 * @param {string} name - The manifest file name
 * @param {unknown} manifest - Its contents
 * @returns {Promise<unknown>} The module's default export
 */
async function importIndex(name: string, manifest: unknown): Promise<unknown> {
  writeFileSync(join(dir, name), JSON.stringify(manifest));
  const module = await server.ssrLoadModule(`/${name}?photo-index`);
  return module.default;
}

describe("photoIndex", () => {
  it("flags each entry by whether it can be published", async () => {
    const photo = {
      height: 2,
      original: "/a.webp",
      thumbnail: "/t.webp",
      width: 3,
    };
    const unfinishedVideo = { ...photo, original: "", youtube: true };

    expect(
      await importIndex("trip.json", [photo, unfinishedVideo, photo]),
    ).toBe("101");
  });

  it("still answers when Vite adds its own query parameters", async () => {
    writeFileSync(join(dir, "hmr.json"), JSON.stringify([]));
    const module = await server.ssrLoadModule("/hmr.json?photo-index&t=1");

    expect(module.default).toBe("");
  });

  it("names the file when a manifest is not JSON at all", async () => {
    writeFileSync(join(dir, "garbled.json"), "{");

    await expect(
      server.ssrLoadModule("/garbled.json?photo-index"),
    ).rejects.toThrow(/garbled\.json/);
  });

  it("stops on a malformed manifest and names the file", async () => {
    await expect(
      importIndex("broken.json", [{ original: "/a.webp" }]),
    ).rejects.toThrow(/broken\.json/);
  });
});
