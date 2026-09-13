import { describe, expect, it } from "vitest";

import {
  parseCsv,
  parseGeoJson,
  parseText,
  parseXmlPlaces,
} from "./parsePlaces.ts";

/**
 * Reads the place names a pasted itinerary produces.
 * @param {string} input - The pasted text
 * @returns {string[]} The parsed names, in order
 */
function names(input: string): string[] {
  return parseText(input).rows.map((row) => row.name);
}

describe("parseText", () => {
  it("reads one place per line", () => {
    expect(names("Rome\nFlorence\n")).toEqual(["Rome", "Florence"]);
  });

  it("treats day labels, bullets, and numbering as decoration", () => {
    expect(names("- Day 1: Rome 2026-08-02\n2. Day 2: Florence\n")).toEqual([
      "Rome",
      "Florence",
    ]);
  });

  it("keeps a transport verb out of the place name", () => {
    expect(names("2026-08-05 train to Florence")).toEqual(["Florence"]);
    expect(names("Then fly to New York")).toEqual(["New York"]);
  });

  it("keeps the middle words of a multi-word name", () => {
    expect(names("Port of Spain")).toEqual(["Port of Spain"]);
  });

  it("drops a qualifier after a comma but keeps the place", () => {
    expect(names("Florence, Italy")).toEqual(["Florence"]);
  });

  it("reads a trailing date and a leading transport mode", () => {
    const dated = parseText("Rome 2026-08-02");
    expect(dated.rows[0]?.sDate).toBe("2026-08-02");
    expect(dated.format).toBe("text");

    const withMode = parseText("Ferry to Olbia");
    expect(withMode.rows[0]?.mode).toBe("ferry");
    expect(withMode.rows[0]?.name).toBe("Olbia");
  });
});

describe("parseCsv", () => {
  it("reads coordinates in dataset order from named columns", () => {
    const csv = parseCsv("name,lat,lng\nRome,41.9,12.5\n");
    expect(csv.format).toBe("csv");
    expect(csv.rows[0]?.coordinates).toEqual([12.5, 41.9]);
  });
});

describe("parseGeoJson", () => {
  it("reads point features", () => {
    const geo = parseGeoJson({
      features: [
        {
          geometry: { coordinates: [12.5, 41.9], type: "Point" },
          properties: { name: "Rome" },
          type: "Feature",
        },
      ],
      type: "FeatureCollection",
    });

    expect(geo.format).toBe("geojson");
    expect(geo.rows[0]?.name).toBe("Rome");
  });
});

describe("parseXmlPlaces", () => {
  it("reads GPX waypoints without re-interpreting escaped markup", () => {
    const gpx = parseXmlPlaces(
      '<gpx><wpt lat="41.9" lon="12.5"><name>&lt;img src=x onerror=alert(1)&gt;</name></wpt></gpx>',
      "gpx",
    );

    expect(gpx.rows[0]?.coordinates).toEqual([12.5, 41.9]);
    expect(gpx.rows[0]?.name).toBe("<img src=x onerror=alert(1)>");
  });

  it("reads KML placemarks", () => {
    const kml = parseXmlPlaces(
      '<kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><name>Rome</name><Point><coordinates>12.5,41.9,0</coordinates></Point></Placemark></Document></kml>',
      "kml",
    );

    expect(kml.rows[0]?.coordinates).toEqual([12.5, 41.9]);
    expect(kml.rows[0]?.name).toBe("Rome");
  });

  it("reports malformed XML instead of importing a partial itinerary", () => {
    expect(parseXmlPlaces("<gpx><wpt></gpx>", "gpx").problems).toEqual([
      { code: "invalidXml" },
    ]);
  });

  it("refuses a document declaring entities, which could expand to a local file", () => {
    expect(
      parseXmlPlaces('<!DOCTYPE gpx [<!ENTITY place "Rome">]><gpx />', "gpx")
        .problems,
    ).toEqual([{ code: "invalidXml" }]);
  });
});
