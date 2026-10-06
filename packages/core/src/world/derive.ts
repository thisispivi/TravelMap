import type { TransportMode, TripJson, TripLegJson } from "../schema";
import { zonedDurationMinutes } from "./date";
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
 * Finds the dates a trip's itinerary actually covers, so the trip's own range
 * can be kept honest without the author maintaining it by hand.
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @returns {DerivedDateRange} The earliest and latest authored date
 */
export function deriveTripDateRange(
  steps: TripJson["steps"],
): DerivedDateRange {
  const dates = steps
    .flatMap((step) =>
      step.type === "stay"
        ? [step.checkIn, step.checkOut]
        : step.legs.flatMap((leg) => [leg.depart, leg.arrive]),
    )
    .flatMap((date) => (date ? [date.slice(0, 10)] : []))
    .toSorted();

  return { eDate: dates.at(-1), sDate: dates.at(0) };
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

/*
 * Roads and rails wind; a straight line under-reads them by roughly this much.
 * ponytail: one flat factor, swap for per-mode factors if stats look off.
 */
const SURFACE_DETOUR_FACTOR = 1.25;

/**
 * A derived measurement, flagged when it was estimated rather than authored so
 * a reader can be told it is approximate.
 * @property {number} value - The measurement
 * @property {boolean} estimated - Whether it was derived rather than authored
 */
export interface Measured {
  value: number;
  estimated: boolean;
}

/**
 * The one place a leg's distance is decided: the authored value, else the
 * flight or ferry detail, else the great-circle path through every via city,
 * stretched for surface modes.
 * @param {TripLegJson} leg - The authored leg
 * @param {[number, number][]} path - Coordinates from departure through vias to arrival
 * @returns {Measured} Kilometres travelled
 */
export function resolveLegDistance(
  leg: Pick<TripLegJson, "distanceInKm" | "ferry" | "flight" | "mode">,
  path: [number, number][],
): Measured {
  const authored =
    leg.flight?.distanceInKm ?? leg.ferry?.distanceInKm ?? leg.distanceInKm;
  if (authored !== undefined) return { estimated: false, value: authored };

  const straight = path
    .slice(1)
    .reduce(
      (sum, point, index) => sum + getCoordinatesDistance(path[index]!, point),
      0,
    );
  const factor =
    leg.mode === "plane" || leg.mode === "ferry" ? 1 : SURFACE_DETOUR_FACTOR;
  return { estimated: true, value: Math.round(straight * factor) };
}

/**
 * The one place a leg's duration is decided: the authored value, else the
 * difference between its local departure and arrival clocks, else an estimate
 * from mode and distance.
 * @param {TripLegJson} leg - The authored leg
 * @param {number} distanceKm - The leg's resolved distance
 * @param {string} departZone - IANA zone of the departure city
 * @param {string} arriveZone - IANA zone of the arrival city
 * @returns {Measured} Minutes travelled
 */
export function resolveLegDuration(
  leg: Pick<
    TripLegJson,
    "arrive" | "depart" | "durationMinutes" | "ferry" | "flight" | "mode"
  >,
  distanceKm: number,
  departZone: string,
  arriveZone: string,
): Measured {
  const authored =
    leg.flight?.durationMinutes ??
    leg.ferry?.durationMinutes ??
    leg.durationMinutes;
  if (authored !== undefined) return { estimated: false, value: authored };

  const timed =
    leg.depart && leg.arrive
      ? zonedDurationMinutes(leg.depart, departZone, leg.arrive, arriveZone)
      : undefined;
  if (timed !== undefined && timed > 0)
    return { estimated: false, value: timed };

  return {
    estimated: true,
    value: estimateDurationMinutes(leg.mode, distanceKm),
  };
}

/**
 * Where one authored leg sits in a trip and where it departs from.
 * @property {TripLegJson} leg - The authored leg
 * @property {string} fromId - The city it departs from
 * @property {number} index - Position of its step
 * @property {number} [outing] - Position of its day trip within a stay
 * @property {number} legIndex - Position within its chain
 */
export interface LocatedLeg {
  leg: TripLegJson;
  fromId: string;
  index: number;
  outing?: number;
  legIndex: number;
}

/**
 * Walks every authored leg in travel order, working out where each departs
 * from: the previous leg's arrival, its stay, or the trip's origin.
 * @param {TripJson} trip - The authored trip
 * @returns {LocatedLeg[]} Every leg with its departure city and position
 */
export function walkTripLegs(trip: TripJson): LocatedLeg[] {
  let here = trip.originCityId;
  return trip.steps.flatMap((step, index) => {
    if (step.type === "stay") {
      here = step.cityId;
      return (step.outings ?? []).flatMap((outing, outingIndex) => {
        let from = step.cityId;
        return outing.legs.map((leg, legIndex) => {
          const located = {
            fromId: from,
            index,
            leg,
            legIndex,
            outing: outingIndex,
          };
          from = leg.toId;
          return located;
        });
      });
    }
    return step.legs.map((leg, legIndex) => {
      const located = { fromId: here, index, leg, legIndex };
      here = leg.toId;
      return located;
    });
  });
}

/**
 * Lists the places a trip actually went — stays, places seen on day trips, and
 * places marked visited along a journey — in travel order, without stopovers.
 * @param {TripJson} trip - The authored trip
 * @returns {string[]} City ids, possibly repeated
 */
export function tripPlaceIds(trip: TripJson): string[] {
  return trip.steps.flatMap((step) =>
    step.type === "stay"
      ? [
          step.cityId,
          ...(step.outings ?? []).flatMap((outing) =>
            outing.legs.slice(0, -1).map((leg) => leg.toId),
          ),
        ]
      : step.legs.flatMap((leg) => (leg.visited ? [leg.toId] : [])),
  );
}
