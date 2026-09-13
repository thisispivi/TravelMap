import { Ferry, Flight } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { getCompanyStats } from "./transport";

/*
 * The ranking reads nothing but `company`, and a real Flight needs two linked
 * City graphs to construct, so these fixtures are cast rather than built.
 */

/**
 * Builds the smallest journey shape the operator ranking reads.
 * @param {string} [company] - The operator id, omitted for an unrecorded one
 * @returns {Flight} A stand-in journey
 */
function journey(company?: string): Flight {
  return { company } as Flight;
}

describe("getCompanyStats", () => {
  it("ranks operators by journey count, most used first", () => {
    expect(
      getCompanyStats([
        journey("ryanair"),
        journey("easyjet"),
        journey("ryanair"),
      ]),
    ).toEqual([
      { company: "ryanair", count: 2 },
      { company: "easyjet", count: 1 },
    ]);
  });

  it("skips journeys with no recorded operator", () => {
    expect(getCompanyStats([journey(), journey("tirrenia")])).toEqual([
      { company: "tirrenia", count: 1 },
    ]);
  });

  it("counts ferry crossings the same way as flights", () => {
    const crossings = [{ company: "tirrenia" }] as Ferry[];

    expect(getCompanyStats(crossings)).toEqual([
      { company: "tirrenia", count: 1 },
    ]);
  });

  it("returns nothing when there is nothing to rank", () => {
    expect(getCompanyStats([])).toEqual([]);
  });
});
