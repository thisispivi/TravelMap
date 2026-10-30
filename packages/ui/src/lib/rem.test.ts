import { afterEach, describe, expect, it } from "vitest";

import { remToPx } from "./rem";

describe("remToPx", () => {
  afterEach(() => {
    document.documentElement.style.fontSize = "";
  });

  it("grows with the reader's root font size", () => {
    document.documentElement.style.fontSize = "20px";
    expect(remToPx(1.5)).toBe(30);
  });
});
