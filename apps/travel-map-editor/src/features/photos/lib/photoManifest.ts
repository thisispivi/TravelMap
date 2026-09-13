import type { Image, TripStopJson } from "@travelmap/core";
import { ImageSchema } from "@travelmap/core";

import type { DatasetSnapshot } from "../../../data/store";

/** A problem found while reading a photo manifest. */
type PhotoManifestProblemCode =
  | "invalidJson"
  | "notArray"
  | "invalidEntry"
  | "missingOriginal"
  | "unexpectedRoot";

/** Whether a manifest problem blocks the import or only needs review. */
type PhotoManifestProblemSeverity = "error" | "warning";

/**
 * One validation result tied to an optional manifest entry or media path.
 * @property {PhotoManifestProblemCode} code - Translation and handling key
 * @property {number} [index] - Zero-based manifest entry index
 * @property {string} [path] - Path that does not use the configured root
 * @property {PhotoManifestProblemSeverity} severity - Whether import is blocked
 */
interface PhotoManifestProblem {
  code: PhotoManifestProblemCode;
  index?: number;
  path?: string;
  severity: PhotoManifestProblemSeverity;
}

/**
 * Parsed media entries and every issue the import review needs to surface.
 * @property {Image[]} images - Structurally valid entries
 * @property {PhotoManifestProblem[]} problems - Blocking errors and warnings
 */
export interface ParsedPhotoManifest {
  images: Image[];
  problems: PhotoManifestProblem[];
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Converts an ISO date into the compact manifest filename format.
 * @param {string} value - Stop date beginning with YYYY-MM-DD
 * @returns {string} Date formatted as DDMMYY
 */
function compactDate(value: string): string {
  const match = ISO_DATE.exec(value);
  if (!match) throw new Error(`Invalid stop date: ${value}`);
  return `${match[3]}${match[2]}${match[1].slice(2)}`;
}

/**
 * Normalizes the configured media prefix for consistent path comparisons.
 * @param {string} mediaRoot - Authored root from site.config.json
 * @returns {string} Root with a leading slash and no trailing slash
 */
function normalizeMediaRoot(mediaRoot: string): string {
  const root = mediaRoot.trim().replaceAll("\\", "/");
  const parts = root.split("/").filter(Boolean);
  if (parts.length === 0 || parts.some((part) => part === "." || part === ".."))
    return "/Travels";
  return `/${parts.join("/")}`;
}

/**
 * Reports whether a stop resolves to a manifest path. The import entry point
 * calls this so a stop left pointing at a deleted city disables the action
 * instead of throwing while the dialog renders.
 * @param {DatasetSnapshot} dataset - Current editor dataset
 * @param {TripStopJson} step - Stop whose city and dates define the path
 * @returns {boolean} Whether the stop can receive an imported manifest
 */
export function canImportForStop(
  dataset: DatasetSnapshot,
  step: TripStopJson,
): boolean {
  return (
    dataset.cities.some(({ value }) => value.id === step.cityId) &&
    ISO_DATE.test(step.sDate) &&
    ISO_DATE.test(step.eDate)
  );
}

/**
 * Resolves the canonical photo document path from a stop and its city record.
 * @param {DatasetSnapshot} dataset - Current editor dataset
 * @param {TripStopJson} step - Stop whose city and dates define the path
 * @returns {string} Dataset-relative photo manifest path
 */
export function manifestPathForStop(
  dataset: DatasetSnapshot,
  step: TripStopJson,
): string {
  const city = dataset.cities.find(({ value }) => value.id === step.cityId);
  if (!city) throw new Error(`Unknown city: ${step.cityId}`);
  return `photos/${city.value.countryId}/${city.value.id}/tr_${compactDate(step.sDate)}_${compactDate(step.eDate)}.json`;
}

/**
 * Converts a dataset photo path into the reference stored on a trip stop.
 * @param {string} path - Dataset-relative photo manifest path
 * @returns {string} Photo path without the collection prefix and extension
 */
export function manifestKeyFor(path: string): string {
  return path.replace(/^photos\//, "").replace(/\.json$/, "");
}

/**
 * Validates uploader JSON and reports reviewable video and media-root issues.
 * Invalid entries are excluded so callers cannot accidentally persist them.
 * @param {string} text - Pasted or selected JSON source
 * @param {string} [mediaRoot="/Travels"] - Expected generated path prefix
 * @returns {ParsedPhotoManifest} Valid entries plus errors and warnings
 */
export function parseManifest(
  text: string,
  mediaRoot = "/Travels",
): ParsedPhotoManifest {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return {
      images: [],
      problems: [{ code: "invalidJson", severity: "error" }],
    };
  }
  if (!Array.isArray(value))
    return {
      images: [],
      problems: [{ code: "notArray", severity: "error" }],
    };

  const root = normalizeMediaRoot(mediaRoot || "/Travels");
  const images: Image[] = [];
  const problems: PhotoManifestProblem[] = [];

  value.forEach((entry, index) => {
    const parsed = ImageSchema.safeParse(entry);
    if (!parsed.success) {
      problems.push({ code: "invalidEntry", index, severity: "error" });
      return;
    }

    /* An empty id is stored as an absent one, so a later read cannot mistake it. */
    const image: Image = parsed.data.original
      ? parsed.data
      : { ...parsed.data, original: undefined };
    images.push(image);

    if (!image.original)
      problems.push({ code: "missingOriginal", index, severity: "warning" });
    const paths = [
      image.thumbnail,
      ...(image.original && !image.youtube ? [image.original] : []),
    ];
    for (const path of paths)
      if (path !== root && !path.startsWith(`${root}/`))
        problems.push({
          code: "unexpectedRoot",
          index,
          path,
          severity: "warning",
        });
  });

  return problems.some(({ severity }) => severity === "error")
    ? { images: [], problems }
    : { images, problems };
}
