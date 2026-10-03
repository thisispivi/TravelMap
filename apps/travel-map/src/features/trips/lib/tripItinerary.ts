import {
  City,
  daysBetween,
  formatLocalDate,
  Trip,
  TripMove,
  TripStay,
} from "@travelmap/core";

/**
 * One block of the trip page, read top to bottom.
 * `start`/`end` frame the journey; a `move` is getting somewhere, with the
 * night it spans when it ran overnight; a `stay` is where the traveller slept,
 * numbered by the trip's nights so "Nights 3–5" reads at a glance.
 */
export type ItineraryBlock =
  | { kind: "start"; city: City; date: string }
  | {
      kind: "move";
      move: TripMove;
      departDate: string;
      arriveDate: string;
      nightOnBoard?: number;
    }
  | { kind: "stay"; stay: TripStay; firstNight: number; lastNight: number }
  | { kind: "end"; city: City; date: string };

/**
 * Lays a trip out as the blocks its page renders. Night numbers count from the
 * trip's first evening, so they survive a stay with no nights (a long day in a
 * city) without renumbering the rest.
 * @param {Trip} trip - The trip to lay out
 * @returns {ItineraryBlock[]} The blocks in reading order
 */
export function buildItinerary(trip: Trip): ItineraryBlock[] {
  const start = formatLocalDate(trip.sDate).slice(0, 10);
  const end = formatLocalDate(trip.eDate).slice(0, 10);

  /**
   * Converts a calendar date into the trip's night number.
   * @param {string} date - The evening's date
   * @returns {number} One for the trip's first night
   */
  const nightOf = (date: string): number => daysBetween(start, date) + 1;

  const blocks: ItineraryBlock[] = [
    { city: trip.origin, date: start, kind: "start" },
  ];
  trip.steps.forEach((step, index) => {
    if (step.type === "stay") {
      blocks.push({
        firstNight: nightOf(step.checkIn),
        kind: "stay",
        lastNight: nightOf(step.checkOut) - 1,
        stay: step,
      });
      return;
    }

    const before = trip.steps[index - 1];
    const after = trip.steps[index + 1];
    const departDate =
      step.legs[0]?.depart?.slice(0, 10) ??
      (before?.type === "stay" ? before.checkOut : start);
    const arriveDate =
      step.legs.at(-1)?.arrive?.slice(0, 10) ??
      (after?.type === "stay" ? after.checkIn : end);
    blocks.push({
      arriveDate,
      departDate,
      kind: "move",
      move: step,
      nightOnBoard: arriveDate > departDate ? nightOf(departDate) : undefined,
    });
  });
  blocks.push({ city: trip.returnTo, date: end, kind: "end" });
  return blocks;
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
 * Names a block by what it describes rather than where it sits, so React keeps
 * the same element for the same stay or journey across edits.
 * @param {ItineraryBlock} block - The block
 * @returns {string} A stable key
 */
export function blockKey(block: ItineraryBlock): string {
  switch (block.kind) {
    case "start":
    case "end":
      return block.kind;
    case "stay":
      return `stay-${block.stay.city.id}-${block.stay.checkIn}`;
    case "move":
      return `move-${block.departDate}-${block.move.from.id}-${block.move.to.id}`;
  }
}
