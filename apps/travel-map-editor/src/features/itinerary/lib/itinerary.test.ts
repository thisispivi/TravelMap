import { TripJson, validateTrip } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import {
  addOuting,
  addPlaceTo,
  importPlace,
  removeLeg,
  returnHome,
  stayHere,
  travelTo,
} from "./itinerary";

const coordinates = new Map<string, [number, number]>([
  ["cagliari", [9.11, 39.22]],
  ["bucharest", [26.1, 44.43]],
  ["sinaia", [25.55, 45.35]],
  ["brasov", [25.6, 45.65]],
  ["bergamo", [9.67, 45.69]],
]);

const empty: TripJson = {
  eDate: "2026-03-26",
  id: "romania",
  originCityId: "cagliari",
  sDate: "2026-03-26",
  steps: [],
  title: "Romania",
};

describe("building a trip one answer at a time", () => {
  const arrived = travelTo(empty, "bucharest", coordinates);
  const slept = stayHere(arrived, 4);

  it("starts the first journey at the trip's origin", () => {
    expect(arrived.steps).toEqual([
      { legs: [{ mode: "plane", toId: "bucharest" }], type: "move" },
    ]);
  });

  it("extends the current journey instead of starting a second one", () => {
    const viaBergamo = travelTo(
      travelTo(empty, "bergamo", coordinates),
      "bucharest",
      coordinates,
    );

    expect(viaBergamo.steps).toHaveLength(1);
    expect(viaBergamo.steps[0]).toMatchObject({
      legs: [{ toId: "bergamo" }, { toId: "bucharest" }],
    });
  });

  it("sleeps where the journey ended, for the nights asked", () => {
    expect(slept.steps[1]).toEqual({
      checkIn: "2026-03-26",
      checkOut: "2026-03-30",
      cityId: "bucharest",
      type: "stay",
    });
    expect(slept.eDate).toBe("2026-03-30");
  });

  it("adds a day trip that goes there and comes back on the stay's first full day", () => {
    const withDayTrip = addOuting(slept, 1, "sinaia", coordinates);
    const stay = withDayTrip.steps[1];

    expect(stay?.type === "stay" ? stay.outings : null).toEqual([
      {
        date: "2026-03-27",
        legs: [
          { mode: "train", toId: "sinaia" },
          { mode: "train", toId: "bucharest" },
        ],
      },
    ]);
  });

  it("keeps the ride back last when a place is added to a day trip", () => {
    const withDayTrip = addOuting(slept, 1, "sinaia", coordinates);
    const twoPlaces = addPlaceTo(
      withDayTrip,
      { index: 1, outing: 0 },
      "brasov",
      coordinates,
    );
    const stay = twoPlaces.steps[1];

    expect(
      stay?.type === "stay"
        ? stay.outings?.[0]?.legs.map((leg) => leg.toId)
        : [],
    ).toEqual(["sinaia", "brasov", "bucharest"]);
  });

  it("goes home from the last stay, and the finished trip validates cleanly", () => {
    const home = returnHome(slept, coordinates);
    const issues = validateTrip(
      home,
      {
        cities: new Map(
          [...coordinates].map(([id, point]) => [
            id,
            {
              coordinates: point,
              countryId: "x",
              id,
              name: id,
              timeZone: "UTC",
            },
          ]),
        ),
        photoKeys: new Set(),
      },
      "trips/romania.json",
    );

    expect(home.steps.at(-1)).toEqual({
      legs: [{ mode: "plane", toId: "cagliari" }],
      type: "move",
    });
    expect(issues.filter((issue) => issue.severity !== "suggestion")).toEqual(
      [],
    );
  });

  it("drops a journey whose last ride is removed", () => {
    expect(removeLeg(arrived, { index: 0, leg: 0 }).steps).toEqual([]);
  });
});

describe("importPlace", () => {
  it("records a row with nights as a stay and one without as a place seen on the way", () => {
    const trip = importPlace(
      importPlace(empty, "sinaia", coordinates, {
        checkIn: "2026-03-26",
        nights: 0,
      }),
      "bucharest",
      coordinates,
      { checkIn: "2026-03-26", mode: "bus", nights: 2 },
    );

    expect(trip.steps).toEqual([
      {
        legs: [
          {
            arrive: "2026-03-26",
            mode: "plane",
            toId: "sinaia",
            visited: true,
          },
          { mode: "bus", toId: "bucharest" },
        ],
        type: "move",
      },
      {
        checkIn: "2026-03-26",
        checkOut: "2026-03-28",
        cityId: "bucharest",
        type: "stay",
      },
    ]);
  });
});
