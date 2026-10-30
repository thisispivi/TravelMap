import { afterEach, describe, expect, it, vi } from "vitest";

import { fitVertically } from "./anchor";

/**
 * Builds a trigger box at the given height in an 800px-tall window.
 * @param {number} top - The trigger's top edge
 * @param {number} bottom - The trigger's bottom edge
 * @returns {DOMRect} The box
 */
function boxAt(top: number, bottom: number): DOMRect {
  vi.stubGlobal("window", { innerHeight: 800 });
  /* Only the two edges are read, so a partial box stands in for a measured one. */
  return { bottom, top } as DOMRect;
}

afterEach(() => vi.unstubAllGlobals());

describe("fitVertically", () => {
  it("opens below when the room there is enough", () => {
    expect(fitVertically(boxAt(100, 140), 4, 300)).toEqual({
      opensUp: false,
      room: 652,
    });
  });

  it("opens above a trigger low on the screen", () => {
    expect(fitVertically(boxAt(700, 740), 4, 300)).toEqual({
      opensUp: true,
      room: 692,
    });
  });

  it("stays below when above is no roomier", () => {
    expect(fitVertically(boxAt(60, 700), 4, 300).opensUp).toBe(false);
  });
});
