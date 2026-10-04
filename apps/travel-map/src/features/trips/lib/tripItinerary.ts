import {
  addDays,
  City,
  formatLocalDate,
  Trip,
  TripLeg,
  TripStay,
} from "@travelmap/core";

/**
 * One row of a chapter: a ride, a place seen (its photos one tap away), or a
 * night spent between two rides of the same journey.
 */
export type ChapterRow =
  | { kind: "ride"; leg: TripLeg }
  | { kind: "place"; leg: TripLeg }
  | { kind: "transit"; city: City };

/**
 * What a day inside a stay held: a day trip with its rows, or a run of days
 * spent in the city itself.
 */
export type StayDay =
  | { kind: "outing"; date: string; rows: ChapterRow[] }
  | { kind: "free"; from: string; to: string };

/** Which part of the trip a journey is, so it can be titled in plain words. */
type JourneyRole = "there" | "onward" | "home";

/**
 * One chapter of the trip page: getting somewhere, or a place slept in with
 * what happened during the stay.
 */
export type Chapter =
  | {
      kind: "journey";
      role: JourneyRole;
      from: City;
      to: City;
      startDate: string;
      endDate: string;
      rows: ChapterRow[];
    }
  | { kind: "stay"; stay: TripStay; days: StayDay[] };

/* Arriving before this, the night was spent waiting rather than in a bed. */
const EARLY_MORNING = "05:00";

/**
 * Turns a chain of rides into rows. A place along the way gets its own row
 * when it was seen or photographed; a connection that waited overnight gets a
 * "night in transit" row, so an evening flight and a morning flight never
 * read as one straight hop.
 * @param {TripLeg[]} legs - The rides, in order
 * @returns {ChapterRow[]} The rows
 */
function rowsOf(legs: TripLeg[]): ChapterRow[] {
  return legs.flatMap((leg, index): ChapterRow[] => {
    const next = legs[index + 1];
    const rows: ChapterRow[] = [{ kind: "ride", leg }];
    if (!next) return rows;
    if (leg.visited || leg.photos?.length) rows.push({ kind: "place", leg });
    const arrived = leg.arrive ?? leg.date;
    const leaves = next.depart;
    /*
     * A connection is a night when the next ride leaves on a later date, or
     * when the traveller landed in the small hours and left in the morning —
     * a 00:30 arrival and a 06:30 departure share a date but not a bed.
     */
    const isOvernight =
      leaves !== undefined &&
      (leaves.slice(0, 10) > arrived.slice(0, 10) ||
        (arrived.includes("T") &&
          leaves.includes("T") &&
          arrived.slice(11) < EARLY_MORNING &&
          leaves.slice(11) > arrived.slice(11)));
    if (isOvernight) rows.push({ city: leg.to, kind: "transit" });
    return rows;
  });
}

/**
 * Lays out a stay's days: each day trip on its date, and every other full day
 * folded into ranges of time spent in the city, so a long stay stays short.
 * @param {TripStay} stay - The stay
 * @returns {StayDay[]} Its days in order
 */
function daysOf(stay: TripStay): StayDay[] {
  const outings = stay.outings.map((outing): StayDay => ({
    date: outing.date,
    kind: "outing",
    rows: rowsOf(outing.legs),
  }));
  const busy = new Set(stay.outings.map((outing) => outing.date));
  const free: { kind: "free"; from: string; to: string }[] = [];
  for (
    let date = addDays(stay.checkIn, 1);
    date < stay.checkOut;
    date = addDays(date, 1)
  ) {
    if (busy.has(date)) continue;
    const last = free.at(-1);
    if (last && last.to === addDays(date, -1)) last.to = date;
    else free.push({ from: date, kind: "free", to: date });
  }

  return [...outings, ...free].toSorted((first, second) =>
    (first.kind === "outing" ? first.date : first.from).localeCompare(
      second.kind === "outing" ? second.date : second.from,
    ),
  );
}

/**
 * Lays a trip out as chapters: each journey, and each place slept in with its
 * days. A journey borrows missing dates from the stays around it, so an
 * undated flight home still reads as leaving the morning the stay ended.
 * @param {Trip} trip - The trip to lay out
 * @returns {Chapter[]} The chapters in reading order
 */
export function buildChapters(trip: Trip): Chapter[] {
  const start = formatLocalDate(trip.sDate).slice(0, 10);
  const end = formatLocalDate(trip.eDate).slice(0, 10);

  return trip.steps.map((step, index): Chapter => {
    if (step.type === "stay")
      return { days: daysOf(step), kind: "stay", stay: step };

    const before = trip.steps[index - 1];
    const after = trip.steps[index + 1];
    const isLast = index === trip.steps.length - 1;
    return {
      endDate:
        step.legs.at(-1)?.arrive?.slice(0, 10) ??
        (after?.type === "stay" ? after.checkIn : end),
      from: step.from,
      kind: "journey",
      role: index === 0 ? "there" : isLast ? "home" : "onward",
      rows: rowsOf(step.legs),
      startDate:
        step.legs[0]?.depart?.slice(0, 10) ??
        (before?.type === "stay" ? before.checkOut : start),
      to: step.to,
    };
  });
}

/**
 * Reads the time of day from an authored local date.
 * @param {string} [value] - A YYYY-MM-DD or YYYY-MM-DDTHH:mm date
 * @returns {string | undefined} The HH:mm part, when there is one
 */
export function timeOf(value?: string): string | undefined {
  return value?.split("T")[1];
}

/**
 * Counts the distinct UTC offsets the traveller's clock showed, sampled at
 * every place on the day they were there — so summer time counts as a change
 * when the trip really crossed it, and two zones sharing an offset count once.
 * @param {Trip} trip - The trip
 * @returns {number} Distinct offsets observed
 */
export function countTimeZones(trip: Trip): number {
  return new Set(
    trip.destinations.map(
      ({ city, sDate }) =>
        offsetFormatter(city.timeZone)
          .formatToParts(sDate)
          .find((part) => part.type === "timeZoneName")?.value,
    ),
  ).size;
}

const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns a cached formatter that names a zone's UTC offset, since building
 * one per place is the slow part of counting time zones.
 * @param {string} timeZone - IANA zone
 * @returns {Intl.DateTimeFormat} The formatter
 */
function offsetFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = offsetFormatters.get(timeZone);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  });
  offsetFormatters.set(timeZone, formatter);
  return formatter;
}

/**
 * Names a chapter by what it describes rather than where it sits, so React
 * keeps the same element for the same stay or journey across edits.
 * @param {Chapter} chapter - The chapter
 * @returns {string} A stable key
 */
export function chapterKey(chapter: Chapter): string {
  return chapter.kind === "stay"
    ? `stay-${chapter.stay.city.id}-${chapter.stay.checkIn}`
    : `journey-${chapter.startDate}-${chapter.from.id}-${chapter.to.id}`;
}
