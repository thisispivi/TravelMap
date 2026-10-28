import { describe, expect, it } from "vitest";

import { readTripDetailId } from "./useAppLocation";

describe("readTripDetailId", () => {
  it("decodes an id the browser percent-encoded on reload", () => {
    expect(readTripDetailId("/trip/cefal%C3%B9-trip-2025")).toBe(
      "cefalù-trip-2025",
    );
  });

  it("keeps an id that in-app navigation left unencoded", () => {
    expect(readTripDetailId("/trip/cefalù-trip-2025")).toBe("cefalù-trip-2025");
  });

  it("keeps a malformed escape instead of crashing the shell", () => {
    expect(readTripDetailId("/trip/bad%E0")).toBe("bad%E0");
  });

  it("returns null outside a trip detail route", () => {
    expect(readTripDetailId("/trips")).toBeNull();
  });
});
