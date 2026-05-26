import {
  City,
  FerryCompany,
  FlightCompany,
  FlightLeg,
  TransportMode,
  Trip,
} from "@/core";
import { takenFerries, takenFlights } from "@/data";

export type TripDetailBaseStopItem = {
  kind: "base-stop";
  city: City;
  travelIdx: number;
  nights: number;
  isLayover: boolean;
};

export type TripDetailDayTripItem = {
  kind: "day-trip";
  city: City;
  travelIdx: number;
  isNested: boolean;
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
};

export type TripDetailTimelineItem =
  | { kind: "origin"; city: City }
  | { kind: "return"; city: City }
  | {
      kind: "transport";
      mode: TransportMode;
      flightInfo?: TripDetailFlightInfo;
      ferryInfo?: TripDetailFerryInfo;
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

export function formatTripDetailDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function resolveTripDetailFlightInfo(
  from: City,
  to: City,
  leg?: FlightLeg,
): TripDetailFlightInfo | undefined {
  const match = takenFlights.find(
    (f) =>
      f.sCity.name === from.name &&
      f.eCity.name === to.name &&
      (!leg?.company || f.company === leg.company),
  );

  if (!match) return undefined;

  return {
    company: match.company,
    distanceKm: Math.round(match.distanceInKm),
    durationMinutes:
      leg?.durationMinutes ?? Math.round((match.distanceInKm / 900) * 60),
    number: leg?.number,
    class: leg?.class,
    departure: leg?.departure,
    arrival: leg?.arrival,
  };
}

function resolveTripDetailFerryInfo(
  from: City,
  to: City,
): TripDetailFerryInfo | undefined {
  const match = takenFerries.find(
    (f) => f.sCity.name === from.name && f.eCity.name === to.name,
  );

  if (!match) return undefined;

  return {
    company: match.company,
    distanceKm: Math.round(match.distanceInKm),
    durationMinutes: Math.round((match.distanceInKm / 45) * 60),
  };
}

export function buildTripDetailTimelineItems(
  trip: Trip,
): TripDetailTimelineItem[] {
  const items: TripDetailTimelineItem[] = [];
  let prevTransportCity: City | null = trip.origin?.city ?? null;
  let prevDestinationCity: City | null = trip.origin?.city ?? null;
  let lastBaseStop: City | null = null;

  if (trip.origin) {
    items.push({ kind: "origin", city: trip.origin.city });
  }

  for (const dest of trip.destinations) {
    const travel = dest.city.travels[dest.travelIdx];
    const nights = travel
      ? Math.ceil((travel.eDate.getTime() - travel.sDate.getTime()) / 86400000)
      : 0;
    const isLayover = dest.isLayover ?? false;
    const isBaseCity = nights > 0 || isLayover;

    if (dest.arrivalTransport) {
      items.push({
        kind: "transport",
        mode: dest.arrivalTransport,
        flightInfo:
          dest.arrivalTransport === "plane" && prevTransportCity
            ? resolveTripDetailFlightInfo(
                dest.arrivalFlight
                  ? (prevDestinationCity ?? prevTransportCity)
                  : prevTransportCity,
                dest.city,
                dest.arrivalFlight,
              )
            : undefined,
        ferryInfo:
          dest.arrivalTransport === "ferry" && prevTransportCity
            ? resolveTripDetailFerryInfo(prevTransportCity, dest.city)
            : undefined,
      });
    }

    if (isBaseCity) {
      items.push({
        kind: "base-stop",
        city: dest.city,
        travelIdx: dest.travelIdx,
        nights,
        isLayover,
      });
      if (!isLayover) lastBaseStop = dest.city;
      prevTransportCity = dest.city;
    } else {
      items.push({
        kind: "day-trip",
        city: dest.city,
        travelIdx: dest.travelIdx,
        isNested: lastBaseStop !== null,
      });
    }

    prevDestinationCity = dest.city;
  }

  if (trip.returnTo) {
    const returnFromCity = trip.returnTo.fromCity ?? prevTransportCity;

    items.push({
      kind: "transport",
      mode: trip.returnTo.transport,
      flightInfo:
        trip.returnTo.transport === "plane" && returnFromCity
          ? resolveTripDetailFlightInfo(
              returnFromCity,
              trip.returnTo.city,
              trip.returnTo.flight,
            )
          : undefined,
      ferryInfo:
        trip.returnTo.transport === "ferry" && returnFromCity
          ? resolveTripDetailFerryInfo(returnFromCity, trip.returnTo.city)
          : undefined,
    });
    items.push({ kind: "return", city: trip.returnTo.city });
  }

  return items;
}
