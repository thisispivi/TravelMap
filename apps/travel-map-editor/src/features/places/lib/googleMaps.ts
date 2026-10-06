/**
 * A location recovered from a pasted Google Maps link.
 * @property {[number, number]} coordinates - Longitude and latitude, in dataset order
 * @property {string} [name] - The place name, when the link carries one
 */
export interface ParsedPlace {
  coordinates: [number, number];
  name?: string;
}

/* Google writes latitude first; the dataset stores longitude first. */
const PATTERNS = [
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&](?:q|ll|query|daddr|center)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i,
  /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
];

/**
 * Reads the place name out of a Google Maps `/place/<name>/` segment.
 * @param {string} input - The pasted link
 * @returns {string | undefined} The decoded place name, when present
 */
function parseName(input: string): string | undefined {
  const match = /\/place\/([^/@?]+)/.exec(input);
  if (!match) return undefined;
  try {
    const name = decodeURIComponent(match[1]!).replace(/\+/g, " ").trim();
    return name || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extracts a location from a Google Maps link or a pasted coordinate pair.
 * Short `maps.app.goo.gl` links cannot be resolved without following a
 * redirect, so they report no location rather than a wrong one.
 * @param {string} input - The pasted link or coordinate pair
 * @returns {ParsedPlace | undefined} The location, when the input carries one
 */
export function parseGoogleMapsUrl(input: string): ParsedPlace | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  for (const pattern of PATTERNS) {
    const match = pattern.exec(trimmed);
    if (!match) continue;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) continue;
    return { coordinates: [longitude, latitude], name: parseName(trimmed) };
  }
  return undefined;
}
