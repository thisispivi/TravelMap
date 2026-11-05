import { COUNTRIES, findCountry } from "@travelmap/core";
import { neighbors } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { describe, expect, it } from "vitest";

import countriesTopologyJson from "../../assets/json/countries-50m.json";
import { countriesGeoJson } from "./countries";

/* JSON imports type every array as wide as its widest member, which topojson's types reject. */
const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection;
}>;

describe("countriesGeoJson", () => {
  it("names the catalogue country of every polygon, and every country once", () => {
    const codes = countriesGeoJson.features.map(
      ({ properties }) => properties.id,
    );
    expect(codes.toSorted()).toEqual([...COUNTRIES.keys()].toSorted());
  });

  it("never paints two neighbouring countries the same colour", () => {
    const codes = countriesGeoJson.features.map(
      ({ properties }) => properties.id ?? "",
    );

    /**
     * Reads the colour of the country a polygon draws.
     * @param {number} index - The polygon's place in the topology
     * @returns {string} Its colour, written out so two can be compared
     */
    const colourOf = (index: number): string =>
      JSON.stringify(findCountry(codes[index] ?? "")?.color);
    neighbors(topology.objects.countries.geometries).forEach(
      (around, index) => {
        for (const other of around)
          expect(
            colourOf(other),
            `${codes[index]} and ${codes[other]}`,
          ).not.toBe(colourOf(index));
      },
    );
  });
});
