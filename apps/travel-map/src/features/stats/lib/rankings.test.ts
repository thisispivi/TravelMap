import { describe, expect, it } from "vitest";

import { getPlaceRankings, getTripRankings } from "./rankings";
import { buildFixture, moveJson, stayJson, tripJson } from "./stats.fixture";

const { city, trips } = buildFixture([
  tripJson("late", "2024-06-01", "2024-06-20", [
    stayJson("sydney", "2024-06-01", "2024-06-11"),
    stayJson("oslo", "2024-06-11", "2024-06-13"),
  ]),
  tripJson("early", "2023-01-01", "2023-01-20", [
    moveJson({ distanceInKm: 100, mode: "train", toId: "oslo" }),
    stayJson("oslo", "2023-01-01", "2023-01-05"),
    stayJson("lisbon", "2023-01-05", "2023-01-07"),
    stayJson("istanbul", "2023-01-07", "2023-01-08"),
  ]),
  tripJson("short", "2025-03-01", "2025-03-03", [
    stayJson("lisbon", "2025-03-01", "2025-03-03"),
  ]),
]);

describe("getTripRankings", () => {
  const rankings = getTripRankings(trips);

  it("ranks by days, a tie going to the earliest trip", () => {
    expect(rankings.days.map(({ trip }) => trip.id)).toEqual([
      "early",
      "late",
      "short",
    ]);
    expect(rankings.days[0].value).toBe(20);
  });

  it("ranks by the different places seen", () => {
    expect(rankings.cities[0]).toMatchObject({ value: 3 });
    expect(rankings.cities[0].trip.id).toBe("early");
  });
});

describe("getPlaceRankings", () => {
  const rankings = getPlaceRankings({
    lived: [],
    photosOf: (place) => ({ oslo: 40, sydney: 40 })[place.id] ?? 0,
    trips,
  });

  it("adds up the nights of every stay in a city", () => {
    expect(rankings.nights[0]).toMatchObject({
      city: city("sydney"),
      value: 10,
    });
    expect(rankings.nights[1]).toMatchObject({ city: city("oslo"), value: 6 });
  });

  it("ranks by visits only the places returned to", () => {
    expect(rankings.visits.map((entry) => entry.city.id)).toEqual([
      "oslo",
      "lisbon",
    ]);
  });

  it("gives a tie on photos to the place seen first, and leaves out none", () => {
    expect(rankings.photos.map((entry) => entry.city.id)).toEqual([
      "oslo",
      "sydney",
    ]);
  });

  it("leaves out a city lived in", () => {
    const { nights } = getPlaceRankings({
      lived: [city("sydney")],
      photosOf: () => 0,
      trips,
    });
    expect(nights[0].city.id).toBe("oslo");
  });

  it("keeps a ranking to its six best", () => {
    const { trips: many } = buildFixture(
      ["2020", "2021", "2022", "2023", "2024", "2025", "2026"].map((year) =>
        tripJson(year, `${year}-01-01`, `${year}-01-02`, []),
      ),
    );
    expect(getTripRankings(many).days).toHaveLength(6);
  });
});
