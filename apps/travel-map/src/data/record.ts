import {
  buildLedger,
  City,
  Image,
  LedgerEntry,
  LedgerSpan,
} from "@travelmap/core";
import { unique } from "remeda";

import { futureTrips, visitedTrips } from "@/data/world";

/**
 * One journey in the record, with the totals the archive had reached by the
 * time that journey ended. The figures are cumulative so a reader always sees
 * numbers that were true at the point they are reading, rather than one grand
 * total detached from the entries that produced it.
 * @property {LedgerEntry} entry - The journey's accounted spans and totals
 * @property {number} year - The year the journey departed
 * @property {boolean} isPlanned - Whether the journey has not been travelled yet
 * @property {RunningFigures} running - The archive totals as of this journey
 */
export interface RecordJourney {
  entry: LedgerEntry;
  year: number;
  isPlanned: boolean;
  running: RunningFigures;
}

/**
 * Archive totals as of a position in the record.
 * @property {number} journeys - Journeys travelled so far
 * @property {number} distanceKm - Distance covered so far
 * @property {number} minutesInMotion - Time spent moving so far
 * @property {number} minutesAtRest - Time spent in cities so far
 * @property {number} countries - Distinct countries reached so far
 * @property {number} photographs - Photographs taken so far
 */
export interface RunningFigures {
  journeys: number;
  distanceKm: number;
  minutesInMotion: number;
  minutesAtRest: number;
  countries: number;
  photographs: number;
}

/**
 * Collects the cities a journey actually stayed in, ignoring the airports and
 * stations it only passed through.
 * @param {LedgerEntry} entry - The journey to read
 * @returns {City[]} Its stayed-in cities, without duplicates
 */
export function stayedCities(entry: LedgerEntry): City[] {
  return unique(
    entry.spans.flatMap((span) =>
      span.kind === "stay" && !span.isLayover ? [span.city] : [],
    ),
  );
}

/**
 * Adds a journey's photographs to a running set of the ones already counted.
 * A journey that returns to a city it has already stayed in reuses that stay's
 * photographs, so counting per stop reports more photographs than exist — the
 * figures count distinct images instead.
 * @param {LedgerEntry} entry - The journey to read
 * @param {Set<string>} counted - The photographs already counted
 * @returns {number} How many photographs this journey added
 */
function addPhotographs(entry: LedgerEntry, counted: Set<string>): number {
  let added = 0;
  for (const span of entry.spans) {
    if (span.kind !== "stay") continue;
    for (const photo of span.photos) {
      if (counted.has(photo.original)) continue;
      counted.add(photo.original);
      added += 1;
    }
  }
  return added;
}

/**
 * Builds the whole record: every journey in travel order, each carrying the
 * archive totals as they stood when it ended.
 * @returns {RecordJourney[]} The record, earliest departure first
 */
function buildRecord(): RecordJourney[] {
  const planned = new Set(futureTrips.map((trip) => trip.id));
  const entries = buildLedger([...visitedTrips, ...futureTrips]);
  const reached = new Set<string>();
  const counted = new Set<string>();
  const running: RunningFigures = {
    journeys: 0,
    distanceKm: 0,
    minutesInMotion: 0,
    minutesAtRest: 0,
    countries: 0,
    photographs: 0,
  };

  return entries.map((entry) => {
    const year = entry.trip.sDate.getFullYear();
    for (const city of stayedCities(entry)) reached.add(city.country.id);
    running.journeys += 1;
    running.distanceKm += entry.distanceKm;
    running.minutesInMotion += entry.minutesInMotion;
    running.minutesAtRest += entry.minutesAtRest;
    running.countries = reached.size;
    running.photographs += addPhotographs(entry, counted);

    return {
      entry,
      year,
      isPlanned: planned.has(entry.trip.id),
      running: { ...running },
    };
  });
}

/* The record is derived once from module-level data that never changes, so
   every consumer reads the same array rather than rebuilding it per render. */
export const record: RecordJourney[] = buildRecord();

/*
 * The record is computed forward, because a running total only means anything
 * read in the order it accrued. It is read backward, because the journey a
 * reader wants first is the one that just happened — so the column descends
 * from the present and the figures count down as the reader digs back.
 */
export const readingOrder: RecordJourney[] = [...record].reverse();

/** The totals the whole archive has reached. */
export const totalFigures: RunningFigures = record[record.length - 1]
  ?.running ?? {
  journeys: 0,
  distanceKm: 0,
  minutesInMotion: 0,
  minutesAtRest: 0,
  countries: 0,
  photographs: 0,
};

/** The longest journey in the record, which sets the scale every bar is drawn at. */
export const longestJourneyMinutes: number = Math.max(
  1,
  ...record.map((journey) => spanTotal(journey.entry)),
);

/**
 * Sums how long a journey took, as accounted rather than as dated, so a bar's
 * length always matches the spans drawn inside it.
 * @param {LedgerEntry} entry - The journey to measure
 * @returns {number} Its total accounted minutes
 */
export function spanTotal(entry: LedgerEntry): number {
  return entry.minutesInMotion + entry.minutesAtRest;
}

/**
 * Finds one journey in the record by its trip id.
 * @param {string | undefined} tripId - The trip id from the route
 * @returns {RecordJourney | null} The journey, or null when the id is unknown
 */
export function findJourney(tripId: string | undefined): RecordJourney | null {
  if (!tripId) return null;
  return record.find((journey) => journey.entry.trip.id === tripId) ?? null;
}

/**
 * Reads the cities a span touches, so the map can locate whatever row the
 * reader is pointing at without knowing how spans are shaped.
 * @param {LedgerSpan} span - The span to locate
 * @returns {City[]} The cities the span refers to
 */
export function spanCities(span: LedgerSpan): City[] {
  return span.kind === "stay" ? [span.city] : [span.from, span.to];
}

/**
 * Totals how long the record spent in each city, keyed by city id. Time on the
 * ground is the record's currency, so this is what the plate sizes its points
 * by rather than a count of visits — three weeks in one city and three
 * airport hours in another are not the same mark.
 * @returns {Map<string, number>} Minutes spent per city id
 */
function measureCityTime(): Map<string, number> {
  const byCity = new Map<string, number>();
  for (const journey of record) {
    for (const span of journey.entry.spans) {
      if (span.kind !== "stay") continue;
      const id = span.city.id;
      byCity.set(id, (byCity.get(id) ?? 0) + span.minutes);
    }
  }
  return byCity;
}

/** How long the record spent in each city, keyed by city id. */
export const cityTime: Map<string, number> = measureCityTime();

/** Every city the record touches, layovers included, in a stable order. */
export const recordCities: City[] = unique(
  record.flatMap((journey) =>
    journey.entry.spans.flatMap((span) =>
      span.kind === "stay" ? [span.city] : [],
    ),
  ),
);

/**
 * One city as the record sees it: not a place on a list, but the time the
 * record spent there and the journeys that spent it.
 * @property {City} city - The city
 * @property {number} minutes - Total time spent there, layovers included
 * @property {number} layoverMinutes - How much of that was only passing through
 * @property {RecordJourney[]} journeys - The journeys that touched it, most recent first
 * @property {Image[]} photographs - Every photograph taken there, without duplicates
 */
export interface PlaceReading {
  city: City;
  minutes: number;
  layoverMinutes: number;
  journeys: RecordJourney[];
  photographs: Image[];
}

/**
 * Gathers everything the record knows about one city. A city is reached from
 * several journeys and its photographs are attached to stays rather than to the
 * place, so this is the one place that puts a city back together.
 * @param {string | undefined} cityId - The city id from the route
 * @returns {PlaceReading | null} The city's reading, or null when the id is unknown
 */
export function readPlace(cityId: string | undefined): PlaceReading | null {
  if (!cityId) return null;
  let city: City | null = null;
  let minutes = 0;
  let layoverMinutes = 0;
  const journeys: RecordJourney[] = [];
  const photographs: Image[] = [];
  const seen = new Set<string>();

  for (const journey of readingOrder) {
    let touched = false;
    for (const span of journey.entry.spans) {
      if (span.kind !== "stay" || span.city.id !== cityId) continue;
      city = span.city;
      touched = true;
      minutes += span.minutes;
      if (span.isLayover) layoverMinutes += span.minutes;
      for (const photo of span.photos) {
        if (seen.has(photo.original)) continue;
        seen.add(photo.original);
        photographs.push(photo);
      }
    }
    if (touched) journeys.push(journey);
  }

  return city ? { city, minutes, layoverMinutes, journeys, photographs } : null;
}
