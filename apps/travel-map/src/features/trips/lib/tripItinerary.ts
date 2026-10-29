import {
  City,
  formatLocalDate,
  Trip,
  TripLeg,
  TripStay,
} from "@travelmap/core";

/**
 * What happened where one ride ended and the next began: a change of plane
 * or train, a night spent waiting, or a place actually seen on the way.
 * @property {City} city - Where the connection was
 * @property {number} [minutes] - How long it lasted, when both clocks are known
 * @property {boolean} isOvernight - Whether a night passed there
 * @property {boolean} isVisited - Whether the place was seen rather than passed through
 */
export interface Connection {
  city: City;
  minutes?: number;
  isOvernight: boolean;
  isVisited: boolean;
}

/**
 * One ride of a move, with the connection that followed it, if any.
 * @property {TripLeg} leg - The ride
 * @property {Connection} [connection] - What happened before the next ride
 */
export interface ItineraryLeg {
  leg: TripLeg;
  connection?: Connection;
}

/**
 * A day trip from a stay, reduced to what a reader wants: when, where to, and
 * how.
 * @property {string} date - The day of the outing
 * @property {City[]} places - The places seen, in order
 * @property {TripLeg[]} legs - The rides, the last one back to the stay
 */
export interface Outing {
  date: string;
  places: City[];
  legs: TripLeg[];
}

/** One stop on the trip's spine, read top to bottom. */
export type ItineraryItem =
  | { kind: "endpoint"; role: "start" | "end"; city: City; date: string }
  | { kind: "move"; key: string; legs: ItineraryLeg[] }
  | { kind: "stay"; key: string; stay: TripStay; outings: Outing[] };

/* Arriving before this, the night was spent waiting rather than in a bed. */
const EARLY_MORNING = "05:00";

/**
 * Reads the time of day from an authored local date.
 * @param {string} [value] - A YYYY-MM-DD or YYYY-MM-DDTHH:mm date
 * @returns {string | undefined} The HH:mm part, when there is one
 */
export function timeOf(value?: string): string | undefined {
  return value?.split("T")[1];
}

/**
 * Counts the calendar days between a departure and an arrival, each read on
 * its own wall clock, so an overnight flight that lands the next morning
 * reports 1 and the pass can print `+1` beside its arrival.
 * @param {string} depart - The YYYY-MM-DD[THH:mm] departure
 * @param {string} [arrive] - The YYYY-MM-DD[THH:mm] arrival
 * @returns {number} Days later the ride arrives, 0 when unknown or the same day
 */
export function daysLater(depart: string, arrive?: string): number {
  if (!arrive) return 0;
  return Math.round(
    (Date.parse(arrive.slice(0, 10)) - Date.parse(depart.slice(0, 10))) /
      86_400_000,
  );
}

/**
 * Minutes between two wall-clock times read in the same city. Both are local
 * to the connection, so their difference needs no time zone.
 * @param {string} [from] - The arrival
 * @param {string} [to] - The next departure
 * @returns {number | undefined} The wait, when both carry a time
 */
function minutesBetween(from?: string, to?: string): number | undefined {
  if (!timeOf(from) || !timeOf(to)) return undefined;
  return (Date.parse(`${to}Z`) - Date.parse(`${from}Z`)) / 60_000;
}

/**
 * Describes the connection between two consecutive rides. It is a night when
 * the next ride leaves on a later date, or when the traveller landed in the
 * small hours and left in the morning: a 00:30 arrival and a 06:30 departure
 * share a date but not a bed.
 * @param {TripLeg} leg - The ride that arrived
 * @param {TripLeg} next - The ride that left
 * @returns {Connection} The connection
 */
function connectionOf(leg: TripLeg, next: TripLeg): Connection {
  const arrived = leg.arrive ?? leg.date;
  const leaves = next.depart;
  const arrivedAt = timeOf(arrived);
  const leavesAt = timeOf(leaves);
  const isOvernight =
    leaves !== undefined &&
    (leaves.slice(0, 10) > arrived.slice(0, 10) ||
      (arrivedAt !== undefined &&
        leavesAt !== undefined &&
        arrivedAt < EARLY_MORNING &&
        leavesAt > arrivedAt));

  return {
    city: leg.to,
    isOvernight,
    isVisited: leg.visited || Boolean(leg.photos?.length),
    minutes: minutesBetween(arrived, leaves),
  };
}

/**
 * Pairs each ride with the connection after it.
 * @param {TripLeg[]} legs - The rides, in order
 * @returns {ItineraryLeg[]} The rides with their connections
 */
function legsOf(legs: TripLeg[]): ItineraryLeg[] {
  return legs.map((leg, index) => {
    const next = legs[index + 1];
    return next ? { connection: connectionOf(leg, next), leg } : { leg };
  });
}

/**
 * Lays a trip out as its spine: where it started, every move and every stay
 * in order, and where it ended.
 * @param {Trip} trip - The trip to lay out
 * @returns {ItineraryItem[]} The items in reading order
 */
export function buildItinerary(trip: Trip): ItineraryItem[] {
  const steps = trip.steps.map((step): ItineraryItem => {
    if (step.type === "move")
      return {
        key: `move-${step.from.id}-${step.to.id}-${step.legs[0]?.date}`,
        kind: "move",
        legs: legsOf(step.legs),
      };

    return {
      key: `stay-${step.city.id}-${step.checkIn}`,
      kind: "stay",
      outings: step.outings.map((outing) => ({
        date: outing.date,
        legs: outing.legs,
        places: outing.legs.slice(0, -1).map((leg) => leg.to),
      })),
      stay: step,
    };
  });

  return [
    {
      city: trip.origin,
      date: formatLocalDate(trip.sDate).slice(0, 10),
      kind: "endpoint",
      role: "start",
    },
    ...steps,
    {
      city: trip.returnTo,
      date: formatLocalDate(trip.eDate).slice(0, 10),
      kind: "endpoint",
      role: "end",
    },
  ];
}

/**
 * The figures a trip is summarised by.
 * @property {number} days - Calendar days, first and last included
 * @property {number} nights - Nights slept in a stay
 * @property {number} km - Distance covered by every ride
 * @property {number} places - Distinct places stayed in or seen
 */
export interface TripTotals {
  days: number;
  nights: number;
  km: number;
  places: number;
}

/**
 * Adds up a trip's headline figures.
 * @param {Trip} trip - The trip
 * @returns {TripTotals} Its totals
 */
export function totalsOf(trip: Trip): TripTotals {
  return {
    days: trip.getDurationInDays(),
    km: Math.round(
      trip.getLegs().reduce((sum, leg) => sum + leg.distance.value, 0),
    ),
    nights: trip.getNights(),
    places: new Set(trip.route).size,
  };
}
