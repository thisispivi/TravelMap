import type { TripStopStep, TripTransportStep } from "@/core";
import { Image, Trip } from "@/core";
import { Cagliari } from "@/data/Italy/Cagliari/Cagliari";

import type {
  DateArgs,
  FerryArgs,
  MoveArgs,
  PlaneArgs,
  RoundTripByPlaneArgs,
  StayArgs,
  TripArgs,
  TripPhotosArgs,
} from "./types";

const photoModules = import.meta.glob("../../../data/**/photos/tr_*.ts", {
  eager: true,
}) as Record<string, Record<string, Image[]>>;

/**
 * Build a Date from explicit parts for consistent data declarations.
 *
 * @param {DateArgs} args - Date components in local time.
 * @param {number} args.year - Full year (e.g. 2024).
 * @param {number} args.monthIndex - Zero-based month index (0-11).
 * @param {number} args.day - Day of the month (1-31).
 * @param {number} [args.hours=0] - Hours (0-23).
 * @param {number} [args.minutes=0] - Minutes (0-59).
 * @param {number} [args.seconds=0] - Seconds (0-59).
 * @param {number} [args.milliseconds=0] - Milliseconds (0-999).
 * @returns {Date} A Date instance in local time.
 */
export const d = ({
  year,
  monthIndex,
  day,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DateArgs): Date =>
  new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds);

/**
 * Resolve a photo list from a src/data photo module path.
 *
 * @param {TripPhotosArgs} args - Photo module lookup info.
 * @param {string} args.path - Path under src/data without the .ts extension.
 * @returns {Image[]} Resolved image list, or an empty array if missing.
 */
function tripPhotos({ path }: TripPhotosArgs): Image[] {
  return Object.values(photoModules[`../../../data/${path}.ts`] ?? {})[0] ?? [];
}

/**
 * Create a stop (stay) step with optional photo path and extra data.
 *
 * @param {StayArgs} args - Stop details.
 * @param {City} args.city - City where the stay happens.
 * @param {Date} args.sDate - Start date.
 * @param {Date} args.eDate - End date.
 * @param {string} [args.photoPath] - Photo module path under src/data.
 * @param {StayData} [args.data] - Extra metadata applied to the stop.
 * @returns {TripStopStep} A stop step for the trip route.
 */
export function stay({
  city,
  sDate,
  eDate,
  photoPath,
  data = {},
}: StayArgs): TripStopStep {
  return {
    type: "stop",
    city,
    sDate,
    eDate,
    photos: photoPath ? tripPhotos({ path: photoPath }) : undefined,
    ...data,
  };
}

/**
 * Create a transport step (car, bus, train, plane, ferry).
 *
 * @param {MoveArgs} args - Transport details.
 * @param {TransportMode} args.mode - Travel mode.
 * @param {City} args.from - Origin city.
 * @param {City} args.to - Destination city.
 * @param {MoveData} [args.data] - Extra transport metadata.
 * @returns {TripTransportStep} A transport step for the trip route.
 */
export function move({
  mode,
  from,
  to,
  data = {},
}: MoveArgs): TripTransportStep {
  return { type: "transport", mode, from, to, ...data };
}

/**
 * Create a plane transport step with optional flight metadata.
 *
 * @param {PlaneArgs} args - Plane transport details.
 * @param {City} args.from - Origin city.
 * @param {City} args.to - Destination city.
 * @param {FlightCompany} [args.company] - Flight company identifier.
 * @param {MoveData} [args.data] - Extra transport metadata.
 * @returns {TripTransportStep} A transport step with flight metadata.
 */
export const plane = ({
  from,
  to,
  company,
  data = {},
}: PlaneArgs): TripTransportStep =>
  move({
    mode: "plane",
    from,
    to,
    data: { ...data, flight: { company, ...data.flight } },
  });

/**
 * Create a ferry transport step with optional ferry metadata.
 *
 * @param {FerryArgs} args - Ferry transport details.
 * @param {City} args.from - Origin city.
 * @param {City} args.to - Destination city.
 * @param {FerryCompany} [args.company] - Ferry company identifier.
 * @param {MoveData} [args.data] - Extra transport metadata.
 * @returns {TripTransportStep} A transport step with ferry metadata.
 */
export const ferry = ({
  from,
  to,
  company,
  data = {},
}: FerryArgs): TripTransportStep =>
  move({
    mode: "ferry",
    from,
    to,
    data: { ...data, ferry: { company, ...data.ferry } },
  });

/**
 * Wrap steps into a Trip instance with a background image key.
 *
 * @param {TripArgs} args - Trip details.
 * @param {string} args.id - Trip identifier and background image key.
 * @param {Date} args.sDate - Trip start date.
 * @param {Date} args.eDate - Trip end date.
 * @param {City} args.origin - Origin city.
 * @param {City} args.returnTo - Return city.
 * @param {TripRouteStep[]} args.steps - Route steps in order.
 * @returns {Trip} A Trip instance with the provided steps.
 */
export function trip({
  id,
  sDate,
  eDate,
  origin,
  returnTo,
  steps,
  mapFocus,
}: TripArgs): Trip {
  return new Trip({
    id,
    sDate,
    eDate,
    origin: { city: origin },
    returnTo: { city: returnTo },
    steps,
    backgroundImgSourceKey: `${id}.jpg`,
    mapFocus,
  });
}

/**
 * Build a simple round trip by plane from the default origin (Cagliari).
 *
 * @param {RoundTripByPlaneArgs} args - Round trip details.
 * @param {string} args.id - Trip identifier and background image key.
 * @param {City} args.city - Destination city.
 * @param {Date} args.sDate - Trip start date.
 * @param {Date} args.eDate - Trip end date.
 * @param {FlightCompany} args.company - Flight company identifier.
 * @param {string} args.photoPath - Photo module path under src/data.
 * @param {TripRouteStep[]} [args.extraStops] - Optional extra route steps.
 * @param {MoveData} [args.data] - Extra metadata applied to flight steps.
 * @returns {Trip} A Trip instance with outbound and return flights.
 */
export function roundTripByPlane({
  id,
  city,
  sDate,
  eDate,
  company,
  photoPath,
  extraStops = [],
  data = {},
  mapFocus,
}: RoundTripByPlaneArgs): Trip {
  return trip({
    id,
    sDate,
    eDate,
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({ from: Cagliari, to: city, company, data }),
      stay({ city, sDate, eDate, photoPath }),
      ...extraStops,
      plane({ from: city, to: Cagliari, company, data }),
    ],
    mapFocus,
  });
}
