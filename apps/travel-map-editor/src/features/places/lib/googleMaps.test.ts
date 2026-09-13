import { describe, expect, it } from "vitest";

import { parseGoogleMapsUrl } from "./googleMaps.ts";

describe("parseGoogleMapsUrl", () => {
  it("reads the pinned place from a full maps URL", () => {
    const place = parseGoogleMapsUrl(
      "https://www.google.com/maps/place/Colosseum/@41.8902102,12.4900422,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d41.8902102!4d12.4922309",
    );

    expect(place?.coordinates).toEqual([12.4922309, 41.8902102]);
    expect(place?.name).toBe("Colosseum");
  });

  it("falls back to the viewport centre when there is no place pin", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps/@41.9028,12.4964,15z")
        ?.coordinates,
    ).toEqual([12.4964, 41.9028]);
  });

  it("reads coordinates from query-style links", () => {
    expect(
      parseGoogleMapsUrl("https://maps.google.com/?q=41.9028,12.4964")
        ?.coordinates,
    ).toEqual([12.4964, 41.9028]);
    expect(
      parseGoogleMapsUrl(
        "https://www.google.com/maps/search/?api=1&query=-33.8688,151.2093",
      )?.coordinates,
    ).toEqual([151.2093, -33.8688]);
  });

  it("accepts a bare pair copied out of the coordinates readout", () => {
    expect(parseGoogleMapsUrl(" -33.8688 , 151.2093 ")?.coordinates).toEqual([
      151.2093, -33.8688,
    ]);
  });

  it("decodes percent-encoded place names", () => {
    expect(
      parseGoogleMapsUrl(
        "https://www.google.com/maps/place/Reykjav%C3%ADk/@64.1466,-21.9426,12z",
      )?.name,
    ).toBe("Reykjavík");
  });

  it("rejects out-of-range values instead of storing them", () => {
    expect(parseGoogleMapsUrl("999.0, 12.0")).toBeUndefined();
    expect(parseGoogleMapsUrl("41.9, 999.0")).toBeUndefined();
  });

  it("refuses to guess when a link carries no coordinates", () => {
    expect(
      parseGoogleMapsUrl("https://maps.app.goo.gl/abc123"),
    ).toBeUndefined();
    expect(parseGoogleMapsUrl("")).toBeUndefined();
    expect(parseGoogleMapsUrl("not a link")).toBeUndefined();
  });
});
