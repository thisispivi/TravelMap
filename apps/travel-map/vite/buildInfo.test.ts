import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildInfoDefine } from "./buildInfo";

const APP_DIR = resolve(import.meta.dirname, "..");
const folders: string[] = [];

afterEach(() => {
  folders.splice(0).forEach((folder) => rmSync(folder, { recursive: true }));
});

describe("buildInfoDefine", () => {
  it("names the package version, the commit and the moment of a build", () => {
    const define = buildInfoDefine(APP_DIR);

    expect(define["import.meta.env.VITE_BUILD_VERSION"]).toMatch(
      /^"\d+\.\d+\.\d+"$/,
    );
    expect(define["import.meta.env.VITE_BUILD_COMMIT"]).toMatch(
      /^"[0-9a-f]{4,40}"$/,
    );
    expect(define["import.meta.env.VITE_BUILD_DATE"]).toMatch(
      /^"\d{4}-\d{2}-\d{2}T/,
    );
  });

  it("leaves the commit out with no git history, as in a Docker build", () => {
    const folder = mkdtempSync(join(tmpdir(), "build-info-"));
    folders.push(folder);
    writeFileSync(join(folder, "package.json"), '{ "version": "2.3.4" }');

    const define = buildInfoDefine(folder);

    expect(define["import.meta.env.VITE_BUILD_VERSION"]).toBe('"2.3.4"');
    expect(define).not.toHaveProperty("import.meta.env.VITE_BUILD_COMMIT");
  });

  it("stops the build when the package has no version", () => {
    const folder = mkdtempSync(join(tmpdir(), "build-info-"));
    folders.push(folder);
    writeFileSync(join(folder, "package.json"), "{}");

    expect(() => buildInfoDefine(folder)).toThrow();
  });
});
