import { describe, expect, it } from "vitest";

import { radioTarget } from "./keyboard";

describe("radioTarget", () => {
  it("wraps arrow keys around the ends of the group", () => {
    expect(radioTarget({ key: "ArrowRight" }, 2, 3)).toBe(0);
    expect(radioTarget({ key: "ArrowLeft" }, 0, 3)).toBe(2);
  });

  it("jumps with Home and End and ignores other keys", () => {
    expect(radioTarget({ key: "End" }, 0, 4)).toBe(3);
    expect(radioTarget({ key: "Home" }, 3, 4)).toBe(0);
    expect(radioTarget({ key: "Tab" }, 1, 4)).toBeUndefined();
  });
});
