import { describe, expect, it } from "vitest";

import {
  buildTimeline,
  lengthShareAt,
  lineWindow,
  routePath,
  routeX,
  stopPose,
} from "./timeline";

/**
 * Builds the only part of a trip the timeline reads.
 * @param {string} start - YYYY-MM-DD start
 * @param {number} days - How many days it lasted
 * @returns {{ sDate: Date; getDurationInDays: () => number }} A trip stand-in
 */
function trip(
  start: string,
  days: number,
): { sDate: Date; getDurationInDays: () => number } {
  const [year, month, day] = start.split("-").map(Number);
  return {
    getDurationInDays: () => days,
    sDate: new Date(year, month - 1, day),
  };
}

describe("buildTimeline", () => {
  it("groups trips by the year they started, newest first", () => {
    const years = buildTimeline([
      trip("2021-05-01", 3),
      trip("2023-08-01", 10),
      trip("2023-02-01", 2),
    ]);
    expect(years.map(({ year, trips }) => [year, trips.length])).toEqual([
      [2023, 2],
      [2021, 1],
    ]);
  });

  it("adds up the days of all of a year's trips", () => {
    const [year] = buildTimeline([
      trip("2023-08-01", 3),
      trip("2023-02-01", 2),
    ]);
    expect(year?.days).toBe(5);
  });

  it("lists a year's trips newest first", () => {
    const early = trip("2023-02-01", 5);
    const late = trip("2023-08-15", 6);
    const [year] = buildTimeline([early, late]);
    expect(year?.trips).toEqual([late, early]);
  });

  it("keeps a trip over New Year whole in the year it started", () => {
    const [year] = buildTimeline([trip("2025-12-30", 4)]);
    expect(year?.year).toBe(2025);
    expect(year?.days).toBe(4);
  });

  it("returns nothing for no trips", () => {
    expect(buildTimeline([])).toEqual([]);
  });
});

describe("stopPose", () => {
  const stop = {
    height: 200,
    isLeft: true,
    isReduced: false,
    top: 1000,
    viewport: 800,
  };

  it("hides a card still below the page", () => {
    expect(stopPose({ ...stop, scroll: 100 }).opacity).toBe(0);
  });

  it("shows a card whole and in place once its bottom edge is on screen", () => {
    expect(stopPose({ ...stop, scroll: 400 })).toEqual({
      opacity: 1,
      rotate: -0,
      scale: 1,
      x: 0,
      y: 0,
    });
  });

  it("hides a card again once it has passed the top", () => {
    expect(stopPose({ ...stop, scroll: 1200 }).opacity).toBe(0);
  });

  it("is the same pose whichever way the page reached that scroll", () => {
    const halfway = stopPose({ ...stop, scroll: 300 });
    stopPose({ ...stop, scroll: 1200 });
    expect(stopPose({ ...stop, scroll: 300 })).toEqual(halfway);
  });

  it("swings in from the line on either side", () => {
    expect(stopPose({ ...stop, scroll: 300 }).x).toBeGreaterThan(0);
    expect(stopPose({ ...stop, isLeft: false, scroll: 300 }).x).toBeLessThan(0);
  });

  it("only fades when the reader asked for less motion", () => {
    const pose = stopPose({ ...stop, isReduced: true, scroll: 300 });
    expect(pose.opacity).toBeGreaterThan(0);
    expect(pose.opacity).toBeLessThan(1);
    expect([pose.x, pose.y, pose.scale]).toEqual([0, 0, 1]);
  });
});

describe("lineWindow", () => {
  const page = {
    maxScroll: 2000,
    routeHeight: 2500,
    routeTop: 50,
    viewport: 800,
  };

  it("draws nothing already passed at the top of the page", () => {
    expect(lineWindow({ ...page, scroll: 0 }).tail).toBe(0);
  });

  it("reaches the very end of the line at the bottom of the page", () => {
    expect(lineWindow({ ...page, scroll: 2000 }).tip).toBe(1);
  });

  it("draws the whole line when the page cannot scroll", () => {
    expect(lineWindow({ ...page, maxScroll: 0, scroll: 0 }).tip).toBe(1);
  });

  it("holds the tip before the line starts during the opening", () => {
    expect(lineWindow({ ...page, scroll: -800 }).tip).toBe(0);
  });
});

describe("lengthShareAt", () => {
  const heights = [0, 10, 10, 10, 50];

  it("draws nothing above the start of the line", () => {
    expect(lengthShareAt(heights, -5)).toBe(0);
  });

  it("draws everything below the end of the line", () => {
    expect(lengthShareAt(heights, 60)).toBe(1);
  });

  it("spends the length of a sideways sweep in one step of height", () => {
    expect(lengthShareAt(heights, 30)).toBeCloseTo(0.875);
  });

  it("draws everything when the line has no points yet", () => {
    expect(lengthShareAt([], 30)).toBe(1);
  });
});

describe("routeX", () => {
  it("swings to the side of each stop's card in turn", () => {
    expect(routeX(0, 100, 20)).toBeLessThan(100);
    expect(routeX(1, 100, 20)).toBeGreaterThan(100);
  });

  it("always swings out far enough to read as a curve", () => {
    for (let index = 0; index < 50; index += 1) {
      expect(Math.abs(routeX(index, 100, 20) - 100)).toBeGreaterThanOrEqual(12);
    }
  });

  it("never leaves the sway either side of the centre", () => {
    for (let index = 0; index < 50; index += 1) {
      const x = routeX(index, 100, 20);
      expect(x).toBeGreaterThanOrEqual(80);
      expect(x).toBeLessThanOrEqual(120);
    }
  });
});

describe("routePath", () => {
  it("draws nothing without any stops", () => {
    expect(routePath([])).toBe("");
  });

  it("starts at the top of the route, above the first stop", () => {
    expect(routePath([{ x: 30, y: 50 }])).toBe("M30 0 L30 50");
  });

  it("ends each curve on its stop", () => {
    expect(
      routePath([
        { x: 30, y: 50 },
        { x: 40, y: 150 },
      ]),
    ).toBe("M30 0 L30 50 C30 100 40 100 40 150");
  });
});
