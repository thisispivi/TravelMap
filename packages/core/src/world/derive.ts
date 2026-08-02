import type { TransportMode } from "../classes/Trip";
import type { TripJson, TripStopJson, TripTransportJson } from "../schema";
import { getCoordinatesDistance } from "./distance";

/**
 * A map camera position in the authored scale the dataset stores.
 * @property {[number, number]} center - Longitude and latitude of the centre
 * @property {number} zoom - Authored zoom, converted by the app at render time
 */
export interface MapFocus {
  center: [number, number];
  zoom: number;
}

/**
 * The span a trip's dates cover, derived from its stops.
 * @property {string} [sDate] - Earliest stop start, absent when no stop is dated
 * @property {string} [eDate] - Latest stop end, absent when no stop is dated
 */
export interface DerivedDateRange {
  sDate?: string;
  eDate?: string;
}

/*
 * Cruising speeds including the fixed overhead a traveller actually experiences
 * (airport time dominates a short flight, so a flat term matters more than the
 * speed does). These produce a suggestion the author can always overwrite.
 */
const MODE_SPEED_KMH: Record<TransportMode, number> = {
  bus: 55,
  car: 75,
  ferry: 35,
  plane: 750,
  taxi: 40,
  train: 110,
  walk: 4.5,
};

const MODE_OVERHEAD_MINUTES: Record<TransportMode, number> = {
  bus: 15,
  car: 10,
  ferry: 45,
  plane: 150,
  taxi: 5,
  train: 20,
  walk: 0,
};

/*
 * Beyond this a surface crossing stops being plausible as the default guess.
 * Deliberately generous: a 700 km train ride is ordinary in Europe.
 */
const PLANE_THRESHOLD_KM = 800;
const WALK_THRESHOLD_KM = 8;
const TAXI_THRESHOLD_KM = 40;

/*
 * MapLibre's zoom is logarithmic while the dataset stores a linear scale (see
 * `toMapLibreZoom` in the public app). Both conversions live here so the editor
 * and the site can never drift apart on what an authored zoom means.
 */
const AUTHORED_ZOOM_BASE = 1;

/**
 * Converts a MapLibre zoom to the linear scale the dataset stores.
 * @param {number} zoom - A MapLibre zoom level
 * @returns {number} The equivalent authored zoom
 */
export function toAuthoredZoom(zoom: number): number {
  return Math.round(2 ** (zoom - AUTHORED_ZOOM_BASE) * 100) / 100;
}

/**
 * Converts an authored zoom to MapLibre's logarithmic scale.
 * @param {number} zoom - An authored zoom value
 * @returns {number} The equivalent MapLibre zoom
 */
export function toMapLibreZoom(zoom: number): number {
  return Math.log2(Math.max(zoom, 1)) + AUTHORED_ZOOM_BASE;
}

/**
 * Suggests how far a leg travelled, using the great-circle distance between its
 * endpoints. Road and rail routes are longer than this, so the value is always
 * presented as an approximation the author can replace.
 * @param {[number, number]} from - Departure coordinates
 * @param {[number, number]} to - Arrival coordinates
 * @returns {number} Distance in kilometres, rounded to the nearest kilometre
 */
export function deriveLegDistance(
  from: [number, number],
  to: [number, number],
): number {
  return Math.round(getCoordinatesDistance(from, to));
}

/**
 * Suggests a transport mode from how far a leg travels.
 * Sea crossings are not detected: that needs land polygons this package does
 * not carry, and the result is only ever offered as a suggestion.
 * @param {number} distanceKm - Great-circle distance in kilometres
 * @returns {TransportMode} The suggested mode
 */
export function guessTransportMode(distanceKm: number): TransportMode {
  if (distanceKm <= WALK_THRESHOLD_KM) return "walk";
  if (distanceKm <= TAXI_THRESHOLD_KM) return "taxi";
  if (distanceKm >= PLANE_THRESHOLD_KM) return "plane";
  return "train";
}

/**
 * Suggests how long a leg took, from its mode and distance.
 * @param {TransportMode} mode - The transport mode
 * @param {number} distanceKm - Distance in kilometres
 * @returns {number} Duration in minutes, rounded to five-minute steps
 */
export function estimateDurationMinutes(
  mode: TransportMode,
  distanceKm: number,
): number {
  const travel = (distanceKm / MODE_SPEED_KMH[mode]) * 60;
  return Math.max(
    5,
    Math.round((travel + MODE_OVERHEAD_MINUTES[mode]) / 5) * 5,
  );
}

/**
 * Reads the implied average speed of a leg, used to flag impossible journeys.
 * @param {number} distanceKm - Distance in kilometres
 * @param {number} durationMinutes - Duration in minutes
 * @returns {number} Implied speed in kilometres per hour, zero when instant
 */
export function impliedSpeedKmh(
  distanceKm: number,
  durationMinutes: number,
): number {
  if (durationMinutes <= 0) return 0;
  return (distanceKm / durationMinutes) * 60;
}

/**
 * Finds the dates a trip's stops actually cover, so the trip's own range can be
 * kept honest without the author maintaining it by hand.
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @returns {DerivedDateRange} The earliest start and latest end among stops
 */
export function deriveTripDateRange(
  steps: TripJson["steps"],
): DerivedDateRange {
  const starts = steps
    .filter((step): step is TripStopJson => step.type === "stop")
    .map((step) => step.sDate)
    .filter(Boolean)
    .toSorted();
  const ends = steps
    .filter((step): step is TripStopJson => step.type === "stop")
    .map((step) => step.eDate)
    .filter(Boolean)
    .toSorted();

  return { eDate: ends.at(-1), sDate: starts.at(0) };
}

/**
 * Frames a set of coordinates, producing the `mapFocus` shape the dataset
 * stores. The zoom is approximate because the true fit depends on the viewport
 * aspect ratio, which is why the editor also offers "use this view".
 * @param {[number, number][]} coordinates - Points that must be visible
 * @returns {MapFocus | null} The suggested camera, or null without any point
 */
export function fitViewport(coordinates: [number, number][]): MapFocus | null {
  const first = coordinates[0];
  if (!first) return null;

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  /* A single point has no span, so fall back to a city-sized frame. */
  const longitudeSpan = Math.max(east - west, 0.05);
  const latitudeSpan = Math.max(north - south, 0.05);
  const zoom = Math.min(
    Math.log2(360 / longitudeSpan),
    Math.log2(180 / latitudeSpan),
  );

  return {
    center: [(west + east) / 2, (south + north) / 2],
    /* One level out, so the outermost stops are not flush against the edge. */
    zoom: toAuthoredZoom(Math.max(0, Math.min(zoom - 1, 12))),
  };
}

/**
 * Finds the stop immediately before a step, which is where a leg departs from.
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @param {number} index - Position of the step being examined
 * @returns {TripStopJson | undefined} The preceding stop, when there is one
 */
export function stopBefore(
  steps: TripJson["steps"],
  index: number,
): TripStopJson | undefined {
  for (let position = index - 1; position >= 0; position -= 1) {
    const step = steps[position];
    if (step?.type === "stop") return step;
  }
  return undefined;
}

/**
 * Finds the stop immediately after a step, which is where a leg arrives.
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @param {number} index - Position of the step being examined
 * @returns {TripStopJson | undefined} The following stop, when there is one
 */
export function stopAfter(
  steps: TripJson["steps"],
  index: number,
): TripStopJson | undefined {
  for (let position = index + 1; position < steps.length; position += 1) {
    const step = steps[position];
    if (step?.type === "stop") return step;
  }
  return undefined;
}

/**
 * Reports whether a leg's endpoints still agree with its neighbouring stops.
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @param {number} index - Position of the leg
 * @returns {boolean} Whether both endpoints match the surrounding stops
 */
export function isLegConsistent(
  steps: TripJson["steps"],
  index: number,
): boolean {
  const step = steps[index];
  if (step?.type !== "transport") return true;
  const before = stopBefore(steps, index);
  const after = stopAfter(steps, index);

  return (
    (!before || before.cityId === step.fromId) &&
    (!after || after.cityId === step.toId)
  );
}

/**
 * Rebuilds the endpoints of a leg from the stops around it.
 * Nothing else is touched, deliberately: every remaining field on a leg was
 * typed by the author, and distance is only ever stored once they accept it,
 * so realigning after a reorder can never destroy authored work.
 * @param {TripTransportJson} leg - The leg to realign
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @param {number} index - Position of the leg
 * @returns {TripTransportJson} The realigned leg
 */
export function realignLeg(
  leg: TripTransportJson,
  steps: TripJson["steps"],
  index: number,
): TripTransportJson {
  return {
    ...leg,
    fromId: stopBefore(steps, index)?.cityId ?? leg.fromId,
    toId: stopAfter(steps, index)?.cityId ?? leg.toId,
  };
}
