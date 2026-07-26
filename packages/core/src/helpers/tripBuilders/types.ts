import type {
  City,
  FerryCompany,
  FlightCompany,
  TransportMode,
  TripRouteStep,
  TripStopStep,
  TripTransportStep,
} from "@travelmap/core";

/**
 * Arguments for creating a concrete Date value.
 * @property {number} year - The full year
 * @property {number} monthIndex - The zero-based month index
 * @property {number} day - The day of the month
 * @property {number} [hours] - The hour
 * @property {number} [minutes] - The minute
 * @property {number} [seconds] - The second
 * @property {number} [milliseconds] - The millisecond
 */
export type DateArgs = {
  year: number;
  monthIndex: number;
  day: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

/**
 * Photo module lookup key under src/data, without the .ts extension.
 * @property {string} path - The photo module path
 */
export type TripPhotosArgs = {
  path: string;
};

/**
 * Extra data allowed on a stop without overwriting core fields.
 */
type StayData = Omit<
  Partial<TripStopStep>,
  "type" | "city" | "sDate" | "eDate" | "photos"
>;

/**
 * Extra data allowed on a transport step without overwriting core fields.
 */
type MoveData = Omit<TripTransportStep, "type" | "mode" | "from" | "to">;

/**
 * Arguments for a stop (stay) entry.
 * @property {City} city - The stay city
 * @property {Date} sDate - The stay start date
 * @property {Date} eDate - The stay end date
 * @property {string} [photoPath] - The photo module path
 * @property {StayData} [data] - Additional stop metadata
 */
export type StayArgs = {
  city: City;
  sDate: Date;
  eDate: Date;
  photoPath?: string;
  data?: StayData;
};

/**
 * Arguments for a transport step.
 * @property {TransportMode} mode - The transport mode
 * @property {City} from - The origin city
 * @property {City} to - The destination city
 * @property {MoveData} [data] - Additional transport metadata
 */
export type MoveArgs = {
  mode: TransportMode;
  from: City;
  to: City;
  data?: MoveData;
};

/**
 * Arguments for a plane step.
 * @property {City} from - The origin city
 * @property {City} to - The destination city
 * @property {FlightCompany} [company] - The flight company
 * @property {MoveData} [data] - Additional transport metadata
 */
export type PlaneArgs = {
  from: City;
  to: City;
  company?: FlightCompany;
  data?: MoveData;
};

/**
 * Arguments for a ferry step.
 * @property {City} from - The origin city
 * @property {City} to - The destination city
 * @property {FerryCompany} [company] - The ferry company
 * @property {MoveData} [data] - Additional transport metadata
 */
export type FerryArgs = {
  from: City;
  to: City;
  company?: FerryCompany;
  data?: MoveData;
};

/**
 * Arguments for a trip wrapper.
 * @property {string} id - The trip identifier
 * @property {Date} sDate - The trip start date
 * @property {Date} eDate - The trip end date
 * @property {City} origin - The origin city
 * @property {City} returnTo - The return city
 * @property {TripRouteStep[]} steps - The ordered route steps
 * @property {{ center: [number, number]; zoom: number }} [mapFocus] - The authored map viewport
 */
export type TripArgs = {
  id: string;
  sDate: Date;
  eDate: Date;
  origin: City;
  returnTo: City;
  steps: TripRouteStep[];
  mapFocus?: { center: [number, number]; zoom: number };
};

/**
 * Arguments for a simple round-trip by plane.
 * @property {string} id - The trip identifier
 * @property {City} city - The destination city
 * @property {Date} sDate - The trip start date
 * @property {Date} eDate - The trip end date
 * @property {FlightCompany} company - The flight company
 * @property {string} photoPath - The photo module path
 * @property {TripRouteStep[]} [extraStops] - Additional route steps
 * @property {MoveData} [data] - Additional flight metadata
 * @property {{ center: [number, number]; zoom: number }} [mapFocus] - The authored map viewport
 */
export type RoundTripByPlaneArgs = {
  id: string;
  city: City;
  sDate: Date;
  eDate: Date;
  company: FlightCompany;
  photoPath: string;
  extraStops?: TripRouteStep[];
  data?: MoveData;
  mapFocus?: { center: [number, number]; zoom: number };
};
