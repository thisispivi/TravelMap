import { describe, expect, it } from "vitest";

import { arcBetween } from "./routeLines";

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
