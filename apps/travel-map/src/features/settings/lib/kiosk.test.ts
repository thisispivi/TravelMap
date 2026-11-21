import { describe, expect, it } from "vitest";

import { AlbumSection } from "@/data/albums";

import { buildSlideOrder, kioskStore } from "./kiosk";

/**
 * Builds a visit with a number of photos; the order only reads the count.
 * @param {string} key - The visit's id
 * @param {number} count - Its photos
 * @returns {AlbumSection} The visit
 */
function section(key: string, count: number): AlbumSection {
  /* The order reads only the key and the count, so the rest of a visit is left out. */
  return { gallery: { count, path: key }, key } as unknown as AlbumSection;
}

const visits = [section("first", 2), section("second", 3)];

describe("buildSlideOrder", () => {
  it("walks every photo of every visit in travel order", () => {
    expect(
      buildSlideOrder(visits, "trips").map(
        ({ section: { key }, index }) => `${key}:${index}`,
      ),
    ).toEqual(["first:0", "first:1", "second:0", "second:1", "second:2"]);
  });

  it("shuffles the same photos without losing or repeating one", () => {
    const shuffled = buildSlideOrder(visits, "shuffle", () => 0).map(
      ({ section: { key }, index }) => `${key}:${index}`,
    );
    expect(shuffled).not.toEqual(
      buildSlideOrder(visits, "trips").map(
        ({ section: { key }, index }) => `${key}:${index}`,
      ),
    );
    expect(shuffled.toSorted()).toEqual([
      "first:0",
      "first:1",
      "second:0",
      "second:1",
      "second:2",
    ]);
  });

  it("has nothing to show for visits without photos", () => {
    expect(buildSlideOrder([section("empty", 0)], "shuffle")).toEqual([]);
  });
});

describe("kioskStore", () => {
  it("starts off, and a slideshow that found no photo turns it off again", () => {
    expect(kioskStore.read().isEnabled).toBe(false);
    kioskStore.enable();
    expect(kioskStore.read()).toMatchObject({
      isEnabled: true,
      isShowing: true,
    });
    kioskStore.reportNoPhotos();
    expect(kioskStore.read()).toMatchObject({
      hasNoPhotos: true,
      isEnabled: false,
      isShowing: false,
    });
  });
});
