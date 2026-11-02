import { describe, expect, it } from "vitest";

import { countCrossings, EarthLineId, getLineCrossings } from "./crossings";
import { buildFixture, moveJson, stayJson, tripJson } from "./stats.fixture";

const EQUATOR = { at: 0, axis: "lat" } as const;
const ANTIMERIDIAN = { at: 180, axis: "lng" } as const;
const PRIME = { at: 0, axis: "lng" } as const;

describe("countCrossings", () => {
  it("does not count a route running along the line", () => {
    expect(
      countCrossings(
        [
          [0, 0],
          [5, 0],
          [10, 0],
        ],
        EQUATOR,
      ),
    ).toBe(0);
  });

  it("does not count touching the line and turning back", () => {
    expect(
      countCrossings(
        [
          [0, 5],
          [5, 0],
          [10, 5],
        ],
        EQUATOR,
      ),
    ).toBe(0);
  });

  it("counts passing through a point exactly on the line once", () => {
    expect(
      countCrossings(
        [
          [0, 5],
          [5, 0],
          [10, -5],
        ],
        EQUATOR,
      ),
    ).toBe(1);
  });

  it("sees the antimeridian on longitudes that run past 180", () => {
    expect(
      countCrossings(
        [
          [170, 0],
          [190, 0],
        ],
        ANTIMERIDIAN,
      ),
    ).toBe(1);
    expect(
      countCrossings(
        [
          [-170, 0],
          [-190, 0],
        ],
        ANTIMERIDIAN,
      ),
    ).toBe(1);
  });

  it("does not take a route inside one world for the ±180 wrap", () => {
    expect(
      countCrossings(
        [
          [-170, 0],
          [170, 0],
        ],
        ANTIMERIDIAN,
      ),
    ).toBe(0);
    expect(
      countCrossings(
        [
          [-170, 0],
          [170, 0],
        ],
        PRIME,
      ),
    ).toBe(1);
  });

  it("skips a route with a missing coordinate", () => {
    expect(
      countCrossings(
        [
          [Number.NaN, 10],
          [0, -10],
        ],
        EQUATOR,
      ),
    ).toBe(0);
  });
});

describe("getLineCrossings", () => {
  const { trips } = buildFixture([
    tripJson("down-under", "2024-01-01", "2024-01-10", [
      moveJson({ mode: "plane", toId: "sydney" }),
      stayJson("sydney", "2024-01-02", "2024-01-09"),
      moveJson({ mode: "plane", toId: "cagliari" }),
    ]),
    tripJson("pacific", "2025-01-01", "2025-01-05", [
      moveJson({ mode: "plane", toId: "auckland" }),
      moveJson({ mode: "plane", toId: "losAngeles" }),
      stayJson("losAngeles", "2025-01-02", "2025-01-04"),
    ]),
    tripJson("north", "2023-01-01", "2023-01-03", [
      moveJson({ mode: "train", toId: "oslo" }),
      stayJson("oslo", "2023-01-01", "2023-01-02"),
    ]),
  ]);
  const byDate = trips.toSorted(
    (a, b) => a.sDate.getTime() - b.sDate.getTime(),
  );

  /**
   * Finds one line's result.
   * @param {EarthLineId} id - The line
   * @returns {{ count: number; trips: string[] }} Its crossings and the trips' ids
   */
  const crossings = (id: EarthLineId): { count: number; trips: string[] } => {
    const line = getLineCrossings(byDate).find((entry) => entry.id === id);
    return {
      count: line?.count ?? -1,
      trips: line?.trips.map((trip) => trip.id) ?? [],
    };
  };

  it("counts an out-and-back flight over the equator twice", () => {
    const { count, trips: crossed } = crossings("equator");
    expect(crossed[0]).toBe("down-under");
    expect(count).toBeGreaterThanOrEqual(2);
    expect(
      getLineCrossings(byDate.slice(1, 2)).find(({ id }) => id === "equator")
        ?.count,
    ).toBe(2);
  });

  it("finds the date line on the flight across the Pacific only", () => {
    expect(crossings("antimeridian")).toEqual({
      count: 1,
      trips: ["pacific"],
    });
  });

  it("leaves a line never crossed with no trips", () => {
    expect(crossings("antarctic")).toEqual({ count: 0, trips: [] });
  });

  it("lists the crossing trips oldest first", () => {
    expect(crossings("capricorn").trips).toEqual(["down-under", "pacific"]);
  });
});
