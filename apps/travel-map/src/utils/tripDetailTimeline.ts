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
} from "@travelmap/core";

import { getCityOffsetMinutesOnDate } from "@/utils/timezoneOffset";

/**
 * Represents a trip detail base stop item.
 * @property {"base-stop"} kind - The kind
 * @property {City} city - The city
 * @property {number} travelIdx - The travel idx
 * @property {TripStop} stop - The stop
 * @property {number} nights - The nights
 * @property {boolean} isLayover - Whether the stop is only a layover
 */
type TripDetailBaseStopItem = {
  kind: "base-stop";
  city: City;
  travelIdx: number;
  stop: TripStop;
  nights: number;
  isLayover: boolean;
};

/**
 * Represents a trip detail day trip item.
 * @property {"day-trip"} kind - The kind
 * @property {City} city - The city
 * @property {number} travelIdx - The travel idx
 * @property {TripStop} stop - The stop
 * @property {boolean} isNested - Whether the item belongs to a nested excursion
 * @property {City | null} parentCity - The parent city
 */
type TripDetailDayTripItem = {
  kind: "day-trip";
  city: City;
  travelIdx: number;
  stop: TripStop;
  isNested: boolean;
  parentCity: City | null;
};

/**
 * Represents a trip detail flight info.
 * @property {FlightCompany} company - The company
 * @property {number} distanceKm - The distance km
 * @property {number} durationMinutes - The duration minutes
 * @property {string} [number] - The number
 * @property {string} [class] - The class
 * @property {string} [departure] - The departure
 * @property {string} [arrival] - The arrival
 */
type TripDetailFlightInfo = {
  company: FlightCompany;
  distanceKm: number;
  durationMinutes: number;
  number?: string;
  class?: string;
  departure?: string;
  arrival?: string;
};

/**
 * Represents a trip detail ferry info.
 * @property {FerryCompany} [company] - The company
 * @property {number} distanceKm - The distance km
 * @property {number} durationMinutes - The duration minutes
 * @property {City[]} via - The via
 */
type TripDetailFerryInfo = {
  company?: FerryCompany;
  distanceKm: number;
  durationMinutes: number;
  via: City[];
};

/**
 * Distance and duration for a ground transport leg (bus, train, car, taxi, walk).
 * @property {number} distanceKm - The segment distance in kilometres
 * @property {number} durationMinutes - The segment duration in minutes
 */
type TripDetailGroundInfo = {
  distanceKm: number;
  durationMinutes: number;
};

/**
 * Represents a trip detail bus info.
 */
type TripDetailBusInfo = TripDetailGroundInfo;

/**
 * Represents a trip detail train info.
 */
type TripDetailTrainInfo = TripDetailGroundInfo;

/**
 * Represents a trip detail car info.
 */
type TripDetailCarInfo = TripDetailGroundInfo;

/**
 * Represents a trip detail taxi info.
 */
type TripDetailTaxiInfo = TripDetailGroundInfo;

/**
 * Represents a trip detail walk info.
 */
type TripDetailWalkInfo = TripDetailGroundInfo;

/**
 * A renderable item in the flattened trip detail timeline.
 */
export type TripDetailTimelineItem =
  | { kind: "origin"; city: City }
  | { kind: "return"; city: City }
  | {
      kind: "transport";
      mode: TransportMode;
      from: City;
      to: City;
      isRoundTrip?: boolean;
      flightInfo?: TripDetailFlightInfo;
      ferryInfo?: TripDetailFerryInfo;
      busInfo?: TripDetailBusInfo;
      trainInfo?: TripDetailTrainInfo;
      carInfo?: TripDetailCarInfo;
      taxiInfo?: TripDetailTaxiInfo;
      walkInfo?: TripDetailWalkInfo;
    }
  | TripDetailBaseStopItem
  | TripDetailDayTripItem;

/**
 * Display names for flight companies shown in trip details.
 */
const TRIP_DETAIL_FLIGHT_COMPANY_NAMES: Record<FlightCompany, string> = {
  [FlightCompany.RYANAIR]: "Ryanair",
  [FlightCompany.ALL_NIPPON_AIRWAYS]: "ANA",
  [FlightCompany.ITA_AIRWAYS]: "ITA Airways",
  [FlightCompany.EASYJET]: "easyJet",
  [FlightCompany.WIZZ_AIR]: "Wizz Air",
  [FlightCompany.CHINA_EASTERN_AIRLINES]: "China Eastern",
  [FlightCompany.JETSTAR]: "Jetstar",
  [FlightCompany.VIRGIN_AUSTRALIA]: "Virgin Australia",
  [FlightCompany.AEROITALIA]: "Aeroitalia",
};

/**
 * Display names for ferry companies shown in trip details.
 */
const TRIP_DETAIL_FERRY_COMPANY_NAMES: Record<FerryCompany, string> = {
  [FerryCompany.TIRRENIA]: "Tirrenia",
  [FerryCompany.CORSICA_FERRIES]: "Corsica Ferries",
};

/**
 * Formats a duration in minutes to a human-readable string (e.g. `"2h 30m"` or `"3h"`).
 * @param {number} minutes - The duration in minutes
 * @returns {string} The compact duration label
 */
export function formatTripDetailDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Normalizes optional flight and route-step data for the trip timeline.
 * @param {Flight} [flight] - The flight domain object
 * @param {TripTransportStep} [step] - The corresponding transport step
 * @returns {TripDetailFlightInfo | undefined} Flight details when a company is available
 */
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

/**
 * Normalizes optional ferry data for the trip timeline.
 * @param {Ferry} [ferry] - The ferry domain object
 * @returns {TripDetailFerryInfo | undefined} Ferry details when meaningful data is available
 */
function resolveTripDetailFerryInfo(
  ferry?: Ferry,
): TripDetailFerryInfo | undefined {
  if (!ferry) return undefined;
  if (!ferry.company && !ferry.distanceInKm && !ferry.durationMinutes)
    return undefined;

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
 * @param {TripTransportStep} step - The ground transport step
 * @returns {{ distanceKm: number; durationMinutes: number } | undefined} Ground transport details when present
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
 * @param {Trip} trip - The trip to transform
 * @returns {TripDetailTimelineItem[]} Ordered list of timeline items
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
        isRoundTrip: step.roundTrip,
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
        taxiInfo:
          step.mode === "taxi" ? resolveTripDetailGroundInfo(step) : undefined,
        walkInfo:
          step.mode === "walk" ? resolveTripDetailGroundInfo(step) : undefined,
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

/**
 * One segment of a (possibly multi-leg) transport connector row.
 * @property {TransportMode} mode - The transport mode
 * @property {City} from - The origin city
 * @property {City} to - The destination city
 * @property {string} [company] - The carrier name
 * @property {number} distanceKm - The distance in kilometers
 * @property {number} durationMinutes - The duration in minutes
 * @property {City[]} [via] - Intermediate cities
 * @property {boolean} [isRoundTrip] - Whether the leg is a round trip
 */
export type TransportLeg = {
  mode: TransportMode;
  from: City;
  to: City;
  company?: string;
  distanceKm: number;
  durationMinutes: number;
  via?: City[];
  isRoundTrip?: boolean;
};

/**
 * A single excursion (nested day trip) to be rendered under a stay group.
 * @property {City} city - The excursion city
 * @property {number} travelIdx - The city's travel index
 * @property {TripStop} stop - The excursion stop data
 * @property {string} key - The stable render key
 * @property {{ mode: TransportMode; distanceKm: number; durationMinutes: number; fromCity: City; isRoundTrip?: boolean }} [inboundTransport] - Transport into the excursion
 * @property {{ mode: TransportMode; distanceKm: number; durationMinutes: number; toCity: City }} [returnTransport] - Transport returning from the excursion
 * @property {boolean} chainBreakBefore - Whether a new excursion chain starts here
 */
export interface ExcursionItem {
  city: City;
  travelIdx: number;
  stop: TripStop;
  key: string;
  inboundTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    fromCity: City;
    isRoundTrip?: boolean;
  };
  returnTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    toCity: City;
  };
  chainBreakBefore: boolean;
}

/**
 * Represents an intermediate origin.
 * @property {"origin"} type - The type
 * @property {City} city - The city
 */
type IntermediateOrigin = {
  type: "origin";
  city: City;
};

/**
 * Represents an intermediate return.
 * @property {"return"} type - The type
 * @property {City} city - The city
 */
type IntermediateReturn = {
  type: "return";
  city: City;
};

/**
 * Represents an intermediate transport.
 * @property {"transport"} type - The type
 * @property {TransportLeg[]} legs - The legs
 */
type IntermediateTransport = {
  type: "transport";
  legs: TransportLeg[];
};

/**
 * Represents an intermediate stay.
 * @property {"stay"} type - The type
 * @property {City} city - The city
 * @property {TripStop} stop - The stop
 * @property {number} nights - The nights
 * @property {number} travelIdx - The travel idx
 */
type IntermediateStay = {
  type: "stay";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
};

/**
 * Represents an intermediate day trip.
 * @property {"day-trip"} type - The type
 * @property {City} city - The city
 * @property {TripStop} stop - The stop
 * @property {number} travelIdx - The travel idx
 * @property {boolean} isNested - Whether the item belongs to a nested excursion
 * @property {City | null} parentCity - The parent city
 */
type IntermediateDayTrip = {
  type: "day-trip";
  city: City;
  stop: TripStop;
  travelIdx: number;
  isNested: boolean;
  parentCity: City | null;
};

/**
 * Represents an intermediate item.
 */
type IntermediateItem =
  | IntermediateOrigin
  | IntermediateReturn
  | IntermediateTransport
  | IntermediateStay
  | IntermediateDayTrip;

/**
 * Represents a segment origin.
 * @property {"origin"} type - The type
 * @property {City} city - The city
 * @property {string} key - The key
 */
type SegmentOrigin = {
  type: "origin";
  city: City;
  key: string;
};

/**
 * Represents a segment return.
 * @property {"return"} type - The type
 * @property {City} city - The city
 * @property {string} key - The key
 */
type SegmentReturn = {
  type: "return";
  city: City;
  key: string;
};

/**
 * Represents a segment transport.
 * @property {"transport"} type - The type
 * @property {TransportLeg[]} legs - The legs
 * @property {string} key - The key
 */
type SegmentTransport = {
  type: "transport";
  legs: TransportLeg[];
  key: string;
};

/**
 * Represents a segment day trip.
 * @property {"day-trip"} type - The type
 * @property {City} city - The city
 * @property {TripStop} stop - The stop
 * @property {number} travelIdx - The travel idx
 * @property {boolean} isNested - Whether the segment belongs to a nested excursion
 * @property {string} key - The key
 * @property {{ mode: TransportMode; distanceKm: number; durationMinutes: number; fromCity: City; isRoundTrip?: boolean }} [inboundTransport] - The inbound transport
 * @property {{ mode: TransportMode; distanceKm: number; durationMinutes: number; toCity: City }} [returnTransport] - The return transport
 * @property {boolean} chainBreakBefore - The chain break before
 */
type SegmentDayTrip = {
  type: "day-trip";
  city: City;
  stop: TripStop;
  travelIdx: number;
  isNested: boolean;
  key: string;
  inboundTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    fromCity: City;
    isRoundTrip?: boolean;
  };
  returnTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    toCity: City;
  };
  chainBreakBefore: boolean;
};

/**
 * Represents a segment stay.
 * @property {"stay"} type - The type
 * @property {City} city - The city
 * @property {TripStop} stop - The stop
 * @property {number} nights - The nights
 * @property {number} travelIdx - The travel idx
 * @property {string} key - The key
 */
type SegmentStay = {
  type: "stay";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
  key: string;
};

/**
 * Represents a segment stay group.
 * @property {"stay-group"} type - The type
 * @property {City} city - The city
 * @property {TripStop} stop - The stop
 * @property {number} nights - The nights
 * @property {number} travelIdx - The travel idx
 * @property {ExcursionItem[]} excursions - The excursions
 * @property {string} key - The key
 */
type SegmentStayGroup = {
  type: "stay-group";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
  excursions: ExcursionItem[];
  key: string;
};

/**
 * Represents a display segment ready for the Timeline component to render.
 */
export type DisplaySegment =
  | SegmentOrigin
  | SegmentReturn
  | SegmentTransport
  | SegmentStay
  | SegmentStayGroup
  | SegmentDayTrip;

/**
 * Merge consecutive transport items into single multi-leg connectors, stopping
 * at each base-city stop. Layover stops inside a transport chain are consumed.
 * @param {TripDetailTimelineItem[]} items - Flat timeline items from buildTripDetailTimelineItems
 * @returns {IntermediateItem[]} Simplified list with merged transport chunks
 */
function collapseTransportChains(
  items: TripDetailTimelineItem[],
): IntermediateItem[] {
  const baseCities = new Set<string>();
  for (const item of items) {
    if (item.kind === "base-stop" && !item.isLayover) {
      baseCities.add(item.city.name);
    }
  }
  const result: IntermediateItem[] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item.kind === "transport") {
      const legs: TransportLeg[] = [];
      while (i < items.length && items[i].kind === "transport") {
        const leg = items[i] as Extract<
          TripDetailTimelineItem,
          {
            kind: "transport";
          }
        >;
        const info =
          leg.flightInfo ??
          leg.ferryInfo ??
          leg.busInfo ??
          leg.trainInfo ??
          leg.carInfo ??
          leg.taxiInfo ??
          leg.walkInfo;
        const company = leg.flightInfo
          ? TRIP_DETAIL_FLIGHT_COMPANY_NAMES[leg.flightInfo.company]
          : leg.ferryInfo?.company
            ? TRIP_DETAIL_FERRY_COMPANY_NAMES[leg.ferryInfo.company]
            : undefined;
        legs.push({
          mode: leg.mode,
          from: leg.from,
          to: leg.to,
          company,
          distanceKm: info?.distanceKm ?? 0,
          durationMinutes: info?.durationMinutes ?? 0,
          via: leg.ferryInfo?.via,
          isRoundTrip: leg.isRoundTrip,
        });
        i++;
        if (baseCities.has(leg.to.name)) {
          break;
        }
        const peek = items[i];
        if (
          peek?.kind === "base-stop" &&
          (
            peek as Extract<
              TripDetailTimelineItem,
              {
                kind: "base-stop";
              }
            >
          ).isLayover
        ) {
          i++;
        } else {
          break;
        }
      }
      result.push({ type: "transport", legs });
    } else if (item.kind === "base-stop") {
      if (!item.isLayover) {
        result.push({
          type: "stay",
          city: item.city,
          stop: item.stop,
          nights: item.nights,
          travelIdx: item.travelIdx,
        });
      }
      i++;
    } else if (item.kind === "day-trip") {
      result.push({
        type: "day-trip",
        city: item.city,
        stop: item.stop,
        travelIdx: item.travelIdx,
        isNested: item.isNested,
        parentCity: item.parentCity,
      });
      i++;
    } else if (item.kind === "origin") {
      result.push({ type: "origin", city: item.city });
      i++;
    } else if (item.kind === "return") {
      result.push({ type: "return", city: item.city });
      i++;
    } else {
      i++;
    }
  }
  return result;
}

/**
 * Convert intermediate timeline items into final display segments, grouping
 * nested day trips under their parent stay and promoting forward-exit excursions
 * that depart from the excursion city rather than the parent base.
 * @param {TripDetailTimelineItem[]} items - Flat timeline items
 * @returns {DisplaySegment[]} Final segments ready for rendering
 */
export function buildDisplaySegments(
  items: TripDetailTimelineItem[],
): DisplaySegment[] {
  const intermediate = collapseTransportChains(items);
  const raw: (
    | SegmentOrigin
    | SegmentReturn
    | SegmentTransport
    | SegmentStay
    | SegmentDayTrip
  )[] = [];
  let pendingDayTripTransport: SegmentDayTrip["inboundTransport"];
  let pendingDayTripTransportFrom: City | null = null;
  for (let i = 0; i < intermediate.length; i++) {
    const item = intermediate[i];
    if (item.type === "transport") {
      const prev = i > 0 ? intermediate[i - 1] : null;
      if (prev?.type === "day-trip" && prev.parentCity) {
        const finalDest = item.legs[item.legs.length - 1].to;
        if (finalDest.name === prev.parentCity.name) {
          const lastRaw = raw[raw.length - 1];
          if (lastRaw?.type === "day-trip") {
            const legs = item.legs;
            (lastRaw as SegmentDayTrip).returnTransport = {
              mode: legs[0].mode,
              distanceKm: legs.reduce((s, l) => s + l.distanceKm, 0),
              durationMinutes: legs.reduce((s, l) => s + l.durationMinutes, 0),
              toCity: legs[legs.length - 1].to,
            };
          }
          continue;
        }
      }
      const next = i + 1 < intermediate.length ? intermediate[i + 1] : null;
      const leadsToNestedDayTrip =
        next?.type === "day-trip" && (next as IntermediateDayTrip).isNested;
      if (leadsToNestedDayTrip) {
        const lastLeg = item.legs[item.legs.length - 1];
        if (
          lastLeg.mode === "car" ||
          lastLeg.mode === "bus" ||
          lastLeg.mode === "taxi" ||
          lastLeg.mode === "train" ||
          lastLeg.mode === "ferry" ||
          lastLeg.mode === "walk"
        ) {
          pendingDayTripTransport = {
            mode: lastLeg.mode,
            distanceKm: lastLeg.distanceKm,
            durationMinutes: lastLeg.durationMinutes,
            fromCity: lastLeg.from,
            isRoundTrip: lastLeg.isRoundTrip,
          };
          pendingDayTripTransportFrom = lastLeg.from;
          continue;
        }
      }
      pendingDayTripTransportFrom = null;
      raw.push({ type: "transport", legs: item.legs, key: `transport-${i}` });
    } else if (item.type === "stay") {
      pendingDayTripTransport = undefined;
      pendingDayTripTransportFrom = null;
      raw.push({
        type: "stay",
        city: item.city,
        stop: item.stop,
        nights: item.nights,
        travelIdx: item.travelIdx,
        key: `stay-${item.city.name}-${item.travelIdx}`,
      });
    } else if (item.type === "day-trip") {
      const isNested = (item as IntermediateDayTrip).isNested;
      const parentCity = (item as IntermediateDayTrip).parentCity;
      const inboundTransport = isNested ? pendingDayTripTransport : undefined;
      const chainBreakBefore =
        !pendingDayTripTransportFrom ||
        !parentCity ||
        pendingDayTripTransportFrom.name === parentCity.name;
      pendingDayTripTransport = undefined;
      pendingDayTripTransportFrom = null;
      raw.push({
        type: "day-trip",
        city: item.city,
        stop: item.stop,
        travelIdx: item.travelIdx,
        isNested,
        key: `day-trip-${item.city.name}-${item.travelIdx}`,
        inboundTransport,
        chainBreakBefore,
      });
    } else if (item.type === "origin") {
      pendingDayTripTransportFrom = null;
      raw.push({ type: "origin", city: item.city, key: "origin" });
    } else if (item.type === "return") {
      raw.push({ type: "return", city: item.city, key: "return" });
    }
  }
  const merged: DisplaySegment[] = [];
  let j = 0;
  while (j < raw.length) {
    const seg = raw[j];
    if (seg.type === "stay") {
      const excursions: ExcursionItem[] = [];
      let k = j + 1;
      while (
        k < raw.length &&
        raw[k].type === "day-trip" &&
        (raw[k] as SegmentDayTrip).isNested
      ) {
        const exc = raw[k] as SegmentDayTrip;
        excursions.push({
          city: exc.city,
          travelIdx: exc.travelIdx,
          stop: exc.stop,
          key: exc.key,
          inboundTransport: exc.inboundTransport,
          returnTransport: exc.returnTransport,
          chainBreakBefore: exc.chainBreakBefore,
        });
        k++;
      }
      let forwardExitExc: ExcursionItem | null = null;
      const nextRaw = k < raw.length ? raw[k] : null;
      if (nextRaw?.type === "transport" && excursions.length > 0) {
        const firstLegFrom = (nextRaw as SegmentTransport).legs[0]?.from;
        const lastExc = excursions[excursions.length - 1];
        if (firstLegFrom && firstLegFrom.name === lastExc.city.name) {
          forwardExitExc = excursions.pop()!;
        }
      }
      if (excursions.length > 0) {
        merged.push({
          type: "stay-group",
          city: seg.city,
          stop: seg.stop,
          nights: seg.nights,
          travelIdx: seg.travelIdx,
          excursions,
          key: seg.key,
        });
      } else {
        merged.push({
          type: "stay",
          city: seg.city,
          stop: seg.stop,
          nights: seg.nights,
          travelIdx: seg.travelIdx,
          key: seg.key,
        });
      }
      j = k;
      if (forwardExitExc) {
        const tp = forwardExitExc.inboundTransport;
        if (tp) {
          merged.push({
            type: "transport",
            legs: [
              {
                mode: tp.mode,
                from: tp.fromCity,
                to: forwardExitExc.city,
                distanceKm: tp.distanceKm,
                durationMinutes: tp.durationMinutes,
              },
            ],
            key: `transport-promoted-${forwardExitExc.key}`,
          });
        }
        merged.push({
          type: "day-trip",
          city: forwardExitExc.city,
          stop: forwardExitExc.stop,
          travelIdx: forwardExitExc.travelIdx,
          isNested: false,
          key: `promoted-${forwardExitExc.key}`,
          inboundTransport: undefined,
          chainBreakBefore: true,
        });
      }
    } else {
      merged.push(seg);
      j++;
    }
  }
  return merged;
}

/**
 * Adds every timezone offset observed during a city stay to the supplied set.
 * @param {Set<number>} offsets - The timezone offsets collected for the trip
 * @param {City} city - The city whose offsets should be sampled
 * @param {Date} sDate - The first date of the stay
 * @param {Date} eDate - The last date of the stay
 * @returns {void}
 */
function addCityOffsetsForStop(
  offsets: Set<number>,
  city: City,
  sDate: Date,
  eDate: Date,
): void {
  const start = sDate.getTime() <= eDate.getTime() ? sDate : eDate;
  const end = sDate.getTime() <= eDate.getTime() ? eDate : sDate;
  const days =
    Math.floor(
      (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        86400000,
    ) + 1;

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    offsets.add(getCityOffsetMinutesOnDate("en-US", city, date));
  }
}

/**
 * Transport and stay totals derived from a trip timeline.
 * @property {number} nights - The total number of overnight stays
 * @property {number} flights - The number of flight legs
 * @property {number} flightKm - The total flight distance in kilometres
 * @property {number} flightMinutes - The total time spent flying
 * @property {number} ferries - The number of ferry legs
 * @property {number} ferryKm - The total ferry distance in kilometres
 * @property {number} ferryMinutes - The total time spent on ferries
 * @property {number} trains - The number of train legs
 * @property {number} trainKm - The total train distance in kilometres
 * @property {number} trainMinutes - The total time spent on trains
 * @property {number} buses - The number of bus legs
 * @property {number} busKm - The total bus distance in kilometres
 * @property {number} busMinutes - The total time spent on buses
 * @property {number} taxis - The number of taxi legs
 * @property {number} taxiKm - The total taxi distance in kilometres
 * @property {number} taxiMinutes - The total time spent in taxis
 * @property {number} cars - The number of car legs
 * @property {number} carKm - The total car distance in kilometres
 * @property {number} carMinutes - The total time spent in cars
 * @property {number} walks - The number of walking legs
 * @property {number} walkKm - The total walking distance in kilometres
 * @property {number} walkMinutes - The total time spent walking
 * @property {number} timezoneCount - The number of distinct timezone offsets
 */
export interface TripStats {
  nights: number;
  flights: number;
  flightKm: number;
  flightMinutes: number;
  ferries: number;
  ferryKm: number;
  ferryMinutes: number;
  trains: number;
  trainKm: number;
  trainMinutes: number;
  buses: number;
  busKm: number;
  busMinutes: number;
  taxis: number;
  taxiKm: number;
  taxiMinutes: number;
  cars: number;
  carKm: number;
  carMinutes: number;
  walks: number;
  walkKm: number;
  walkMinutes: number;
  timezoneCount: number;
}

/**
 * Computes transport, stay, and timezone totals for a trip timeline.
 * @param {TripDetailTimelineItem[]} items - The normalized timeline items
 * @returns {TripStats} The aggregate trip statistics
 */
export function computeTripStats(items: TripDetailTimelineItem[]): TripStats {
  let nights = 0;
  let flights = 0,
    flightKm = 0,
    flightMinutes = 0;
  let ferries = 0,
    ferryKm = 0,
    ferryMinutes = 0;
  let trains = 0,
    trainKm = 0,
    trainMinutes = 0;
  let buses = 0,
    busKm = 0,
    busMinutes = 0;
  let taxis = 0,
    taxiKm = 0,
    taxiMinutes = 0;
  let cars = 0,
    carKm = 0,
    carMinutes = 0;
  let walks = 0,
    walkKm = 0,
    walkMinutes = 0;
  const timezoneOffsets = new Set<number>();
  for (const item of items) {
    if (item.kind === "base-stop") {
      nights += item.nights;
      addCityOffsetsForStop(
        timezoneOffsets,
        item.city,
        item.stop.sDate,
        item.stop.eDate,
      );
    } else if (item.kind === "day-trip") {
      addCityOffsetsForStop(
        timezoneOffsets,
        item.city,
        item.stop.sDate,
        item.stop.eDate,
      );
    } else if (item.kind === "transport") {
      const mult = item.isRoundTrip ? 2 : 1;
      if (item.mode === "plane") {
        flights += mult;
        flightKm += (item.flightInfo?.distanceKm ?? 0) * mult;
        flightMinutes += (item.flightInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "ferry") {
        ferries += mult;
        ferryKm += (item.ferryInfo?.distanceKm ?? 0) * mult;
        ferryMinutes += (item.ferryInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "train") {
        trains += mult;
        trainKm += (item.trainInfo?.distanceKm ?? 0) * mult;
        trainMinutes += (item.trainInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "bus") {
        buses += mult;
        busKm += (item.busInfo?.distanceKm ?? 0) * mult;
        busMinutes += (item.busInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "car") {
        cars += mult;
        carKm += (item.carInfo?.distanceKm ?? 0) * mult;
        carMinutes += (item.carInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "taxi") {
        taxis += mult;
        taxiKm += (item.taxiInfo?.distanceKm ?? 0) * mult;
        taxiMinutes += (item.taxiInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "walk") {
        walks += mult;
        walkKm += (item.walkInfo?.distanceKm ?? 0) * mult;
        walkMinutes += (item.walkInfo?.durationMinutes ?? 0) * mult;
      }
    }
  }
  return {
    nights,
    flights,
    flightKm,
    flightMinutes,
    ferries,
    ferryKm,
    ferryMinutes,
    trains,
    trainKm,
    trainMinutes,
    buses,
    busKm,
    busMinutes,
    taxis,
    taxiKm,
    taxiMinutes,
    cars,
    carKm,
    carMinutes,
    walks,
    walkKm,
    walkMinutes,
    timezoneCount: timezoneOffsets.size,
  };
}
