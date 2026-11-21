import { describe, expect, it } from "vitest";

import { buildFixture, stayJson, tripJson } from "./stats.fixture";
import { getWonderVisits } from "./wonders";

/**
 * Writes a stay tagged with the given wonders.
 * @param {string} cityId - The city
 * @param {string[]} wonders - The wonders seen from it
 * @returns {unknown} The authored stay
 */
function taggedStay(cityId: string, wonders: string[]): unknown {
  return {
    ...(stayJson(cityId, "2024-06-01", "2024-06-03") as object),
    wonders,
  };
}

const { trips } = buildFixture([
  tripJson("twice", "2024-06-01", "2024-06-05", [
    taggedStay("istanbul", ["colosseum"]),
    taggedStay("oslo", ["colosseum", "gizaPyramid"]),
  ]),
  tripJson("untagged", "2025-03-01", "2025-03-03", [
    stayJson("lisbon", "2025-03-01", "2025-03-03"),
  ]),
]);

describe("getWonderVisits", () => {
  const visits = getWonderVisits(trips);

  it("lists all eight wonders even when most were never seen", () => {
    expect(visits).toHaveLength(8);
    expect(visits.filter(({ trips }) => trips.length > 0)).toHaveLength(2);
  });

  it("names a trip once however many of its stays saw the wonder", () => {
    expect(
      visits.find(({ id }) => id === "colosseum")?.trips.map(({ id }) => id),
    ).toEqual(["twice"]);
  });

  it("keeps the Great Pyramid apart from the New7Wonders", () => {
    expect(visits.filter(({ isAncient }) => !isAncient)).toHaveLength(7);
    expect(visits.find(({ isAncient }) => isAncient)?.id).toBe("gizaPyramid");
  });
});
