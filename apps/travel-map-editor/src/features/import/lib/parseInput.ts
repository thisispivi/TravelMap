import { isTripJson } from "@travelmap/core";

import {
  parseCsv,
  ParsedInput,
  parseGeoJson,
  parseText,
  parseXmlPlaces,
} from "./parsePlaces";

export type { ParsedInput, ParsedRow } from "./parsePlaces";

/**
 * Works out what an input is from its content rather than its file name, and
 * reads it. Extensions lie, and pasted text has none at all.
 * @param {string} input - The pasted or dropped contents
 * @returns {ParsedInput} What could be read from it
 */
export function parseImport(input: string): ParsedInput {
  const trimmed = input.trim();
  if (!trimmed) return { format: "unknown", problems: [], rows: [] };

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    let value: unknown;
    try {
      value = JSON.parse(trimmed);
    } catch {
      return {
        format: "unknown",
        problems: ["The input looks like JSON but could not be parsed."],
        rows: [],
      };
    }
    if (isTripJson(value))
      return { format: "trip-json", problems: [], rows: [], trip: value };
    if (
      typeof value === "object" &&
      value !== null &&
      "documents" in value &&
      Array.isArray((value as { documents: unknown }).documents)
    )
      return { format: "bundle", problems: [], rows: [] };
    if (
      typeof value === "object" &&
      value !== null &&
      (value as { type?: string }).type === "FeatureCollection"
    )
      return parseGeoJson(value);
    return {
      format: "unknown",
      problems: ["The JSON is not a trip, a backup, or a GeoJSON collection."],
      rows: [],
    };
  }
  if (trimmed.startsWith("<")) {
    if (trimmed.includes("<gpx")) return parseXmlPlaces(trimmed, "gpx");
    if (trimmed.includes("<kml")) return parseXmlPlaces(trimmed, "kml");
    return {
      format: "unknown",
      problems: ["The XML is neither GPX nor KML."],
      rows: [],
    };
  }

  const firstLine = trimmed.split(/\r?\n/)[0] ?? "";
  const looksTabular =
    /[,;\t]/.test(firstLine) &&
    /\b(name|place|city|lat|latitude|lon|lng|longitude)\b/i.test(firstLine);
  return looksTabular ? parseCsv(trimmed) : parseText(trimmed);
}
