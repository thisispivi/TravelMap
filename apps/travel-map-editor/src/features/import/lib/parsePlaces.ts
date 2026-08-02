import type { TransportMode, TripJson } from "@travelmap/core";

/** The input formats the editor can read without a network round trip. */
export type ImportFormat =
  | "trip-json"
  | "bundle"
  | "csv"
  | "geojson"
  | "gpx"
  | "kml"
  | "text"
  | "unknown";

/**
 * One place recovered from imported input, before it is matched to the dataset.
 * @property {number} line - Source line or row the place came from
 * @property {string} text - The original text, kept so nothing is ever lost
 * @property {string} name - The parsed place name
 * @property {[number, number]} [coordinates] - Longitude and latitude when carried
 * @property {string} [sDate] - Arrival date when carried
 * @property {string} [eDate] - Departure date when carried
 * @property {TransportMode} [mode] - Transport used to reach it, when carried
 */
export interface ParsedRow {
  line: number;
  text: string;
  name: string;
  coordinates?: [number, number];
  sDate?: string;
  eDate?: string;
  mode?: TransportMode;
}

/**
 * The outcome of reading one input, whatever its format.
 * @property {ImportFormat} format - What the input was detected as
 * @property {ParsedRow[]} rows - Places recovered from it
 * @property {TripJson} [trip] - A complete trip, when the input carried one
 * @property {string[]} problems - Lines that could not be read
 */
export interface ParsedInput {
  format: ImportFormat;
  rows: ParsedRow[];
  trip?: TripJson;
  problems: string[];
}

const MODE_WORDS: Record<string, TransportMode> = {
  bike: "walk",
  boat: "ferry",
  bus: "bus",
  car: "car",
  coach: "bus",
  cycle: "walk",
  drive: "car",
  drove: "car",
  ferry: "ferry",
  flew: "plane",
  flight: "plane",
  fly: "plane",
  plane: "plane",
  rail: "train",
  ship: "ferry",
  taxi: "taxi",
  train: "train",
  walk: "walk",
  walked: "walk",
};

const ISO_DATE = /\b(\d{4}-\d{2}-\d{2})\b/;
const SLASH_DATE = /\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/;

/**
 * Reads a date out of a line, accepting the two forms people actually write.
 * Ambiguous `DD/MM` versus `MM/DD` is resolved as day-first, matching the
 * dataset's European origin; the review table shows the result either way.
 * @param {string} line - The source line
 * @returns {string | undefined} An ISO date when one is present
 */
function parseDate(line: string): string | undefined {
  const iso = ISO_DATE.exec(line);
  if (iso) return iso[1];
  const slash = SLASH_DATE.exec(line);
  if (!slash) return undefined;
  const [, day, month, year] = slash;
  return `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")}`;
}

/**
 * Reads a transport mode out of a line's words.
 * @param {string} line - The source line
 * @returns {TransportMode | undefined} The mode when a keyword appears
 */
function parseMode(line: string): TransportMode | undefined {
  for (const word of line.toLowerCase().split(/[^a-z]+/))
    if (word in MODE_WORDS) return MODE_WORDS[word];
  return undefined;
}

/*
 * Words that introduce a place rather than name one. Stripped from the ends of
 * a line only, so a genuine "Port of Spain" keeps its middle intact.
 */
const FILLER_WORDS = new Set([
  "am",
  "arrive",
  "arrived",
  "at",
  "by",
  "day",
  "days",
  "for",
  "from",
  "in",
  "into",
  "night",
  "nights",
  "on",
  "onto",
  "overnight",
  "pm",
  "stay",
  "then",
  "to",
  "towards",
  "via",
]);

/**
 * Strips the decoration people put around a place name in a written itinerary:
 * bullets, day numbering, dates, transport verbs, and the little words that
 * join them. Everything is removed from the ends inward so a multi-word place
 * name survives intact.
 * @param {string} line - The source line
 * @returns {string} The bare place name
 */
function cleanName(line: string): string {
  /*
   * "Day 3: Rome" puts the place after the colon, while "Rome, Italy" puts the
   * qualifier after the comma. Taking the last colon-separated part and then
   * the first comma-separated one handles both without a grammar.
   */
  const afterLabel = line.split(":").at(-1) ?? line;
  const words = afterLabel
    .replace(ISO_DATE, " ")
    .replace(SLASH_DATE, " ")
    .replace(/^[\s\-*•\d.)]+/, " ")
    .replace(/[(){}[\]]/g, " ")
    .split(/[,;|]| - | – | — /)[0]!
    .split(/\s+/)
    .filter(Boolean);

  while (words.length > 0) {
    const first = words[0]!.toLowerCase().replace(/[^a-z]/g, "");
    if (!first || first in MODE_WORDS || FILLER_WORDS.has(first)) words.shift();
    else break;
  }
  while (words.length > 0) {
    const last = words
      .at(-1)!
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (!last || last in MODE_WORDS || FILLER_WORDS.has(last)) words.pop();
    else break;
  }
  return words.join(" ").trim();
}

/**
 * Reads a written itinerary line by line.
 * This is the non-AI path, and it is the default: most pasted itineraries are
 * one place per line, and a deterministic parser the author can see through is
 * worth more than a model that is right slightly more often.
 * @param {string} input - The pasted text
 * @returns {ParsedInput} What could be read from it
 */
export function parseText(input: string): ParsedInput {
  const rows: ParsedRow[] = [];
  input.split(/\r?\n/).forEach((raw, index) => {
    const text = raw.trim();
    if (!text) return;
    const name = cleanName(text);
    if (name.length < 2) return;
    const sDate = parseDate(text);
    rows.push({
      coordinates: undefined,
      eDate: sDate,
      line: index + 1,
      mode: parseMode(text),
      name,
      sDate,
      text,
    });
  });
  return { format: "text", problems: [], rows };
}

/**
 * Reads a delimited table of places, using its header row to find the columns.
 * @param {string} input - The pasted or dropped CSV
 * @returns {ParsedInput} What could be read from it
 */
export function parseCsv(input: string): ParsedInput {
  const lines = input.split(/\r?\n/).filter((line) => line.trim());
  const header = lines[0];
  if (!header) return { format: "csv", problems: [], rows: [] };

  const delimiter = header.includes("\t")
    ? "\t"
    : header.includes(";")
      ? ";"
      : ",";
  const columns = header
    .split(delimiter)
    .map((name) => name.trim().toLowerCase());

  /**
   * Finds the first column matching any of the names a header might use.
   * @param {string[]} names - Accepted header names
   * @returns {number} The column index, or -1 when absent
   */
  const indexOf = (...names: string[]): number =>
    columns.findIndex((column) => names.includes(column));
  const nameAt = indexOf("name", "place", "city");
  const latitudeAt = indexOf("lat", "latitude");
  const longitudeAt = indexOf("lng", "lon", "long", "longitude");
  const startAt = indexOf("start", "arrival", "from", "sdate");
  const endAt = indexOf("end", "departure", "to", "edate");
  const modeAt = indexOf("mode", "transport");
  const problems: string[] = [];
  const rows: ParsedRow[] = [];

  lines.slice(1).forEach((line, index) => {
    const cells = line.split(delimiter).map((cell) => cell.trim());
    const name = (nameAt >= 0 ? cells[nameAt] : cells[0]) ?? "";
    if (!name) {
      problems.push(`Row ${index + 2} has no place name.`);
      return;
    }
    const latitude = latitudeAt >= 0 ? Number(cells[latitudeAt]) : Number.NaN;
    const longitude =
      longitudeAt >= 0 ? Number(cells[longitudeAt]) : Number.NaN;
    rows.push({
      coordinates:
        Number.isFinite(latitude) && Number.isFinite(longitude)
          ? [longitude, latitude]
          : undefined,
      eDate: endAt >= 0 ? cells[endAt] || undefined : undefined,
      line: index + 2,
      mode: modeAt >= 0 ? parseMode(cells[modeAt] ?? "") : undefined,
      name,
      sDate: startAt >= 0 ? cells[startAt] || undefined : undefined,
      text: line,
    });
  });
  return { format: "csv", problems, rows };
}

/**
 * Reads point features out of GeoJSON, ignoring geometry the dataset has no
 * place for: a city is a point, so a polygon carries nothing usable.
 * @param {unknown} value - The parsed GeoJSON
 * @returns {ParsedInput} What could be read from it
 */
export function parseGeoJson(value: unknown): ParsedInput {
  const collection = value as {
    features?: {
      geometry?: { type?: string; coordinates?: unknown };
      properties?: Record<string, unknown>;
    }[];
  };
  const problems: string[] = [];
  const rows: ParsedRow[] = [];

  (collection.features ?? []).forEach((feature, index) => {
    const coordinates = feature.geometry?.coordinates;
    if (
      feature.geometry?.type !== "Point" ||
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      problems.push(`Feature ${index + 1} is not a point.`);
      return;
    }
    const name =
      (feature.properties?.name as string | undefined) ??
      (feature.properties?.title as string | undefined) ??
      `Point ${index + 1}`;
    rows.push({
      coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      line: index + 1,
      name,
      text: name,
    });
  });
  return { format: "geojson", problems, rows };
}

/**
 * Reads waypoints out of GPX or placemarks out of KML using the browser's own
 * XML parser, so neither format needs a dependency.
 * @param {string} input - The dropped file contents
 * @param {"gpx" | "kml"} format - Which of the two it is
 * @returns {ParsedInput} What could be read from it
 */
export function parseXmlPlaces(
  input: string,
  format: "gpx" | "kml",
): ParsedInput {
  const document = new DOMParser().parseFromString(input, "application/xml");
  if (document.querySelector("parsererror"))
    return {
      format,
      problems: ["The file is not valid XML."],
      rows: [],
    };

  const rows: ParsedRow[] = [];
  if (format === "gpx") {
    document.querySelectorAll("wpt").forEach((node, index) => {
      const latitude = Number(node.getAttribute("lat"));
      const longitude = Number(node.getAttribute("lon"));
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      const name = node.querySelector("name")?.textContent?.trim();
      rows.push({
        coordinates: [longitude, latitude],
        line: index + 1,
        name: name || `Waypoint ${index + 1}`,
        text: name || `Waypoint ${index + 1}`,
      });
    });
    return { format, problems: [], rows };
  }

  document.querySelectorAll("Placemark").forEach((node, index) => {
    const raw = node.querySelector("Point coordinates")?.textContent?.trim();
    if (!raw) return;
    const [longitude, latitude] = raw.split(",").map(Number);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const name = node.querySelector("name")?.textContent?.trim();
    rows.push({
      coordinates: [longitude!, latitude!],
      line: index + 1,
      name: name || `Placemark ${index + 1}`,
      text: name || `Placemark ${index + 1}`,
    });
  });
  return { format, problems: [], rows };
}
