import {
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createServer as createViteServer, type ViteDevServer } from "vite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { assetWriter } from "./assetWriter.ts";
import { cityIndex } from "./cityIndex.ts";
import { dataWriter } from "./dataWriter.ts";
import { snapshots } from "./snapshots.ts";

let root: string;
let origin: string;
let server: Server;
let vite: ViteDevServer;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "travelmap-endpoints-"));
  vite = await createViteServer({
    configFile: false,
    root,
    server: { middlewareMode: true, watch: null },
    plugins: [
      dataWriter(root),
      assetWriter(join(root, "logos")),
      snapshots(join(root, "snapshots")),
      cityIndex(),
    ],
  });
  server = createServer(vite.middlewares);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
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
  await rm(root, { recursive: true, force: true });
});

/**
 * Sends a JSON request through the actual middleware stack.
 * @param {string} endpoint - Mounted endpoint
 * @param {unknown} body - Untrusted payload
 * @returns {Promise<Response>} HTTP response
 */
function post(endpoint: string, body: unknown): Promise<Response> {
  return fetch(`${origin}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Origin: origin },
  });
}

describe("local editor endpoints", () => {
  it("validates document contents before replacing an existing file", async () => {
    const path = "site.config.json";
    const value = { site: { name: "Original" } };
    expect(
      (await post("/__data/write", { path, value, base: null })).status,
    ).toBe(200);
    const response = await post("/__data/write", {
      path,
      value: { token: "sensitive-input" },
      base: value,
    });
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("sensitive-input");
    expect(JSON.parse(await readFile(join(root, path), "utf8"))).toEqual(value);
    expect((await readdir(root)).some((name) => name.endsWith(".tmp"))).toBe(
      false,
    );
  });

  it("allows only one of two concurrent writes from the same baseline", async () => {
    const path = "site.config.json";
    const base = { site: { name: "Original" } };
    await post("/__data/write", { path, value: base, base: null });
    const responses = await Promise.all(
      ["First", "Second"].map((name) =>
        post("/__data/write", { path, base, value: { site: { name } } }),
      ),
    );
    expect(responses.map(({ status }) => status).sort()).toEqual([200, 409]);
  });

  it("refuses stale deletes and recreation of a file removed by another writer", async () => {
    const path = "site.config.json";
    const base = { site: { name: "Original" } };
    await post("/__data/write", { path, value: base, base: null });
    expect((await post("/__data/delete", { path, base: {} })).status).toBe(409);
    expect((await post("/__data/delete", { path, base })).status).toBe(200);
    expect(
      (await post("/__data/write", { path, base, value: base })).status,
    ).toBe(409);
  });

  it("compares JSON values independently of property order", async () => {
    await writeFile(
      join(root, "site.config.json"),
      '{"site":{"name":"Map","author":"Me"}}',
    );
    const response = await post("/__data/write", {
      path: "site.config.json",
      base: { site: { author: "Me", name: "Map" } },
      value: {},
    });
    expect(response.status).toBe(200);
  });

  it("rejects cross-origin requests and returns responses for unsupported methods", async () => {
    const response = await fetch(`${origin}/__data/write`, {
      method: "POST",
      headers: {
        Origin: "https://example.com",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    expect(response.status).toBe(400);
    expect((await fetch(`${origin}/__data/write`)).status).toBe(405);
    expect((await fetch(`${origin}/__assets/write`)).status).toBe(405);
  });

  it("rejects traversal and linked directories", async () => {
    expect(
      (await post("/__data/write", { path: "../outside.json", value: {} }))
        .status,
    ).toBe(400);
    await symlink(root, join(root, "photos"), "junction");
    expect(
      (await post("/__data/write", { path: "photos/escape.json", value: [] }))
        .status,
    ).toBe(400);
    await expect(readFile(join(root, "escape.json"))).rejects.toThrow();
  });

  it("rejects malformed JSON without returning its contents", async () => {
    const response = await fetch(`${origin}/__data/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"private": secret}',
    });
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("secret");
  });

  it("rejects missing coordinates and unbounded city searches", async () => {
    for (const query of [
      "/timezone",
      "/timezone?lat=91&lon=0",
      "?q=Rome&limit=-1",
      "?q=Rome&limit=100000",
    ])
      expect((await fetch(`${origin}/__cities${query}`)).status).toBe(400);
  });

  it("validates snapshot documents and rejects duplicate paths", async () => {
    const document = { path: "site.config.json", value: {} };
    const bundle = {
      createdAt: new Date().toISOString(),
      reason: "test",
      documents: [document],
    };
    expect((await post("/__snapshots?name=test.json", bundle)).status).toBe(
      200,
    );
    expect(
      (
        await post("/__snapshots?name=bad.json", {
          ...bundle,
          documents: [document, document],
        })
      ).status,
    ).toBe(500);
    expect(
      (
        await post("/__snapshots?name=bad.json", {
          ...bundle,
          documents: [{ path: "../outside.json", value: {} }],
        })
      ).status,
    ).toBe(500);
  });
});
