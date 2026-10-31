import { describe, expect, it } from "vitest";

import { getOperatorGroups } from "./transport";

describe("getOperatorGroups", () => {
  it("ranks each kind's operators by how many rides they ran", () => {
    expect(
      getOperatorGroups(
        [
          { company: "easyjet", mode: "plane" },
          { company: "ryanair", mode: "plane" },
          { company: "ryanair", mode: "plane" },
        ],
        () => undefined,
      ),
    ).toEqual([
      {
        companies: [
          { company: "ryanair", count: 2 },
          { company: "easyjet", count: 1 },
        ],
        mode: "plane",
      },
    ]);
  });

  it("keeps kinds apart by the company's tag, ahead of the ride's mode", () => {
    expect(
      getOperatorGroups(
        [
          { company: "flixbus", mode: "plane" },
          { company: "tirrenia", mode: "ferry" },
        ],
        (company) => (company === "flixbus" ? "bus" : undefined),
      ).map(({ companies, mode }) => [mode, companies[0]?.company]),
    ).toEqual([
      ["ferry", "tirrenia"],
      ["bus", "flixbus"],
    ]);
  });

  it("skips rides with no recorded operator", () => {
    expect(
      getOperatorGroups(
        [{ mode: "plane" }, { company: undefined, mode: "train" }],
        () => undefined,
      ),
    ).toEqual([]);
  });
});
