import { describe, expect, it } from "vitest";

import { isSameJson } from "./jsonEquality";

describe("isSameJson", () => {
  it("treats a stay whose keys were reordered by the server as unchanged", () => {
    expect(
      isSameJson(
        {
          checkIn: "2027-08-07",
          cityId: "Shanghai",
          type: "stay",
          outings: [],
        },
        {
          checkIn: "2027-08-07",
          cityId: "Shanghai",
          outings: [],
          type: "stay",
        },
      ),
    ).toBe(true);
  });

  it("still sees a real change, including inside arrays", () => {
    expect(
      isSameJson({ legs: [{ toId: "XiAn" }] }, { legs: [{ toId: "Xian" }] }),
    ).toBe(false);
    expect(isSameJson([1, 2], [2, 1])).toBe(false);
  });

  it("ignores a field left undefined, which never reaches the file", () => {
    expect(isSameJson({ photoPath: undefined, toId: "a" }, { toId: "a" })).toBe(
      true,
    );
  });
});
