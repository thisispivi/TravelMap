import assert from "node:assert/strict";

import { parseCsv, parseGeoJson, parseText } from "./parsePlaces.ts";

/**
 * Reads the place names a pasted itinerary produces.
 * @param {string} input - The pasted text
 * @returns {string[]} The parsed names, in order
 */
function names(input: string): string[] {
  return parseText(input).rows.map((row) => row.name);
}

assert.deepEqual(names("Rome\nFlorence\n"), ["Rome", "Florence"]);

/* Day labels, bullets, and numbering are decoration, not part of the name. */
assert.deepEqual(names("- Day 1: Rome 2026-08-02\n2. Day 2: Florence\n"), [
  "Rome",
  "Florence",
]);

/* A transport verb reaching a place must not end up inside its name. */
assert.deepEqual(names("2026-08-05 train to Florence"), ["Florence"]);
assert.deepEqual(names("Then fly to New York"), ["New York"]);

/* A multi-word name keeps its middle words even when they look like filler. */
assert.deepEqual(names("Port of Spain"), ["Port of Spain"]);

/* A qualifier after a comma is dropped; the place itself is not. */
assert.deepEqual(names("Florence, Italy"), ["Florence"]);

const dated = parseText("Rome 2026-08-02");
assert.equal(dated.rows[0]?.sDate, "2026-08-02");
assert.equal(dated.format, "text");

const withMode = parseText("Ferry to Olbia");
assert.equal(withMode.rows[0]?.mode, "ferry");
assert.equal(withMode.rows[0]?.name, "Olbia");

const csv = parseCsv("name,lat,lng\nRome,41.9,12.5\n");
assert.equal(csv.format, "csv");
assert.deepEqual(csv.rows[0]?.coordinates, [12.5, 41.9]);

const geo = parseGeoJson(
  JSON.parse(
    JSON.stringify({
      features: [
        {
          geometry: { coordinates: [12.5, 41.9], type: "Point" },
          properties: { name: "Rome" },
          type: "Feature",
        },
      ],
      type: "FeatureCollection",
    }),
  ),
);
assert.equal(geo.format, "geojson");
assert.equal(geo.rows[0]?.name, "Rome");

console.log("parsePlaces: all assertions passed");
