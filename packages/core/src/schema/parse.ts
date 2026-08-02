import type { CityJson, CountryJson, TripJson } from "./index";

/**
 * A shape problem found while reading raw JSON, before any reference is
 * resolved. Reported rather than thrown so a host can show a malformed file
 * instead of failing to start at all.
 * @property {string} path - Dot path to the offending field
 * @property {string} message - What is wrong with it
 */
export interface ShapeIssue {
  path: string;
  message: string;
}

/**
 * Reports whether a value is a plain JSON object.
 * @param {unknown} value - The value to test
 * @returns {boolean} Whether it is a non-null, non-array object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Collects shape problems for one document against a small field spec.
 * Hand-written rather than schema-driven because there are five shapes and
 * about thirty fields: a schema library would be more code than this, and
 * `CODING_GUIDELINES.md` §9 asks for the lightweight check first.
 * @param {unknown} value - The parsed JSON value
 * @param {Record<string, "string" | "number" | "boolean" | "object" | "array">} required - Required fields and their types
 * @param {string} label - What is being checked, for the message
 * @returns {ShapeIssue[]} Every problem found
 */
function checkShape(
  value: unknown,
  required: Record<
    string,
    "string" | "number" | "boolean" | "object" | "array"
  >,
  label: string,
): ShapeIssue[] {
  if (!isRecord(value))
    return [{ message: `${label} is not a JSON object.`, path: label }];

  const issues: ShapeIssue[] = [];
  for (const [field, kind] of Object.entries(required)) {
    const actual = value[field];
    if (actual === undefined) {
      issues.push({ message: `${label} is missing "${field}".`, path: field });
      continue;
    }
    const matches =
      kind === "array"
        ? Array.isArray(actual)
        : kind === "object"
          ? isRecord(actual)
          : typeof actual === kind;
    if (!matches)
      issues.push({
        message: `${label} field "${field}" should be a ${kind}.`,
        path: field,
      });
  }
  return issues;
}

/**
 * Reports whether a value is a valid `[longitude, latitude]` pair.
 * @param {unknown} value - The value to test
 * @param {string} path - Dot path used in the message
 * @returns {ShapeIssue[]} A problem when the pair is unusable
 */
function checkCoordinates(value: unknown, path: string): ShapeIssue[] {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every((part) => typeof part === "number" && Number.isFinite(part))
  )
    return [
      {
        message: `${path} must be two numbers, longitude then latitude.`,
        path,
      },
    ];
  return [];
}

/**
 * Checks a country document's shape.
 * @param {unknown} value - The parsed JSON value
 * @returns {ShapeIssue[]} Every problem found
 */
export function checkCountryShape(value: unknown): ShapeIssue[] {
  const issues = checkShape(
    value,
    {
      color: "object",
      continent: "string",
      currency: "string",
      id: "string",
      name: "string",
    },
    "country",
  );
  if (issues.length > 0 || !isRecord(value)) return issues;

  const color = value.color as Record<string, unknown>;
  for (const channel of ["h", "s", "l"])
    if (typeof color[channel] !== "number")
      issues.push({
        message: `country colour "${channel}" should be a number.`,
        path: `color.${channel}`,
      });
  return issues;
}

/**
 * Checks a city document's shape.
 * @param {unknown} value - The parsed JSON value
 * @returns {ShapeIssue[]} Every problem found
 */
export function checkCityShape(value: unknown): ShapeIssue[] {
  const issues = checkShape(
    value,
    {
      coordinates: "array",
      countryId: "string",
      id: "string",
      name: "string",
      timeZone: "string",
    },
    "city",
  );
  if (issues.length > 0 || !isRecord(value)) return issues;
  return checkCoordinates(value.coordinates, "coordinates");
}

/**
 * Checks a trip document's shape, including every step in its itinerary.
 * @param {unknown} value - The parsed JSON value
 * @returns {ShapeIssue[]} Every problem found
 */
export function checkTripShape(value: unknown): ShapeIssue[] {
  const issues = checkShape(
    value,
    {
      eDate: "string",
      id: "string",
      originCityId: "string",
      returnCityId: "string",
      sDate: "string",
      steps: "array",
      title: "string",
    },
    "trip",
  );
  if (issues.length > 0 || !isRecord(value)) return issues;

  (value.steps as unknown[]).forEach((step, index) => {
    const at = `steps[${index}]`;
    if (!isRecord(step)) {
      issues.push({ message: `${at} is not an object.`, path: at });
      return;
    }
    if (step.type === "stop") {
      issues.push(
        ...checkShape(
          step,
          { cityId: "string", eDate: "string", sDate: "string" },
          at,
        ),
      );
      return;
    }
    if (step.type === "transport") {
      issues.push(
        ...checkShape(
          step,
          { fromId: "string", mode: "string", toId: "string" },
          at,
        ),
      );
      return;
    }
    issues.push({
      message: `${at} has an unknown type; expected "stop" or "transport".`,
      path: `${at}.type`,
    });
  });
  return issues;
}

/**
 * Checks every raw document before `buildWorld` links them together, so a
 * malformed file is reported at the boundary rather than failing wherever it
 * happens to be used first.
 * @param {unknown[]} countries - Raw country documents
 * @param {unknown[]} cities - Raw city documents
 * @param {unknown[]} trips - Raw trip documents
 * @returns {ShapeIssue[]} Every problem found
 */
export function checkDatasetShape(
  countries: unknown[],
  cities: unknown[],
  trips: unknown[],
): ShapeIssue[] {
  return [
    ...countries.flatMap(checkCountryShape),
    ...cities.flatMap(checkCityShape),
    ...trips.flatMap(checkTripShape),
  ];
}

/**
 * Narrows raw JSON to the authored country shape once it has been checked.
 * @param {unknown} value - The parsed JSON value
 * @returns {boolean} Whether the value matches `CountryJson`
 */
export function isCountryJson(value: unknown): value is CountryJson {
  return checkCountryShape(value).length === 0;
}

/**
 * Narrows raw JSON to the authored city shape once it has been checked.
 * @param {unknown} value - The parsed JSON value
 * @returns {boolean} Whether the value matches `CityJson`
 */
export function isCityJson(value: unknown): value is CityJson {
  return checkCityShape(value).length === 0;
}

/**
 * Narrows raw JSON to the authored trip shape once it has been checked.
 * @param {unknown} value - The parsed JSON value
 * @returns {boolean} Whether the value matches `TripJson`
 */
export function isTripJson(value: unknown): value is TripJson {
  return checkTripShape(value).length === 0;
}
