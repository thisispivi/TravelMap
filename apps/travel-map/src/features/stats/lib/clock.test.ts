import { describe, expect, it } from "vitest";

import { getTravelClock } from "./clock";
import { buildFixture, moveJson, tripJson } from "./stats.fixture";

const { trips } = buildFixture([
  tripJson("late", "2024-06-01", "2024-06-20", [
    moveJson({
      arrive: "2024-06-01T23:30",
      depart: "2024-06-01T06:30",
      mode: "plane",
      toId: "oslo",
    }),
    moveJson({
      arrive: "2024-06-02T01:30",
      depart: "2024-06-02T00:30",
      mode: "plane",
      toId: "lisbon",
    }),
  ]),
  tripJson("early", "2023-01-01", "2023-01-02", [
    moveJson({
      arrive: "2023-01-01T09:00",
      depart: "2023-01-01T06:30",
      mode: "train",
      toId: "istanbul",
    }),
    moveJson({ mode: "train", toId: "cagliari" }),
    moveJson({
      arrive: "2023-01-02",
      depart: "2023-01-02",
      mode: "bus",
      toId: "oslo",
    }),
  ]),
]);
const clock = getTravelClock(trips);

describe("getTravelClock", () => {
  it("counts each ride in the hour its own clock showed", () => {
    expect(clock.departures[6]).toBe(2);
    expect(clock.departures[0]).toBe(1);
    expect(clock.arrivals[23]).toBe(1);
    expect(clock.arrivals[1]).toBe(1);
  });

  it("skips a ride whose time was never recorded", () => {
    expect(clock.departures.reduce((sum, count) => sum + count)).toBe(3);
    expect(clock.arrivals.reduce((sum, count) => sum + count)).toBe(3);
  });

  it("counts the small hours as the end of the day before", () => {
    expect(clock.latest?.minute).toBe(90);
    expect(clock.earliest?.minute).toBe(390);
  });

  it("gives a tie to the earliest trip", () => {
    expect(clock.earliest?.trip.id).toBe("early");
  });

  it("has no extremes without times", () => {
    const { earliest, latest } = getTravelClock([]);
    expect(earliest).toBeUndefined();
    expect(latest).toBeUndefined();
  });
});
