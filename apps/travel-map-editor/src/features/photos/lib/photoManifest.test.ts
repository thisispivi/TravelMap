import assert from "node:assert/strict";

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

const path = manifestPathForStop(dataset, {
  cityId: "Monza",
  eDate: "2026-11-09",
  sDate: "2026-11-05",
  type: "stop",
});
assert.equal(path, "photos/Italy/Monza/tr_051126_091126.json");
assert.equal(manifestKeyFor(path), "Italy/Monza/tr_051126_091126");

assert.equal(
  canImportForStop(dataset, {
    cityId: "Monza",
    eDate: "2026-11-09",
    sDate: "2026-11-05",
    type: "stop",
  }),
  true,
);
assert.equal(
  canImportForStop(dataset, {
    cityId: "Ghost",
    eDate: "2026-11-09",
    sDate: "2026-11-05",
    type: "stop",
  }),
  false,
);
assert.equal(
  canImportForStop(dataset, {
    cityId: "Monza",
    eDate: "2026-11-09",
    sDate: "2026-11-5",
    type: "stop",
  }),
  false,
);

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
assert.equal(valid.images.length, 1);
assert.deepEqual(valid.problems, []);

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
assert.equal(video.problems[0]?.code, "missingOriginal");

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
assert.equal(
  wrongRoot.problems.filter(({ code }) => code === "unexpectedRoot").length,
  2,
);

assert.equal(parseManifest("{}").problems[0]?.code, "notArray");
assert.equal(parseManifest("not json").problems[0]?.code, "invalidJson");
assert.equal(
  parseManifest(JSON.stringify([{ thumbnail: "missing dimensions" }]))
    .problems[0]?.code,
  "invalidEntry",
);

console.log("photoManifest: all assertions passed");
