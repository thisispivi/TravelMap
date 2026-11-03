import { Continent } from "@travelmap/core";

/** The drawings of a continent, each one `d` string on a 64×64 canvas. */
export type EmblemSet = Record<string, string>;

/**
 * Fetches a continent's drawings. Each continent is its own chunk, so a reader
 * downloads only the ones whose pages are open.
 * @param {Continent} continent - The continent
 * @returns {Promise<EmblemSet>} Its drawings
 */
export async function loadEmblems(continent: Continent): Promise<EmblemSet> {
  switch (continent) {
    case Continent.AFRICA:
      return (await import("./emblems/africa")).AFRICA_EMBLEMS;
    case Continent.ASIA:
      return (await import("./emblems/asia")).ASIA_EMBLEMS;
    case Continent.EUROPE:
      return (await import("./emblems/europe")).EUROPE_EMBLEMS;
    case Continent.NORTH_AMERICA:
      return (await import("./emblems/northAmerica")).NORTH_AMERICA_EMBLEMS;
    case Continent.SOUTH_AMERICA:
      return (await import("./emblems/southAmerica")).SOUTH_AMERICA_EMBLEMS;
    case Continent.ANTARCTICA:
    case Continent.OCEANIA:
      return (await import("./emblems/oceania")).OCEANIA_EMBLEMS;
  }
}
