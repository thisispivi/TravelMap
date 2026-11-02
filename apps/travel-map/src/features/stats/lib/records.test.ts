import { describe, expect, it } from "vitest";

import { getRecords, RecordId, TravelRecord } from "./records";
import { buildFixture, moveJson, stayJson, tripJson } from "./stats.fixture";

const { city, trips } = buildFixture([
  tripJson("late", "2024-06-01", "2024-06-20", [
    moveJson(
      {
        arrive: "2024-06-01T14:00",
        depart: "2024-06-01T06:30",
        distanceInKm: 1500,
        mode: "plane",
        toId: "istanbul",
      },
      {
        arrive: "2024-06-02T18:00",
        depart: "2024-06-01T20:30",
        distanceInKm: 15000,
        mode: "plane",
        toId: "sydney",
      },
    ),
    stayJson("sydney", "2024-06-02", "2024-06-12"),
    moveJson({ distanceInKm: 16000, mode: "plane", toId: "cagliari" }),
    stayJson("cagliari", "2024-06-13", "2024-06-15"),
  ]),
  tripJson("early", "2023-01-01", "2023-01-20", [
    moveJson({
      distanceInKm: 2000,
      durationMinutes: 600,
      mode: "train",
      toId: "oslo",
    }),
    stayJson("oslo", "2023-01-01", "2023-01-05"),
    moveJson({
      distanceInKm: 2500,
      durationMinutes: 900,
      mode: "bus",
      toId: "lisbon",
    }),
    stayJson("lisbon", "2023-01-05", "2023-01-07"),
  ]),
  tripJson("there-and-back", "2025-03-01", "2025-03-03", [
    moveJson({ distanceInKm: 9000, mode: "plane", toId: "istanbul" }),
    moveJson({ distanceInKm: 9000, mode: "plane", toId: "cagliari" }),
  ]),
]);
const records = getRecords({ home: city("cagliari"), lived: [], trips });

/**
 * Finds one record.
 * @param {RecordId} id - The record
 * @returns {TravelRecord | undefined} The record, when the data supports it
 */
const record = (id: RecordId): TravelRecord | undefined =>
  records.find((entry) => entry.id === id);

describe("getRecords", () => {
  it("reads a layover through each city's own clock", () => {
    expect(record("longestLayover")?.best).toMatchObject({
      route: [city("istanbul")],
      value: 390,
    });
  });

  it("picks the longest overland ride by duration", () => {
    expect(record("longestOverland")?.best.value).toBe(900);
    expect(record("longestOverland")?.runnerUp?.value).toBe(600);
  });

  it("does not make the flight home its own runner-up", () => {
    const longest = record("longestFlight");
    expect(longest?.best.value).toBe(16000);
    expect(longest?.runnerUp?.value).toBe(15000);
    const { trips: returning } = buildFixture([
      tripJson("return", "2025-03-01", "2025-03-03", [
        moveJson({ distanceInKm: 9000, mode: "plane", toId: "istanbul" }),
        moveJson({ distanceInKm: 9000, mode: "plane", toId: "cagliari" }),
      ]),
    ]);
    const [flight] = getRecords({ home: null, lived: [], trips: returning });
    expect(flight.runnerUp).toBeUndefined();
  });

  it("gives a tie to the earliest candidate", () => {
    const { trips: tied } = buildFixture([
      tripJson("second", "2024-01-01", "2024-01-02", [
        moveJson({ distanceInKm: 500, mode: "plane", toId: "oslo" }),
      ]),
      tripJson("first", "2023-01-01", "2023-01-02", [
        moveJson({ distanceInKm: 500, mode: "plane", toId: "lisbon" }),
      ]),
    ]);
    const [flight] = getRecords({ home: null, lived: [], trips: tied });
    expect(flight.best.trip?.id).toBe("first");
    expect(flight.runnerUp?.trip?.id).toBe("second");
  });

  it("measures the widest gap between clocks within one trip", () => {
    const jump = record("biggestZoneJump");
    expect(jump?.best.trip?.id).toBe("late");
    expect(jump?.best.route).toEqual([city("cagliari"), city("sydney")]);
    expect(jump?.best.value).toBe(480);
  });

  it("finds the furthest city from home, without home itself", () => {
    expect(record("furthestCity")?.best.city?.id).toBe("sydney");
    expect(record("furthestCity")?.runnerUp?.city?.id).toBe("oslo");
  });

  it("hides every record with no inputs", () => {
    const lone = buildFixture([
      tripJson("one", "2024-01-01", "2024-01-03", [
        stayJson("oslo", "2024-01-01", "2024-01-03"),
      ]),
    ]);
    expect(
      getRecords({ home: null, lived: [lone.city("oslo")], trips: lone.trips }),
    ).toEqual([]);
  });
});
