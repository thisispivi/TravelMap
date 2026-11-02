import { Flight } from "@travelmap/core";
import { TravelType } from "@travelmap/core/typings/Travel";

/** What a flight type's segment is sized by. */
export type FlightMeasure = "count" | "km";

/**
 * The flights of one type.
 * @property {TravelType} type - National, international or intercontinental
 * @property {number} count - Flights taken
 * @property {number} km - Kilometres flown
 */
interface FlightTypeStat {
  type: TravelType;
  count: number;
  km: number;
}

/**
 * Every flight, split by type.
 * @property {number} count - Flights taken
 * @property {number} km - Kilometres flown
 * @property {FlightTypeStat[]} types - The types flown, shortest reach first
 */
export interface FlightTypeStats {
  count: number;
  km: number;
  types: FlightTypeStat[];
}

/**
 * One arc of a donut, as fractions of the whole circle.
 * @property {number} offset - Where the arc starts
 * @property {number} length - How much of the circle it draws
 */
export interface DonutSegment {
  offset: number;
  length: number;
}

/*
 * A round cap reaches half the stroke past each end of an arc. On a ring of
 * radius 52 and stroke 10, leaving 4 units clear between two caps takes 14 of
 * its 326.7 units of circumference.
 */
const DONUT_GAP = 14 / (2 * Math.PI * 52);
/* A sliver too small for its gap still shows, as the dot its round caps make. */
const DONUT_MIN_LENGTH = 0.001;

/**
 * Counts the flights and adds up the kilometres of each type. A flight with no
 * usable distance still counts as a flight and adds nothing to the kilometres;
 * a type never flown is left out.
 * @param {Pick<Flight, "distanceInKm" | "travelType">[]} flights - The flights taken
 * @returns {FlightTypeStats} The totals and the types flown
 */
export function getFlightTypeStats(
  flights: Pick<Flight, "distanceInKm" | "travelType">[],
): FlightTypeStats {
  const types = Object.values(TravelType).flatMap((type) => {
    const ofType = flights.filter((flight) => flight.travelType === type);
    if (ofType.length === 0) return [];
    return [
      {
        count: ofType.length,
        km: ofType.reduce((sum, flight) => sum + (flight.distanceInKm || 0), 0),
        type,
      },
    ];
  });

  return {
    count: flights.length,
    km: types.reduce((sum, type) => sum + type.km, 0),
    types,
  };
}

/**
 * Lays values out round a donut, each arc centred in its share with a gap
 * either side. A value alone closes the ring, with nothing to leave a gap from.
 * @param {number[]} values - The values, in drawing order
 * @returns {DonutSegment[]} One arc per value; a value of zero draws nothing
 */
export function getDonutSegments(values: number[]): DonutSegment[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  const gap = values.filter((value) => value > 0).length > 1 ? DONUT_GAP : 0;
  let start = 0;

  return values.map((value) => {
    const share = total > 0 ? value / total : 0;
    const segment = {
      length: share > 0 ? Math.max(share - gap, DONUT_MIN_LENGTH) : 0,
      offset: start + gap / 2,
    };
    start += share;
    return segment;
  });
}
