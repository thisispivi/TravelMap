import { describe, expect, it } from "vitest";

import { getHemispheres, getMapEdges, getSleptInCities } from "./edges";
import { buildFixture, moveJson, stayJson, tripJson } from "./stats.fixture";

const { city, trips } = buildFixture([
  tripJson("europe", "2024-01-01", "2024-01-05", [
    moveJson(
      { mode: "plane", toId: "istanbul" },
      { mode: "plane", toId: "oslo" },
    ),
    stayJson("oslo", "2024-01-01", "2024-01-03"),
    {
      checkIn: "2024-01-03",
      checkOut: "2024-01-05",
      cityId: "lisbon",
      outings: [
        {
          date: "2024-01-04",
          legs: [
            { mode: "plane", toId: "sydney" },
            { mode: "plane", toId: "lisbon" },
          ],
        },
      ],
      type: "stay",
    },
  ]),
]);

describe("getSleptInCities", () => {
  it("keeps stays, without stopovers, day trips or the origin", () => {
    expect(getSleptInCities(trips, []).map(({ id }) => id)).toEqual([
      "oslo",
      "lisbon",
    ]);
  });

  it("leaves out a city lived in", () => {
    expect(getSleptInCities(trips, [city("oslo")]).map(({ id }) => id)).toEqual(
      ["lisbon"],
    );
  });
});

describe("getMapEdges", () => {
  it("has no edges without cities", () => {
    expect(getMapEdges([])).toBeUndefined();
  });

  it("finds the four ends and the spans between them", () => {
    const edges = getMapEdges(
      ["cagliari", "oslo", "lisbon", "sydney"].map(city),
    );
    expect(edges?.north.id).toBe("oslo");
    expect(edges?.south.id).toBe("sydney");
    expect(edges?.west.id).toBe("lisbon");
    expect(edges?.east.id).toBe("sydney");
    expect(edges?.latitudeSpan).toBeCloseTo(93.78);
    expect(edges?.longitudeSpan).toBeCloseTo(160.35);
  });

  it("takes the smallest arc across the antimeridian", () => {
    const edges = getMapEdges(["sydney", "auckland", "losAngeles"].map(city));
    expect(edges?.west.id).toBe("sydney");
    expect(edges?.east.id).toBe("losAngeles");
    expect(edges?.longitudeSpan).toBeCloseTo(90.55);
  });

  it("has one city at every end when there is only one", () => {
    const edges = getMapEdges([city("oslo")]);
    expect(edges?.east.id).toBe("oslo");
    expect(edges?.west.id).toBe("oslo");
    expect(edges?.longitudeSpan).toBe(0);
    expect(edges?.latitudeSpan).toBe(0);
  });
});

describe("getHemispheres", () => {
  it("sorts cities into quarters and halves", () => {
    const { halves, quadrants } = getHemispheres(
      ["oslo", "lisbon", "sydney", "cagliari"].map(city),
    );
    expect(
      quadrants.map(({ cities, id }) => [id, cities.map((c) => c.id)]),
    ).toEqual([
      ["NW", ["lisbon"]],
      ["NE", ["oslo", "cagliari"]],
      ["SW", []],
      ["SE", ["sydney"]],
    ]);
    expect(halves).toEqual({ east: 3, north: 3, south: 1, west: 1 });
  });
});
