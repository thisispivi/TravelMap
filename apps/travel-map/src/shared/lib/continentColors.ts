import { Continent } from "@travelmap/core";
import variables from "@travelmap/ui/styles/_variables.module.scss";

/** Each continent's pastel, shared by the timeline bars and the statistics. */
export const CONTINENT_COLORS: Record<Continent, string> = {
  [Continent.AFRICA]: variables.continentsAfrica,
  [Continent.ANTARCTICA]: variables.continentsAntarctica,
  [Continent.ASIA]: variables.continentsAsia,
  [Continent.EUROPE]: variables.continentsEurope,
  [Continent.NORTH_AMERICA]: variables.continentsNorthAmerica,
  [Continent.OCEANIA]: variables.continentsOceania,
  [Continent.SOUTH_AMERICA]: variables.continentsSouthAmerica,
};
