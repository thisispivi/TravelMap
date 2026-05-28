import {
  City,
  Ferry,
  FerryCompany,
  Flight,
  FlightCompany,
  TransportMode,
  Trip,
  TripStop,
  TripTransportStep,
} from "@/core";

type TripDetailBaseStopItem = {
  kind: "base-stop";
  city: City;
  travelIdx: number;
  stop: TripStop;
  nights: number;
  isLayover: boolean;
};

type TripDetailDayTripItem = {
  kind: "day-trip";
  city: City;
  travelIdx: number;
  stop: TripStop;
  isNested: boolean;
  parentCity: City | null;
};

export type TripDetailFlightInfo = {
  company: FlightCompany;
  distanceKm: number;
  durationMinutes: number;
  number?: string;
  class?: string;
  departure?: string;
  arrival?: string;
};

export type TripDetailFerryInfo = {
  company: FerryCompany;
  distanceKm: number;
  durationMinutes: number;
  via: City[]; // intermediate port stops
};

export type TripDetailBusInfo = {
  distanceKm: number;
  durationMinutes: number;
};

export type TripDetailTrainInfo = {
  distanceKm: number;
  durationMinutes: number;
};

export type TripDetailCarInfo = {
  distanceKm: number;
  durationMinutes: number;
};

export type TripDetailTimelineItem =
  | { kind: "origin"; city: City }
  | { kind: "return"; city: City }
  | {
      kind: "transport";
      mode: TransportMode;
      from: City;
      to: City;
      flightInfo?: TripDetailFlightInfo;
      ferryInfo?: TripDetailFerryInfo;
      busInfo?: TripDetailBusInfo;
      trainInfo?: TripDetailTrainInfo;
      carInfo?: TripDetailCarInfo;
    }
  | TripDetailBaseStopItem
  | TripDetailDayTripItem;

export const TRIP_DETAIL_FLIGHT_COMPANY_NAMES: Record<FlightCompany, string> = {
  [FlightCompany.RYANAIR]: "Ryanair",
  [FlightCompany.ALL_NIPPON_AIRWAYS]: "ANA",
  [FlightCompany.ITA_AIRWAYS]: "ITA Airways",
  [FlightCompany.ALITALIA]: "Alitalia",
  [FlightCompany.VOLOTEA]: "Volotea",
  [FlightCompany.EASYJET]: "easyJet",
  [FlightCompany.WIZZ_AIR]: "Wizz Air",
  [FlightCompany.AIR_ONE]: "Air One",
  [FlightCompany.CHINA_EASTERN_AIRLINES]: "China Eastern",
  [FlightCompany.JETSTAR]: "Jetstar",
  [FlightCompany.VIRGIN_AUSTRALIA]: "Virgin Australia",
  [FlightCompany.AEROITALIA]: "Aeroitalia",
};

export const TRIP_DETAIL_FERRY_COMPANY_NAMES: Record<FerryCompany, string> = {
  [FerryCompany.TIRRENIA]: "Tirrenia",
  [FerryCompany.CORSICA_FERRIES]: "Corsica Ferries",
  [FerryCompany.GRIMALDI_LINES]: "Grimaldi Lines",
};

/**
 * Formats a duration in minutes to a human-readable string (e.g. `"2h 30m"` or `"3h"`).
 */
export function formatTripDetailDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function resolveTripDetailFlightInfo(
  flight?: Flight,
  step?: TripTransportStep,
): TripDetailFlightInfo | undefined {
  if (!flight?.company) return undefined;

  return {
    company: flight.company,
    distanceKm: Math.round(flight.distanceInKm),
    durationMinutes: flight.durationMinutes,
    number: flight.number,
    class: flight.class,
    departure: step?.flight?.departure,
    arrival: step?.flight?.arrival,
  };
}

function resolveTripDetailFerryInfo(
  ferry?: Ferry,
): TripDetailFerryInfo | undefined {
  if (!ferry?.company) return undefined;

  return {
    company: ferry.company,
    distanceKm: Math.round(ferry.distanceInKm),
    durationMinutes: ferry.durationMinutes,
    via: ferry.via ?? [],
  };
}

/**
 * Builds a minimal distance+duration info object for ground transport modes
 * (bus, train, car) that have no company or extra leg data.
 */
function resolveTripDetailGroundInfo(
  step: TripTransportStep,
): { distanceKm: number; durationMinutes: number } | undefined {
  if (!step.distanceInKm && !step.durationMinutes) return undefined;
  return {
    distanceKm: Math.round(step.distanceInKm ?? 0),
    durationMinutes: step.durationMinutes ?? 0,
  };
}

/**
 * Converts a `Trip` into an ordered flat list of `TripDetailTimelineItem`s
 * suitable for rendering the vertical trip timeline. The list always starts
 * with an `"origin"` item and ends with a `"return"` item; everything in
 * between is derived from the trip's steps in order.
 *
 * @param trip - The trip to transform
 * @returns Ordered list of timeline items
 */
export function buildTripDetailTimelineItems(
  trip: Trip,
): TripDetailTimelineItem[] {
  const items: TripDetailTimelineItem[] = [];
  let lastBaseStop: City | null = null;
  const cityIndexes = new Map<string, number>();

  items.push({ kind: "origin", city: trip.origin.city });

  for (const step of trip.steps) {
    if (step.type === "transport") {
      const flight =
        step.mode === "plane"
          ? new Flight({
              sCity: step.from,
              eCity: step.to,
              company: step.flight?.company,
              sDate: step.sDate,
              eDate: step.eDate,
              distanceInKm: step.flight?.distanceInKm ?? step.distanceInKm,
              durationMinutes:
                step.flight?.durationMinutes ?? step.durationMinutes,
              number: step.flight?.number,
              class: step.flight?.class,
            })
          : undefined;
      const ferry =
        step.mode === "ferry"
          ? new Ferry({
              sCity: step.from,
              eCity: step.to,
              company: step.ferry?.company,
              sDate: step.sDate,
              eDate: step.eDate,
              via: step.ferry?.via ?? step.via,
              distanceInKm: step.ferry?.distanceInKm ?? step.distanceInKm,
              durationMinutes:
                step.ferry?.durationMinutes ?? step.durationMinutes,
            })
          : undefined;

      items.push({
        kind: "transport",
        mode: step.mode,
        from: step.from,
        to: step.to,
        flightInfo:
          step.mode === "plane"
            ? resolveTripDetailFlightInfo(flight, step)
            : undefined,
        ferryInfo:
          step.mode === "ferry" ? resolveTripDetailFerryInfo(ferry) : undefined,
        busInfo:
          step.mode === "bus" ? resolveTripDetailGroundInfo(step) : undefined,
        trainInfo:
          step.mode === "train" ? resolveTripDetailGroundInfo(step) : undefined,
        carInfo:
          step.mode === "car" ? resolveTripDetailGroundInfo(step) : undefined,
      });
      continue;
    }

    const travelIdx = cityIndexes.get(step.city.name) ?? 0;
    cityIndexes.set(step.city.name, travelIdx + 1);
    const nights = Math.ceil(
      (step.eDate.getTime() - step.sDate.getTime()) / 86400000,
    );
    const isLayover = step.isLayover ?? false;
    const isBaseCity = nights > 0 || isLayover;

    if (isBaseCity) {
      items.push({
        kind: "base-stop",
        city: step.city,
        travelIdx,
        stop: step,
        nights,
        isLayover,
      });
      if (!isLayover) lastBaseStop = step.city;
    } else {
      items.push({
        kind: "day-trip",
        city: step.city,
        travelIdx,
        stop: step,
        isNested: lastBaseStop !== null,
        parentCity: lastBaseStop,
      });
    }
  }

  items.push({ kind: "return", city: trip.returnTo.city });

  return items;
}
