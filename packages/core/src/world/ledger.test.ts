import assert from "node:assert/strict";

import type { City } from "../classes/City.ts";
import type { Trip, TripRouteStep } from "../classes/Trip.ts";
import { toLedgerEntry } from "./ledger.ts";

/**
 * Builds a stand-in city. Only the fields the ledger reads are needed, and the
 * real class pulls in the app's bundler environment, so the test supplies the
 * shape rather than constructing one.
 * @param {string} id - The city id
 * @param {[number, number]} coordinates - Its longitude and latitude
 * @returns {City} A city the ledger can measure
 */
function city(id: string, coordinates: [number, number]): City {
  return { id, name: id, coordinates } as unknown as City;
}

/**
 * Builds a stand-in trip carrying nothing but the steps under test.
 * @param {TripRouteStep[]} steps - The route steps to account for
 * @returns {Trip} A trip the ledger can measure
 */
function trip(steps: TripRouteStep[]): Trip {
  return { id: "t", steps } as unknown as Trip;
}

const rome = city("Rome", [12.5, 41.9]);
const tokyo = city("Tokyo", [139.7, 35.7]);

/**
 * Checks that every hour a journey took is attributed to either moving or being
 * somewhere, and that the two kinds of duration the dataset cannot state are
 * reported as estimated rather than passed off as measured.
 * @returns {void}
 */
function run(): void {
  const entry = toLedgerEntry(
    trip([
      {
        type: "stop",
        city: rome,
        sDate: new Date("2024-08-10"),
        eDate: new Date("2024-08-10"),
        isLayover: true,
      },
      {
        type: "transport",
        mode: "plane",
        from: rome,
        to: tokyo,
        durationMinutes: 750,
      },
      {
        type: "stop",
        city: tokyo,
        sDate: new Date("2024-08-10"),
        eDate: new Date("2024-08-15"),
      },
      {
        type: "transport",
        mode: "plane",
        from: tokyo,
        to: rome,
      },
      {
        type: "stop",
        city: rome,
        sDate: new Date("2024-08-16"),
        eDate: new Date("2024-08-16"),
      },
    ]),
  );

  const [layover, outbound, stay, ret, dayVisit] = entry.spans;

  assert.equal(entry.spans.length, 5);

  /* A same-day stop has no authored length: a layover and a day visit get
     different nominal lengths, and both must admit they are estimates. */
  assert.equal(layover.minutes, 90);
  assert.equal(layover.isEstimated, true);
  assert.equal(dayVisit.minutes, 480);
  assert.equal(dayVisit.isEstimated, true);

  /* A multi-day stop is measured from its dates and is not an estimate. */
  assert.equal(stay.minutes, 5 * 24 * 60);
  assert.equal(stay.isEstimated, false);

  /* An authored duration is used as authored; a missing one is derived from
     the great-circle distance and reported as an estimate. */
  assert.equal(outbound.minutes, 750);
  assert.equal(outbound.isEstimated, false);
  assert.equal(ret.isEstimated, true);
  assert.ok(ret.minutes > 0);

  /* Nothing may be lost or double-counted: the totals are exactly the spans. */
  assert.equal(entry.minutesInMotion, outbound.minutes + ret.minutes);
  assert.equal(entry.minutesAtRest, 90 + 5 * 24 * 60 + 480);
  assert.ok(entry.distanceKm > 9000 && entry.distanceKm < 20000);

  /* Both legs cover the same pair of cities, so the distance is symmetric. */
  assert.equal(
    outbound.kind === "passage" && ret.kind === "passage"
      ? outbound.distanceKm
      : -1,
    ret.kind === "passage" ? ret.distanceKm : -2,
  );

  console.log("ledger: ok");
}

run();
