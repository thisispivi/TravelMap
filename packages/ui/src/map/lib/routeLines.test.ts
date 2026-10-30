import { describe, expect, it } from "vitest";

import { arcBetween, nearSide } from "./routeLines";

describe("arcBetween", () => {
  it("starts and ends exactly on the two cities", () => {
    const arc = arcBetween([9, 39], [4, 50]);
    expect(arc[0]).toEqual([9, 39]);
    expect(arc.at(-1)).toEqual([4, 50]);
  });

  it("bows away from the straight line between them", () => {
    const arc = arcBetween([0, 0], [10, 0]);
    const middle = arc[Math.floor(arc.length / 2)];
    expect(middle[0]).toBeCloseTo(5);
    expect(middle[1]).toBeGreaterThan(0.5);
  });

  it("bows to opposite sides on the way out and the way back", () => {
    const out = arcBetween([0, 0], [10, 0]);
    const back = arcBetween([10, 0], [0, 0]);
    const middle = Math.floor(out.length / 2);
    expect(Math.sign(out[middle][1])).toBe(-Math.sign(back[middle][1]));
  });
});

describe("nearSide", () => {
  it("crosses the antimeridian rather than circling the globe", () => {
    expect(nearSide([151.2, -33.9], [-118.2, 34.1])).toEqual([241.8, 34.1]);
    expect(nearSide([-118.2, 34.1], [151.2, -33.9])[0]).toBeCloseTo(-208.8);
  });

  it("leaves a route that never nears the antimeridian alone", () => {
    expect(nearSide([9, 39], [4, 50])).toEqual([4, 50]);
  });

  it("keeps a Pacific flight's arc short", () => {
    const arc = arcBetween([151.2, -33.9], [-118.2, 34.1]);
    expect(arc.at(-1)?.[0]).toBeCloseTo(241.8);
    expect(arc.every(([lng]) => lng >= 151.2 - 20 && lng <= 241.8 + 20)).toBe(
      true,
    );
  });
});
