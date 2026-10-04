import { Trip } from "@travelmap/core";

/**
 * A trip placed on the timeline, with the side of the spine it renders on.
 * @property {Trip} trip - The trip to render
 * @property {"left" | "right"} side - Which side of the spine the card sits on
 */
export interface TimelineEntry {
  trip: Trip;
  side: "left" | "right";
}

/**
 * The trips of one calendar year, in the order the timeline shows them.
 * @property {number} year - The year the group heads
 * @property {TimelineEntry[]} trips - The year's trips, already assigned a side
 */
export interface YearGroup {
  year: number;
  trips: TimelineEntry[];
}

/**
 * Groups trips into newest-first years. Sides alternate across the whole
 * timeline rather than restarting each year, so the zigzag never puts two
 * consecutive cards on the same side at a year boundary.
 * @param {Trip[]} trips - The trips to place
 * @returns {YearGroup[]} One group per year that has a trip, newest first
 */
export function groupTripsByYear(trips: Trip[]): YearGroup[] {
  const groups: YearGroup[] = [];
  trips
    .toSorted((first, second) => second.sDate.getTime() - first.sDate.getTime())
    .forEach((trip, index) => {
      const year = trip.sDate.getFullYear();
      const entry: TimelineEntry = {
        side: index % 2 === 0 ? "left" : "right",
        trip,
      };
      const current = groups.at(-1);
      if (current?.year === year) current.trips.push(entry);
      else groups.push({ trips: [entry], year });
    });
  return groups;
}
