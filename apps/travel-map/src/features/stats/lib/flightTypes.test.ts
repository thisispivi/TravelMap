import { TravelType } from "@travelmap/core/typings/Travel";
import { describe, expect, it } from "vitest";

import { getDonutSegments, getFlightTypeStats } from "./flightTypes";

describe("getFlightTypeStats", () => {
  it("counts flights and adds up kilometres for every type", () => {
    expect(
      getFlightTypeStats([
        { distanceInKm: 9000, travelType: TravelType.INTERCONTINENTAL },
        { distanceInKm: 400, travelType: TravelType.NATIONAL },
        { distanceInKm: 600, travelType: TravelType.NATIONAL },
        { distanceInKm: 1500, travelType: TravelType.INTERNATIONAL },
      ]),
    ).toEqual({
      count: 4,
      km: 11500,
      types: [
        { count: 2, km: 1000, type: TravelType.NATIONAL },
        { count: 1, km: 1500, type: TravelType.INTERNATIONAL },
        { count: 1, km: 9000, type: TravelType.INTERCONTINENTAL },
      ],
    });
  });

  it("leaves out the types never flown", () => {
    expect(
      getFlightTypeStats([
        { distanceInKm: 500, travelType: TravelType.INTERNATIONAL },
      ]).types.map(({ type }) => type),
    ).toEqual([TravelType.INTERNATIONAL]);
  });

  it("has nothing to split without flights", () => {
    expect(getFlightTypeStats([])).toEqual({ count: 0, km: 0, types: [] });
  });

  it("counts a flight with no usable distance without spoiling the kilometres", () => {
    expect(
      getFlightTypeStats([
        { distanceInKm: Number.NaN, travelType: TravelType.NATIONAL },
        { distanceInKm: 0, travelType: TravelType.NATIONAL },
        { distanceInKm: 300, travelType: TravelType.NATIONAL },
      ]),
    ).toEqual({
      count: 3,
      km: 300,
      types: [{ count: 3, km: 300, type: TravelType.NATIONAL }],
    });
  });
});

describe("getDonutSegments", () => {
  it("closes the ring around a value alone", () => {
    expect(getDonutSegments([7])).toEqual([{ length: 1, offset: 0 }]);
  });

  it("keeps arcs in order, apart and inside the circle", () => {
    const [first, second, third] = getDonutSegments([1, 1, 2]);
    expect(first.offset + first.length).toBeLessThan(second.offset);
    expect(second.offset + second.length).toBeLessThan(third.offset);
    expect(third.offset + third.length).toBeLessThan(1);
    expect(third.length).toBeGreaterThan(first.length);
  });

  it("still draws a sliver smaller than the gap", () => {
    expect(getDonutSegments([1, 999])[0].length).toBeGreaterThan(0);
  });

  it("draws nothing for a value of zero, or when every value is zero", () => {
    expect(getDonutSegments([0, 5])[0].length).toBe(0);
    expect(getDonutSegments([0, 0]).map(({ length }) => length)).toEqual([
      0, 0,
    ]);
  });
});
