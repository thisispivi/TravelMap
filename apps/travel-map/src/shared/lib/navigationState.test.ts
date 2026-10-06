import { describe, expect, it } from "vitest";

import { readNavigationState } from "./navigationState";

describe("readNavigationState", () => {
  it("returns the fields the app's own navigations write", () => {
    expect(readNavigationState({ fromPath: "/places?c=IT" })).toEqual({
      fromPath: "/places?c=IT",
    });
    expect(readNavigationState({ mapOnly: true })).toEqual({ mapOnly: true });
  });

  it("treats missing, foreign, or malformed state as empty", () => {
    expect(readNavigationState(null)).toEqual({});
    expect(readNavigationState("trips")).toEqual({});
    expect(readNavigationState({ mapOnly: "yes" })).toEqual({});
  });

  it("refuses a return path that leaves the app", () => {
    expect(readNavigationState({ fromPath: "https://example.com" })).toEqual(
      {},
    );
  });
});
