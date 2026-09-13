import { describe, expect, it } from "vitest";

import type { DatasetSnapshot } from "../../../data/store.ts";
import {
  canImportForStop,
  manifestKeyFor,
  manifestPathForStop,
  parseManifest,
} from "./photoManifest.ts";

const dataset: DatasetSnapshot = {
  cities: [
    {
      path: "cities/Italy/Monza/Monza.json",
      value: {
        coordinates: [9.2744, 45.5845],
        countryId: "Italy",
        id: "Monza",
        name: "Monza",
        timeZone: "Europe/Rome",
      },
    },
  ],
  config: { path: "site.config.json", value: { media: { root: "/Travels" } } },
  countries: [],
  photos: [],
  trips: [],
};

const monzaStay = {
  cityId: "Monza",
  eDate: "2026-11-09",
  sDate: "2026-11-05",
  type: "stop",
} as const;

describe("manifest paths", () => {
  it("names a manifest after the stay's country, city, and dates", () => {
    const path = manifestPathForStop(dataset, monzaStay);
    expect(path).toBe("photos/Italy/Monza/tr_051126_091126.json");
    expect(manifestKeyFor(path)).toBe("Italy/Monza/tr_051126_091126");
  });
});

describe("canImportForStop", () => {
  it("allows an import for a resolvable stay", () => {
    expect(canImportForStop(dataset, monzaStay)).toBe(true);
  });

  it("refuses a stay whose city is not in the dataset", () => {
    expect(canImportForStop(dataset, { ...monzaStay, cityId: "Ghost" })).toBe(
      false,
    );
  });

  it("refuses a malformed date rather than deriving a wrong path", () => {
    expect(
      canImportForStop(dataset, { ...monzaStay, sDate: "2026-11-5" }),
    ).toBe(false);
  });
});

describe("parseManifest", () => {
  it("accepts a complete photo entry", () => {
    const valid = parseManifest(
      JSON.stringify([
        {
          height: 2,
          original: "/Travels/Italy/Monza/001c.webp",
          thumbnail: "/Travels/Italy/Monza/001t.webp",
          width: 3,
        },
      ]),
    );

    expect(valid.images).toHaveLength(1);
    expect(valid.problems).toEqual([]);
  });

  it("reports a video entry that never got its source", () => {
    const video = parseManifest(
      JSON.stringify([
        {
          height: 9,
          thumbnail: "/Travels/Italy/Monza/002t.webp",
          width: 16,
          youtube: true,
        },
      ]),
    );

    expect(video.problems[0]?.code).toBe("missingOriginal");
  });

  it("reports every path that sits outside the configured media root", () => {
    const wrongRoot = parseManifest(
      JSON.stringify([
        {
          height: 2,
          original: "/Other/Italy/Monza/001c.webp",
          thumbnail: "/Other/Italy/Monza/001t.webp",
          width: 3,
        },
      ]),
    );

    expect(
      wrongRoot.problems.filter(({ code }) => code === "unexpectedRoot"),
    ).toHaveLength(2);
  });

  it("names the reason a manifest could not be read", () => {
    expect(parseManifest("{}").problems[0]?.code).toBe("notArray");
    expect(parseManifest("not json").problems[0]?.code).toBe("invalidJson");
    expect(
      parseManifest(JSON.stringify([{ thumbnail: "missing dimensions" }]))
        .problems[0]?.code,
    ).toBe("invalidEntry");
  });

  it("refuses a photo with no path while keeping a video awaiting its id", () => {
    const thumbnail = "/Travels/Italy/Monza/003t.webp";
    expect(
      parseManifest(
        JSON.stringify([{ height: 2, original: "", thumbnail, width: 3 }]),
      ).problems[0]?.code,
    ).toBe("invalidEntry");

    const video = parseManifest(
      JSON.stringify([
        { height: 9, original: "", thumbnail, width: 16, youtube: true },
      ]),
    );
    expect(video.images).toHaveLength(1);
    expect(video.images[0]?.original).toBeUndefined();
    expect(video.problems[0]?.code).toBe("missingOriginal");
    expect(video.problems[0]?.severity).toBe("warning");
  });

  it("refuses an entry carrying a field the dataset schema would reject", () => {
    expect(
      parseManifest(
        JSON.stringify([
          {
            height: 2,
            original: "/Travels/Italy/Monza/001c.webp",
            thumbnail: "/Travels/Italy/Monza/001t.webp",
            typo: true,
            width: 3,
          },
        ]),
      ).problems[0]?.code,
    ).toBe("invalidEntry");
  });
});
