import { describe, expect, it } from "vitest";

import {
  cornerAlongTurn,
  hardTurnFrame,
  reachableCorner,
  softTurnFrame,
  turnProgress,
} from "./pageTurn";

const SIZE = { height: 625, width: 440 };

/**
 * Reads the numbers out of a CSS `matrix(…)`.
 * @param {string} transform - The transform
 * @returns {number[]} Its six values
 */
const matrixOf = (transform: string): number[] =>
  (transform.match(/-?[\d.e-]+/g) ?? []).map(Number);

describe("reachableCorner", () => {
  it("keeps a corner dragged above or below the book level with it", () => {
    expect(reachableCorner({ x: 300, y: -80 }, "top", SIZE).y).toBe(0);
    expect(reachableCorner({ x: 300, y: 900 }, "bottom", SIZE).y).toBe(625);
  });

  it("keeps a corner no further from the spine than the page is wide", () => {
    const corner = reachableCorner({ x: -900, y: 0 }, "top", SIZE);
    expect(Math.hypot(corner.x, corner.y)).toBeCloseTo(440);
  });

  it("leaves a corner the page can reach where it is", () => {
    expect(reachableCorner({ x: 200, y: 40 }, "top", SIZE)).toEqual({
      x: 200,
      y: 40,
    });
  });
});

describe("turnProgress", () => {
  it("runs from 0 at rest to 1 turned over", () => {
    expect(turnProgress({ x: 440, y: 0 }, SIZE)).toBe(0);
    expect(turnProgress({ x: 0, y: 0 }, SIZE)).toBe(0.5);
    expect(turnProgress({ x: -440, y: 0 }, SIZE)).toBe(1);
  });
});

describe("cornerAlongTurn", () => {
  it("starts on the free corner and ends past the spine, on the same edge", () => {
    expect(cornerAlongTurn(0, "bottom", SIZE)).toEqual({ x: 440, y: 625 });
    const end = cornerAlongTurn(1, "bottom", SIZE);
    expect(end.x).toBe(-440);
    expect(end.y).toBeCloseTo(625);
  });

  it("lifts the corner off the edge halfway", () => {
    expect(cornerAlongTurn(0.5, "bottom", SIZE).y).toBeLessThan(625);
    expect(cornerAlongTurn(0.5, "top", SIZE).y).toBeGreaterThan(0);
  });
});

describe("softTurnFrame", () => {
  it("leaves the whole page flat at rest", () => {
    const frame = softTurnFrame({ x: 440, y: 0 }, "top", SIZE, false);
    expect(frame.frontClip).toContain("440px 625px");
    expect(frame.backClip).toBe("polygon(0 0, 0 0, 0 0)");
  });

  it("lays the back page flat beside the spine once turned", () => {
    const frame = softTurnFrame({ x: -440, y: 0 }, "top", SIZE, false);
    const [a, b, c, d, e, f] = matrixOf(frame.backTransform);
    expect([a, b, c, d]).toEqual([1, 0, 0, 1]);
    expect(e).toBeCloseTo(-440);
    expect(f).toBeCloseTo(0);
  });

  it("mirrors a page turning rightwards, laying its back to the right", () => {
    const frame = softTurnFrame({ x: -440, y: 0 }, "top", SIZE, true);
    const [, , , , e] = matrixOf(frame.backTransform);
    expect(e).toBeCloseTo(440);
  });

  it("lifts the part of the page beyond the fold", () => {
    const frame = softTurnFrame({ x: 240, y: 625 }, "bottom", SIZE, false);
    expect(frame.progress).toBeGreaterThan(0);
    expect(frame.frontClip).toContain("0px 0px");
    expect(frame.frontClip).not.toContain("440px 625px");
  });
});

describe("hardTurnFrame", () => {
  it("swings a board on its spine, outside away and inside round", () => {
    const start = hardTurnFrame(0, SIZE, false);
    expect(start.frontTransform).toContain("rotateY(0deg)");
    expect(start.origin).toBe("0 50%");
    const end = hardTurnFrame(1, SIZE, false);
    expect(end.backTransform).toContain("rotateY(0deg)");
    expect(hardTurnFrame(0, SIZE, true).origin).toBe("100% 50%");
  });
});
