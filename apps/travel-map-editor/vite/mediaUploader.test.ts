import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  bunnyUrl,
  encodeWithinSize,
  mediaUploader,
  readSettings,
  reduceRatio,
  safeStem,
} from "./mediaUploader.ts";

describe("reduceRatio", () => {
  it("stores the shape of a photo, not its pixel count", () => {
    expect(reduceRatio(4032, 3024)).toEqual({ height: 3, width: 4 });
    expect(reduceRatio(1080, 1920)).toEqual({ height: 16, width: 9 });
  });
});

describe("safeStem", () => {
  it("keeps a camera file name recognisable and path-free", () => {
    expect(safeStem("IMG_2041.HEIC")).toBe("IMG_2041");
    expect(safeStem("../../Château d'If.jpg")).toBe("Chateau-d-If");
    expect(safeStem(".jpg")).toBe("photo");
  });
});

describe("readSettings", () => {
  it("uses the documented defaults for blank values and leaves Bunny off without a key", () => {
    const settings = readSettings({
      CDN_STORAGE_ZONE_API_KEY: "",
      CDN_STORAGE_ZONE_NAME: "zone",
      THUMBNAIL_MAX_SIZE: "",
    });
    expect(settings.bunny).toBeNull();
    expect(settings.thumbnail).toEqual({
      maxKb: 250,
      minKb: 70,
      resolution: 900,
    });
  });

  it("enables Bunny once a zone and key are both set and trims the base path", () => {
    expect(
      readSettings({
        CDN_BASE_STORAGE_PATH: "/Travels/",
        CDN_STORAGE_ZONE_API_KEY: "secret",
        CDN_STORAGE_ZONE_NAME: "zone",
      }).bunny,
    ).toEqual({ basePath: "Travels", key: "secret", region: "", zone: "zone" });
  });

  it("refuses a typo instead of silently encoding at the default size", () => {
    expect(() => readSettings({ COMPRESSED_MAX_SIZE: "15OO" })).toThrow(
      /COMPRESSED_MAX_SIZE/,
    );
    expect(() => readSettings({ CDN_STORAGE_ZONE_NAME: "my zone" })).toThrow(
      /CDN_STORAGE_ZONE_NAME/,
    );
  });

  it("never echoes the Bunny key in its error", () => {
    expect(() =>
      readSettings({
        CDN_STORAGE_ZONE_API_KEY: "secret-key",
        CDN_STORAGE_ZONE_REGION: "bad region",
      }),
    ).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining("secret-key"),
      }),
    );
  });
});

describe("bunnyUrl", () => {
  it("uses the default host for the default region and encodes each segment", () => {
    expect(
      bunnyUrl(
        { basePath: "Travels", key: "k", region: "", zone: "zone" },
        "Romania/Brașov/001c.webp",
      ),
    ).toBe(
      "https://storage.bunnycdn.com/zone/Travels/Romania/Bra%C8%99ov/001c.webp",
    );
  });

  it("prefixes the host with a non-default region", () => {
    expect(
      bunnyUrl(
        { basePath: "", key: "k", region: "ny", zone: "zone" },
        "a/b.webp",
      ),
    ).toBe("https://ny.storage.bunnycdn.com/zone/a/b.webp");
  });
});

describe("encodeWithinSize", () => {
  it("steps quality down until a large photo fits its size window", async () => {
    const noise = await sharp(
      Buffer.from(
        Array.from({ length: 1200 * 900 * 3 }, () =>
          Math.floor(Math.random() * 256),
        ),
      ),
      {
        raw: { channels: 3, height: 900, width: 1200 },
      },
    )
      .jpeg({ quality: 100 })
      .toBuffer();
    const encoded = await encodeWithinSize(noise, {
      maxKb: 200,
      minKb: 10,
      resolution: 800,
    });
    const { format, width } = await sharp(encoded).metadata();

    expect(format).toBe("webp");
    expect(width).toBe(800);
    expect(encoded.byteLength / 1024).toBeLessThanOrEqual(200);
  });

  it("never enlarges a photo smaller than the target resolution", async () => {
    const small = await sharp({
      create: { background: "#3366cc", channels: 3, height: 30, width: 40 },
    })
      .png()
      .toBuffer();
    const { width } = await sharp(
      await encodeWithinSize(small, { maxKb: 100, minKb: 1, resolution: 900 }),
    ).metadata();

    expect(width).toBe(40);
  });
});

describe("upload endpoint", () => {
  let root: string;
  let origin: string;
  let server: Server;
  let vite: ViteDevServer;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "travelmap-media-"));
    await mkdir(join(root, "data"));
    await writeFile(
      join(root, "data", "site.config.json"),
      JSON.stringify({ media: { root: "/Travels" } }),
    );
    vite = await createViteServer({
      configFile: false,
      envDir: false,
      plugins: [mediaUploader(root, join(root, "data"))],
      root,
      server: { middlewareMode: true, watch: null },
    });
    server = createServer(vite.middlewares);
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Missing test server port");
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await vite.close();
    await rm(root, { force: true, recursive: true });
  });

  it("turns a photo into two WEBPs in local media and returns its gallery entry", async () => {
    const photo = await sharp({
      create: { background: "#cc6633", channels: 3, height: 300, width: 400 },
    })
      .jpeg()
      .toBuffer();
    const response = await fetch(
      `${origin}/__media/upload?country=Italy&city=Rome&target=local&name=IMG_1.jpg`,
      { body: new Uint8Array(photo), method: "POST" },
    );

    expect(await response.json()).toEqual({
      height: 3,
      original: "/Travels/Italy/Rome/IMG_1c.webp",
      thumbnail: "/Travels/Italy/Rome/IMG_1t.webp",
      width: 4,
    });
    expect(
      (
        await readdir(join(root, "media", "Travels", "Italy", "Rome"))
      ).toSorted(),
    ).toEqual(["IMG_1c.webp", "IMG_1t.webp"]);
  });

  it("refuses a folder name that would leave the media directory", async () => {
    const response = await fetch(
      `${origin}/__media/upload?country=..&city=Rome&target=local&name=a.jpg`,
      { body: "x", method: "POST" },
    );

    expect(response.status).toBe(400);
  });

  it("refuses Bunny uploads when no Bunny key is configured", async () => {
    const response = await fetch(
      `${origin}/__media/upload?country=Italy&city=Rome&target=bunny&name=a.jpg`,
      { body: "x", method: "POST" },
    );

    expect(await response.json()).toEqual({
      error: "Bunny Storage is not configured.",
    });
  });

  it("refuses a file that is neither a photo nor a video", async () => {
    const response = await fetch(
      `${origin}/__media/upload?country=Italy&city=Rome&target=local&name=notes.txt`,
      { body: "hello", method: "POST" },
    );

    expect(response.status).toBe(400);
  });
});
