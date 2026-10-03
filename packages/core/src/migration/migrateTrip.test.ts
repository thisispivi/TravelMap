import { describe, expect, it } from "vitest";

import { isLegacyTrip, migrateTrip } from "./migrateTrip";

/**
 * Builds a legacy stop.
 * @param {string} cityId - The city
 * @param {string} sDate - Arrival
 * @param {string} eDate - Departure
 * @param {Record<string, unknown>} [extra] - Further legacy fields
 * @returns {Record<string, unknown>} The legacy stop
 */
function stop(
  cityId: string,
  sDate: string,
  eDate: string = sDate,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return { cityId, eDate, sDate, type: "stop", ...extra };
}

/**
 * Builds a legacy transport leg.
 * @param {string} fromId - Departure city
 * @param {string} toId - Arrival city
 * @param {Record<string, unknown>} [extra] - Further legacy fields
 * @returns {Record<string, unknown>} The legacy leg
 */
function leg(
  fromId: string,
  toId: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return { fromId, mode: "train", toId, type: "transport", ...extra };
}

const layover = { isLayover: true };

/* Kyoto as a base: a chained day trip, then a round-trip day trip. */
const japan = {
  eDate: "2024-08-27",
  id: "japan",
  originCityId: "Cagliari",
  returnCityId: "Cagliari",
  sDate: "2024-08-21",
  steps: [
    stop("Cagliari", "2024-08-21", "2024-08-21", layover),
    leg("Cagliari", "Kyoto", { mode: "plane" }),
    stop("Kyoto", "2024-08-21", "2024-08-27", { photoPath: "Japan/Kyoto/tr" }),
    leg("Kyoto", "Himeji"),
    stop("Himeji", "2024-08-23", "2024-08-23", {
      photoPath: "Japan/Himeji/tr",
    }),
    leg("Himeji", "Kobe"),
    stop("Kobe", "2024-08-23"),
    leg("Kobe", "Kyoto"),
    stop("Kyoto", "2024-08-23", "2024-08-23", layover),
    leg("Kyoto", "Nara", { roundTrip: true }),
    stop("Nara", "2024-08-24"),
    leg("Kyoto", "Cagliari", { mode: "plane" }),
    stop("Cagliari", "2024-08-27", "2024-08-27", layover),
  ],
  title: "Japan",
};

describe("migrateTrip", () => {
  it("recognises only the legacy format", () => {
    expect(isLegacyTrip(japan)).toBe(true);
    expect(isLegacyTrip(migrateTrip(japan).trip)).toBe(false);
  });

  it("turns a stop with nights into a stay and its excursions into day trips", () => {
    const { trip } = migrateTrip(japan);
    const [arrival, kyoto, home] = trip.steps;

    expect(arrival).toEqual({
      legs: [{ mode: "plane", toId: "Kyoto" }],
      type: "move",
    });
    expect(kyoto).toMatchObject({
      checkIn: "2024-08-21",
      checkOut: "2024-08-27",
      cityId: "Kyoto",
      photoPath: "Japan/Kyoto/tr",
      type: "stay",
    });
    expect(kyoto?.type === "stay" ? kyoto.outings : []).toEqual([
      {
        date: "2024-08-23",
        legs: [
          { mode: "train", photoPath: "Japan/Himeji/tr", toId: "Himeji" },
          { mode: "train", toId: "Kobe" },
          { mode: "train", toId: "Kyoto" },
        ],
      },
      {
        date: "2024-08-24",
        legs: [
          { mode: "train", toId: "Nara" },
          { mode: "train", toId: "Kyoto" },
        ],
      },
    ]);
    expect(home?.type).toBe("move");
  });

  it("keeps a place seen on the way as a visit and an airport as a stopover", () => {
    const { trip } = migrateTrip({
      ...japan,
      steps: [
        stop("Cagliari", "2024-08-18", "2024-08-18", layover),
        leg("Cagliari", "Rome", { mode: "plane" }),
        stop("Rome", "2024-08-18", "2024-08-18", layover),
        leg("Rome", "Matsumoto"),
        stop("Matsumoto", "2024-08-18", "2024-08-18", { photoPath: "m" }),
        leg("Matsumoto", "Takayama"),
        stop("Takayama", "2024-08-18", "2024-08-19"),
      ],
    });

    expect(trip.steps[0]).toEqual({
      legs: [
        { arrive: "2024-08-18", mode: "plane", toId: "Rome" },
        {
          arrive: "2024-08-18",
          mode: "train",
          photoPath: "m",
          toId: "Matsumoto",
          visited: true,
        },
        { mode: "train", toId: "Takayama" },
      ],
      type: "move",
    });
  });

  it("counts a night at a layover as a stay", () => {
    const { trip } = migrateTrip({
      ...japan,
      steps: [
        stop("Cagliari", "2026-10-23", "2026-10-23", layover),
        leg("Cagliari", "Milan", { mode: "plane" }),
        stop("Milan", "2026-10-23", "2026-10-24", layover),
      ],
    });

    expect(trip.steps[1]).toMatchObject({ cityId: "Milan", type: "stay" });
  });

  it("drops a layover date that contradicts the stay before it, and says so", () => {
    const { notes, trip } = migrateTrip({
      ...japan,
      steps: [
        stop("Cagliari", "2026-03-26", "2026-03-26", layover),
        leg("Cagliari", "Bucharest", { mode: "plane" }),
        stop("Bucharest", "2026-03-26", "2026-03-30"),
        leg("Bucharest", "Bergamo", { mode: "plane" }),
        stop("Bergamo", "2026-03-27", "2026-03-27", layover),
        leg("Bergamo", "Cagliari", { mode: "plane" }),
        stop("Cagliari", "2026-03-31", "2026-03-31", layover),
      ],
    });

    expect(trip.steps[2]).toEqual({
      legs: [
        { mode: "plane", toId: "Bergamo" },
        { arrive: "2026-03-31", mode: "plane", toId: "Cagliari" },
      ],
      type: "move",
    });
    expect(notes).toEqual([
      "Bergamo is dated 2026-03-27, before you left on 2026-03-30; dropped that date.",
    ]);
  });

  it("drops the legacy return city, which the last leg now answers", () => {
    expect(migrateTrip(japan).trip).not.toHaveProperty("returnCityId");
  });
});
