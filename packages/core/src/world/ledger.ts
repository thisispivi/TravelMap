import type { City } from "../classes/City";
import type {
  TransportMode,
  Trip,
  TripStopStep,
  TripTransportStep,
} from "../classes/Trip";
import type { FerryCompany } from "../typings/FerryCompany";
import type { FlightCompany } from "../typings/FlightCompany";
import type { Image } from "../typings/Image";
import { deriveLegDistance, estimateDurationMinutes } from "./derive.ts";

const MINUTES_PER_DAY = 60 * 24;

/*
 * Stop dates carry day precision while transport legs carry minutes, so a stop
 * that begins and ends on one date has no authored length. These two nominal
 * lengths stand in for it. They are marked estimated wherever they are used so
 * the record never presents them as measured.
 */
const NOMINAL_LAYOVER_MINUTES = 90;
const NOMINAL_DAY_VISIT_MINUTES = 8 * 60;

/** Whether a span is time spent moving or time spent somewhere. */
export type LedgerSpanKind = "stay" | "passage";

/**
 * Time spent in one city, as one row of the ledger.
 * @property {"stay"} kind - The span discriminator
 * @property {City} city - The city stayed in
 * @property {Date} sDate - The arrival date
 * @property {Date} eDate - The departure date
 * @property {number} minutes - The length of the stay
 * @property {boolean} isLayover - Whether the city was only passed through
 * @property {boolean} isEstimated - Whether the length is nominal rather than authored
 * @property {Image[]} photos - Photographs taken during the stay
 */
export interface LedgerStay {
  kind: "stay";
  city: City;
  sDate: Date;
  eDate: Date;
  minutes: number;
  isLayover: boolean;
  isEstimated: boolean;
  photos: Image[];
}

/**
 * Time spent moving between two cities, as one row of the ledger.
 * @property {"passage"} kind - The span discriminator
 * @property {TransportMode} mode - How the distance was covered
 * @property {City} from - The city departed from
 * @property {City} to - The city arrived at
 * @property {number} minutes - The length of the passage
 * @property {number} distanceKm - The great-circle distance covered
 * @property {boolean} isEstimated - Whether the length is derived rather than authored
 * @property {FlightCompany | FerryCompany} [company] - The carrier, when one is recorded
 */
export interface LedgerPassage {
  kind: "passage";
  mode: TransportMode;
  from: City;
  to: City;
  minutes: number;
  distanceKm: number;
  isEstimated: boolean;
  company?: FlightCompany | FerryCompany;
}

/** One row of a journey's ledger: either time moving or time somewhere. */
export type LedgerSpan = LedgerStay | LedgerPassage;

/**
 * One journey, accounted for as a continuous sequence of spans.
 * @property {Trip} trip - The journey the entry describes
 * @property {LedgerSpan[]} spans - Its spans in travel order
 * @property {number} minutesInMotion - Total time spent moving
 * @property {number} minutesAtRest - Total time spent in cities
 * @property {number} distanceKm - Total distance covered
 */
export interface LedgerEntry {
  trip: Trip;
  spans: LedgerSpan[];
  minutesInMotion: number;
  minutesAtRest: number;
  distanceKm: number;
}

/**
 * Measures how long a stop lasted. Multi-day stops are measured from their
 * authored dates; a stop that starts and ends on one date has no authored
 * length, so it falls back to a nominal one and is reported as estimated.
 * @param {TripStopStep} step - The stop to measure
 * @returns {{ minutes: number; isEstimated: boolean }} Its length and whether that length was authored
 */
function measureStop(step: TripStopStep): {
  minutes: number;
  isEstimated: boolean;
} {
  const days = Math.round(
    (step.eDate.getTime() - step.sDate.getTime()) / (MINUTES_PER_DAY * 60000),
  );
  if (days > 0) return { minutes: days * MINUTES_PER_DAY, isEstimated: false };

  return {
    minutes: step.isLayover
      ? NOMINAL_LAYOVER_MINUTES
      : NOMINAL_DAY_VISIT_MINUTES,
    isEstimated: true,
  };
}

/**
 * Measures how long a transport leg took, falling back to an estimate from its
 * great-circle distance when the leg carries no authored duration.
 * @param {TripTransportStep} step - The leg to measure
 * @param {number} distanceKm - The leg's great-circle distance
 * @returns {{ minutes: number; isEstimated: boolean }} Its length and whether that length was authored
 */
function measureLeg(
  step: TripTransportStep,
  distanceKm: number,
): { minutes: number; isEstimated: boolean } {
  const authored = step.durationMinutes ?? step.flight?.durationMinutes;
  if (authored) return { minutes: authored, isEstimated: false };

  return {
    minutes: estimateDurationMinutes(step.mode, distanceKm),
    isEstimated: true,
  };
}

/**
 * Accounts for one journey as a continuous run of spans, so every hour it took
 * is attributed either to moving or to being somewhere. This is the single
 * derivation the time-scaled record is drawn from.
 * @param {Trip} trip - The journey to account for
 * @returns {LedgerEntry} The journey's spans and its motion, rest and distance totals
 */
export function toLedgerEntry(trip: Trip): LedgerEntry {
  const spans: LedgerSpan[] = [];
  let minutesInMotion = 0;
  let minutesAtRest = 0;
  let distanceKm = 0;

  for (const step of trip.steps) {
    if (step.type === "stop") {
      const { minutes, isEstimated } = measureStop(step);
      minutesAtRest += minutes;
      spans.push({
        kind: "stay",
        city: step.city,
        sDate: step.sDate,
        eDate: step.eDate,
        minutes,
        isLayover: step.isLayover === true,
        isEstimated,
        photos: step.photos ?? [],
      });
      continue;
    }

    const legDistance =
      step.distanceInKm ??
      step.flight?.distanceInKm ??
      step.ferry?.distanceInKm ??
      deriveLegDistance(step.from.coordinates, step.to.coordinates);
    const { minutes, isEstimated } = measureLeg(step, legDistance);
    minutesInMotion += minutes;
    distanceKm += legDistance;
    spans.push({
      kind: "passage",
      mode: step.mode,
      from: step.from,
      to: step.to,
      minutes,
      distanceKm: legDistance,
      isEstimated,
      company: step.flight?.company ?? step.ferry?.company,
    });
  }

  return { trip, spans, minutesInMotion, minutesAtRest, distanceKm };
}

/**
 * Accounts for a set of journeys and orders them as they were travelled, so the
 * result reads forward in time from the earliest departure.
 * @param {Trip[]} trips - The journeys to account for
 * @returns {LedgerEntry[]} One entry per journey, earliest departure first
 */
export function buildLedger(trips: Trip[]): LedgerEntry[] {
  return trips
    .map(toLedgerEntry)
    .sort(
      (first, second) =>
        first.trip.sDate.getTime() - second.trip.sDate.getTime(),
    );
}
