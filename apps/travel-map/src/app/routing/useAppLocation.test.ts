import { describe, expect, it } from "vitest";

import { classifyPathname, readTripDetailId } from "./useAppLocation";

describe("readTripDetailId", () => {
  it("decodes an id the browser percent-encoded on reload", () => {
    expect(readTripDetailId("/trip/cefal%C3%B9-trip-2025")).toBe(
      "cefalù-trip-2025",
    );
  });

  it("keeps an accented id typed into the address bar unencoded", () => {
    expect(readTripDetailId("/trip/cefalù-trip-2025")).toBe("cefalù-trip-2025");
  });

  it("keeps a malformed escape instead of crashing the shell", () => {
    expect(readTripDetailId("/trip/bad%E0")).toBe("bad%E0");
  });

  it("returns null outside a trip detail route", () => {
    expect(readTripDetailId("/trips")).toBeNull();
  });
});

describe("classifyPathname", () => {
  it("draws trips and places beside the map and the rest as pages", () => {
    expect(classifyPathname("/trips").surface).toBe("side");
    expect(classifyPathname("/trip/rome-2021").surface).toBe("side");
    expect(classifyPathname("/places/lived").surface).toBe("side");
    expect(classifyPathname("/stats").surface).toBe("page");
    expect(classifyPathname("/gallery/trip/rome-2021").surface).toBe("page");
    expect(classifyPathname("/").surface).toBe("map");
  });

  it("keeps the trips tab active while one trip is open", () => {
    expect(classifyPathname("/trip/rome-2021").activeTab).toBe("trips");
  });

  it("recognises a lightbox only when a photo index is present", () => {
    expect(classifyPathname("/gallery/trip/rome-2021").isLightbox).toBe(false);
    expect(classifyPathname("/gallery/trip/rome-2021/3").isLightbox).toBe(true);
  });

  it("falls back to visited places for an unknown filter", () => {
    expect(classifyPathname("/places/elsewhere").placesFilter).toBe("visited");
    expect(classifyPathname("/places/future").placesFilter).toBe("future");
  });
});
