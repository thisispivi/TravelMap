import type {
  City,
  FerryCompany,
  FlightCompany,
  TransportMode,
  TripRouteStep,
  TripStopStep,
  TripTransportStep,
} from "@/core";

/** Arguments for creating a concrete Date value. */
export type DateArgs = {
  year: number;
  monthIndex: number;
  day: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

/** Photo module lookup key under src/data, without the .ts extension. */
export type TripPhotosArgs = {
  path: string;
};

/** Extra data allowed on a stop without overwriting core fields. */
type StayData = Omit<
  Partial<TripStopStep>,
  "type" | "city" | "sDate" | "eDate" | "photos"
>;

/** Extra data allowed on a transport step without overwriting core fields. */
type MoveData = Omit<TripTransportStep, "type" | "mode" | "from" | "to">;

/** Arguments for a stop (stay) entry. */
export type StayArgs = {
  city: City;
  sDate: Date;
  eDate: Date;
  photoPath?: string;
  data?: StayData;
};

/** Arguments for a transport step. */
export type MoveArgs = {
  mode: TransportMode;
  from: City;
  to: City;
  data?: MoveData;
};

/** Arguments for a plane step. */
export type PlaneArgs = {
  from: City;
  to: City;
  company?: FlightCompany;
  data?: MoveData;
};

/** Arguments for a ferry step. */
export type FerryArgs = {
  from: City;
  to: City;
  company?: FerryCompany;
  data?: MoveData;
};

/** Arguments for a trip wrapper. */
export type TripArgs = {
  id: string;
  sDate: Date;
  eDate: Date;
  origin: City;
  returnTo: City;
  steps: TripRouteStep[];
};

/** Arguments for a simple round-trip by plane. */
export type RoundTripByPlaneArgs = {
  id: string;
  city: City;
  sDate: Date;
  eDate: Date;
  company: FlightCompany;
  photoPath: string;
  extraStops?: TripRouteStep[];
  data?: MoveData;
};
