import { Trip, WonderId, WONDERS } from "@travelmap/core";

/**
 * One wonder of the checklist and the trips that saw it.
 * @property {WonderId} id - The wonder
 * @property {string} countryId - The country it stands in
 * @property {boolean} isAncient - Whether it is the surviving ancient wonder
 * @property {Trip[]} trips - Every trip with a stay tagged with it, in trip order
 */
export interface WonderVisit {
  id: WonderId;
  countryId: string;
  isAncient: boolean;
  trips: Trip[];
}

/**
 * Ticks off the Wonders of the World a stay was tagged with. Every wonder is
 * listed, seen or not, and a wonder seen on several stays of one trip still
 * names that trip once.
 * @param {Trip[]} trips - The trips taken
 * @returns {WonderVisit[]} The checklist, in catalogue order
 */
export function getWonderVisits(trips: Trip[]): WonderVisit[] {
  return WONDERS.map(({ countryId, id, isAncient }) => ({
    countryId,
    id,
    isAncient,
    trips: trips.filter(({ stays }) =>
      stays.some(({ wonders }) => wonders.includes(id)),
    ),
  }));
}
