import { describe, expect, it } from "vitest";

import { fitName, FRAME_GEOMETRY } from "./stampFrames";

describe("fitName", () => {
  it("wraps a long name on a straight frame, and keeps a short one whole", () => {
    const frame = FRAME_GEOMETRY.rectangle;
    expect(fitName("Bosnia and Herzegovina", frame, "caps").lines).toEqual([
      "Bosnia and",
      "Herzegovina",
    ]);
    expect(fitName("Italy", frame, "caps").lines).toEqual(["Italy"]);
  });

  it("shrinks a long name on a curved frame rather than wrapping it", () => {
    const frame = FRAME_GEOMETRY.circle;
    const short = fitName("Peru", frame, "curved");
    const long = fitName("Bosnia and Herzegovina", frame, "curved");
    expect(long.lines).toHaveLength(1);
    expect(long.size).toBeLessThanOrEqual(short.size);
  });
});
