import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getWithExpiry,
  readStoredString,
  setWithExpiry,
  writeStoredString,
} from "./storage";

const entries = new Map<string, string>();

/**
 * An in-memory stand-in for the browser's localStorage, so these tests exercise
 * the real read path without pulling in a full DOM.
 */
const localStorageStub = {
  getItem: (key: string): string | null => entries.get(key) ?? null,
  removeItem: (key: string): void => void entries.delete(key),
  setItem: (key: string, value: string): void => void entries.set(key, value),
};

describe("expiring storage", () => {
  beforeEach(() => {
    entries.clear();
    vi.stubGlobal("localStorage", localStorageStub);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("reads back a value before its deadline", () => {
    setWithExpiry("flag", { retried: true }, 10_000);

    expect(getWithExpiry("flag")).toEqual({ retried: true });
  });

  it("drops a value once its deadline passes", () => {
    setWithExpiry("flag", true, 10_000);
    vi.advanceTimersByTime(10_001);

    expect(getWithExpiry("flag")).toBeNull();
    expect(entries.has("flag")).toBe(false);
  });

  it("returns null for a key nothing wrote", () => {
    expect(getWithExpiry("absent")).toBeNull();
  });

  it("discards an entry another script left in the wrong shape", () => {
    for (const stored of [
      '{"value":1}',
      '{"expiry":"soon"}',
      "not json",
      '"a"',
    ]) {
      entries.set("flag", stored);

      expect(getWithExpiry("flag")).toBeNull();
      expect(entries.has("flag")).toBe(false);
    }
  });
});

describe("plain string storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats storage the browser blocks as empty instead of throwing", () => {
    /**
     * Throws the way a browser does when site data is blocked.
     * @returns {never} Never returns
     */
    const blocked = (): never => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    vi.stubGlobal("localStorage", { getItem: blocked, setItem: blocked });

    expect(readStoredString("design")).toBeNull();
    expect(() => writeStoredString("design", "phosphor")).not.toThrow();
  });

  it("reads back what it wrote", () => {
    entries.clear();
    vi.stubGlobal("localStorage", localStorageStub);
    writeStoredString("design", "phosphor");

    expect(readStoredString("design")).toBe("phosphor");
  });
});
