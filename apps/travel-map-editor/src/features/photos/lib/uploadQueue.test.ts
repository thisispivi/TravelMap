import { describe, expect, it } from "vitest";

import { nextManifest } from "./uploadQueue";

/**
 * Builds a gallery entry with a recognisable thumbnail.
 * @param {string} name - The file stem
 * @param {number} [width=4] - The stored width ratio
 * @returns {{ height: number; original: string; thumbnail: string; width: number }} The entry
 */
function entry(
  name: string,
  width = 4,
): { height: number; original: string; thumbnail: string; width: number } {
  return {
    height: 3,
    original: `/Travels/Italy/Rome/${name}c.webp`,
    thumbnail: `/Travels/Italy/Rome/${name}t.webp`,
    width,
  };
}

describe("nextManifest", () => {
  it("appends new photos in the order they were taken", () => {
    expect(
      nextManifest(
        [entry("a")],
        [
          { image: entry("c"), takenAt: 30 },
          { image: entry("b"), takenAt: 20 },
        ],
      ),
    ).toEqual([entry("a"), entry("b"), entry("c")]);
  });

  it("replaces a re-uploaded photo where it already was instead of duplicating it", () => {
    expect(
      nextManifest(
        [entry("a"), entry("b")],
        [{ image: entry("a", 16), takenAt: 99 }],
      ),
    ).toEqual([entry("a", 16), entry("b")]);
  });

  it("keeps one entry when the same file was dropped twice in one batch", () => {
    expect(
      nextManifest(
        [],
        [
          { image: entry("a"), takenAt: 1 },
          { image: entry("a"), takenAt: 1 },
        ],
      ),
    ).toEqual([entry("a")]);
  });
});
