import { describe, expect, it } from "vitest";

import { dragPosition, swipeTarget } from "./swipe";

describe("swipeTarget", () => {
  const middle = { count: 5, index: 2 };

  it("turns the page after a long, slow drag", () => {
    expect(swipeTarget({ ...middle, offset: -81, velocity: 0 })).toBe(3);
    expect(swipeTarget({ ...middle, offset: 81, velocity: 0 })).toBe(1);
  });

  it("turns the page after a short, fast flick", () => {
    expect(swipeTarget({ ...middle, offset: -10, velocity: -501 })).toBe(3);
    expect(swipeTarget({ ...middle, offset: 10, velocity: 501 })).toBe(1);
  });

  it("stays when the drag was neither long nor fast enough", () => {
    expect(swipeTarget({ ...middle, offset: -79, velocity: -499 })).toBe(2);
    expect(swipeTarget({ ...middle, offset: 80, velocity: 500 })).toBe(2);
  });

  it("follows a late flick against the direction of the drag", () => {
    expect(swipeTarget({ ...middle, offset: -200, velocity: 600 })).toBe(1);
  });

  it("does not wrap at either end of the album", () => {
    expect(swipeTarget({ count: 5, index: 0, offset: 200, velocity: 0 })).toBe(
      0,
    );
    expect(swipeTarget({ count: 5, index: 4, offset: -200, velocity: 0 })).toBe(
      4,
    );
  });
});

describe("dragPosition", () => {
  const middle = { count: 5, grabbedAt: 2, index: 2 };

  it("follows the finger exactly between photos", () => {
    expect(dragPosition({ ...middle, moved: 0.25 })).toBe(2.25);
    expect(dragPosition({ ...middle, moved: -0.25 })).toBe(1.75);
  });

  it("starts from where a settling slide was caught", () => {
    expect(dragPosition({ ...middle, grabbedAt: 1.5, moved: 0.25 })).toBe(1.75);
  });

  it("stops at the neighbours, the only slides that are mounted", () => {
    expect(dragPosition({ ...middle, moved: 3 })).toBe(3);
    expect(dragPosition({ ...middle, moved: -3 })).toBe(1);
  });

  it("gives ground less and less past the first and the last photo", () => {
    const first = { count: 5, grabbedAt: 0, index: 0 };
    const small = dragPosition({ ...first, moved: -0.2 });
    const large = dragPosition({ ...first, moved: -0.8 });

    expect(small).toBeLessThan(0);
    expect(small).toBeGreaterThan(-0.2);
    expect(large).toBeLessThan(small);
    expect(large - small).toBeGreaterThan(-0.6);
    expect(
      dragPosition({ count: 5, grabbedAt: 4, index: 4, moved: 0.2 }),
    ).toBeCloseTo(4 - small);
  });
});
