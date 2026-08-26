import { JourneyOrder } from "@/shared/context/AppRoute.context";
import { COMPASS_SECTORS, Reckoning } from "@/shared/lib/bearings";

/**
 * A run of journeys the record prints under one heading.
 * @property {string} key - The stable group identifier
 * @property {string} label - The heading printed above the run
 * @property {Reckoning[]} entries - The journeys in the run, already ordered
 */
export interface JourneyGroup {
  key: string;
  label: string;
  entries: Reckoning[];
}

/**
 * Groups journeys by the year they set off in, newest first.
 * @param {Reckoning[]} entries - The measured journeys
 * @returns {JourneyGroup[]} One group per year
 */
function byYear(entries: Reckoning[]): JourneyGroup[] {
  const years = new Map<number, Reckoning[]>();
  for (const entry of entries) {
    const year = entry.trip.sDate.getFullYear();
    years.set(year, [...(years.get(year) ?? []), entry]);
  }

  return [...years.entries()]
    .sort(([first], [second]) => second - first)
    .map(([year, group]) => ({
      key: String(year),
      label: String(year),
      entries: group.sort(
        (first, second) =>
          second.trip.sDate.getTime() - first.trip.sDate.getTime(),
      ),
    }));
}

/**
 * Groups journeys by the compass sector they set off into, read clockwise from
 * north. This is the ordering that shows which way a record actually leans:
 * which directions it goes again and again, and which it has never gone.
 * @param {Reckoning[]} entries - The measured journeys
 * @returns {JourneyGroup[]} One group per occupied sector
 */
function bySector(entries: Reckoning[]): JourneyGroup[] {
  return COMPASS_SECTORS.map((sector, index) => {
    /* North spans 337.5° to 022.5°, so within a sector journeys are ordered by
       how far they sit from its centre line rather than by raw degrees, which
       would put 009° before 342° and break the arc. */
    const centre = index * (360 / COMPASS_SECTORS.length);

    /**
     * Measures how far a bearing sits from the sector's centre line.
     * @param {number} bearing - The bearing in degrees
     * @returns {number} The signed offset within (-180, 180]
     */
    const offset = (bearing: number): number =>
      ((bearing - centre + 540) % 360) - 180;
    return {
      key: sector,
      label: sector,
      entries: entries
        .filter((entry) => entry.sector === sector)
        .sort(
          (first, second) => offset(first.bearing) - offset(second.bearing),
        ),
    };
  }).filter((group) => group.entries.length > 0);
}

/**
 * Orders every journey by how far out it reached, furthest first, under a
 * single heading because distance is a continuum with nothing to group by.
 * @param {Reckoning[]} entries - The measured journeys
 * @returns {JourneyGroup[]} One group holding every journey
 */
function byReach(entries: Reckoning[]): JourneyGroup[] {
  return [
    {
      key: "far",
      label: "",
      entries: entries.toSorted(
        (first, second) => second.distanceKm - first.distanceKm,
      ),
    },
  ];
}

/**
 * Arranges the record's journeys under the requested ordering.
 * @param {Reckoning[]} entries - The measured journeys
 * @param {JourneyOrder} order - The requested ordering
 * @returns {JourneyGroup[]} The grouped journeys
 */
export function groupJourneys(
  entries: Reckoning[],
  order: JourneyOrder,
): JourneyGroup[] {
  switch (order) {
    case "where":
      return bySector(entries);
    case "far":
      return byReach(entries);
    case "when":
      return byYear(entries);
  }
}
