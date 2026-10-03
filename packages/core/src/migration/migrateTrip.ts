import { omit } from "remeda";
import { z } from "zod";

import type { TripJson, TripLegJson, TripStayJson } from "../schema/index.ts";
import { TripJsonSchema, TripLegJsonSchema } from "../schema/index.ts";
import { daysBetween } from "../world/date.ts";

/*
 * The flat stop/transport format trips were stored in before stays, moves and
 * day trips existed. Frozen here so a fork still holding old files can convert
 * them; nothing else reads it.
 */
const LegacyStopSchema = z.looseObject({
  cityId: z.string(),
  eDate: z.string(),
  isLayover: z.boolean().optional(),
  photoPath: z.string().optional(),
  rowConstraints: z
    .strictObject({
      maxPhotos: z.number().optional(),
      minPhotos: z.number().optional(),
    })
    .optional(),
  sDate: z.string(),
  targetRowHeight: z.number().optional(),
  type: z.literal("stop"),
});

const LegacyLegSchema = z.looseObject({
  distanceInKm: z.number().optional(),
  durationMinutes: z.number().optional(),
  eDate: z.string().optional(),
  ferry: TripLegJsonSchema.shape.ferry,
  flight: TripLegJsonSchema.shape.flight,
  fromId: z.string(),
  mode: TripLegJsonSchema.shape.mode,
  roundTrip: z.boolean().optional(),
  sDate: z.string().optional(),
  toId: z.string(),
  type: z.literal("transport"),
  viaIds: z.array(z.string()).optional(),
});

const LegacyTripSchema = z.looseObject({
  originCityId: z.string(),
  steps: z.array(
    z.discriminatedUnion("type", [LegacyStopSchema, LegacyLegSchema]),
  ),
});

/** A stop in the legacy format. */
type LegacyStop = z.infer<typeof LegacyStopSchema>;

/** A transport leg in the legacy format. */
type LegacyLeg = z.infer<typeof LegacyLegSchema>;

/**
 * A converted trip and everything the conversion was unsure about.
 * @property {TripJson} trip - The trip in the stays-and-moves format
 * @property {string[]} notes - Plain-English doubts for the author to check
 */
export interface MigratedTrip {
  trip: TripJson;
  notes: string[];
}

/**
 * Reports whether a document is still in the legacy flat format.
 * @param {unknown} value - A parsed trip document
 * @returns {boolean} Whether it needs migrating
 */
export function isLegacyTrip(value: unknown): boolean {
  return LegacyTripSchema.safeParse(value).success;
}

/**
 * Counts the nights a legacy stop spans.
 * @param {LegacyStop} stop - The stop
 * @returns {number} Nights between arrival and departure
 */
function nightsAt(stop: LegacyStop): number {
  return daysBetween(stop.sDate, stop.eDate);
}

/**
 * Converts a legacy leg into the new shape, minus its departure city.
 * @param {LegacyLeg} leg - The legacy leg
 * @returns {TripLegJson} The new leg
 */
function toLeg(leg: LegacyLeg): TripLegJson {
  return {
    mode: leg.mode,
    toId: leg.toId,
    ...(leg.sDate ? { depart: leg.sDate } : {}),
    ...(leg.eDate ? { arrive: leg.eDate } : {}),
    ...(leg.viaIds ? { viaIds: leg.viaIds } : {}),
    ...(leg.distanceInKm !== undefined
      ? { distanceInKm: leg.distanceInKm }
      : {}),
    ...(leg.durationMinutes !== undefined
      ? { durationMinutes: leg.durationMinutes }
      : {}),
    ...(leg.flight ? { flight: leg.flight } : {}),
    ...(leg.ferry ? { ferry: leg.ferry } : {}),
  };
}

/**
 * Carries what a legacy stop knew about a place onto the leg that reached it.
 * @param {TripLegJson} leg - The leg arriving at the stop
 * @param {LegacyStop} stop - The stop
 * @returns {TripLegJson} The leg with the stop's photos attached
 */
function withStopMedia(leg: TripLegJson, stop: LegacyStop): TripLegJson {
  return {
    ...leg,
    ...(stop.photoPath ? { photoPath: stop.photoPath } : {}),
    ...(stop.rowConstraints ? { rowConstraints: stop.rowConstraints } : {}),
    ...(stop.targetRowHeight ? { targetRowHeight: stop.targetRowHeight } : {}),
  };
}

/**
 * Converts one legacy trip into stays, moves and day trips.
 *
 * Stops with at least one night become stays — layover or not, because a
 * night in Milan is still a night in Milan. A run of legs that leaves a stay
 * and comes back to it without a night elsewhere becomes a day trip; anything
 * else between two stays becomes a move. Legacy round-trip legs are unrolled
 * into an outbound and a return leg first.
 * @param {unknown} raw - A legacy trip document
 * @returns {MigratedTrip} The converted trip and the conversion's doubts
 */
export function migrateTrip(raw: unknown): MigratedTrip {
  const legacy = LegacyTripSchema.parse(raw);
  const notes: string[] = [];
  const pairs: { leg: LegacyLeg; stop: LegacyStop }[] = [];

  const [first, ...rest] = legacy.steps;
  if (first?.type !== "stop")
    throw new Error("A legacy trip starts with a stop.");
  if (first.cityId !== legacy.originCityId)
    notes.push(
      `Starts at ${first.cityId} but its origin was ${legacy.originCityId}; kept the origin.`,
    );

  for (let position = 0; position < rest.length; position += 2) {
    const leg = rest[position];
    const stop = rest[position + 1];
    if (leg?.type !== "transport" || stop?.type !== "stop")
      throw new Error(`Step ${position + 2} breaks the stop/leg alternation.`);
    pairs.push({ leg: { ...leg, roundTrip: undefined }, stop });
    if (leg.roundTrip) {
      pairs.push({
        leg: {
          ...leg,
          eDate: undefined,
          fromId: stop.cityId,
          roundTrip: undefined,
          sDate: undefined,
          toId: leg.fromId,
        },
        stop: {
          cityId: leg.fromId,
          eDate: stop.sDate.slice(0, 10),
          isLayover: true,
          sDate: stop.sDate.slice(0, 10),
          type: "stop",
        },
      });
    }
  }

  const steps: TripJson["steps"] = [];
  let stay: TripStayJson | undefined =
    nightsAt(first) > 0
      ? {
          checkIn: first.sDate.slice(0, 10),
          checkOut: first.eDate.slice(0, 10),
          cityId: first.cityId,
          type: "stay",
        }
      : undefined;
  if (stay) steps.push(stay);
  let cursor = first.eDate.slice(0, 10);
  let buffer: { leg: LegacyLeg; stop: LegacyStop }[] = [];

  /**
   * Turns the buffered legs into a move, dating each from its arrival stop
   * when that date is believable.
   * @returns {void}
   */
  const flushMove = (): void => {
    if (buffer.length === 0) return;
    const firstDeparture = buffer[0]?.leg.sDate?.slice(0, 10);
    if (stay && firstDeparture && firstDeparture > stay.checkOut) {
      notes.push(
        `Stay in ${stay.cityId} ended ${stay.checkOut} but the next journey left ${firstDeparture}; extended the stay.`,
      );
      stay.checkOut = firstDeparture;
      cursor = firstDeparture;
    }
    const legs = buffer.map(({ leg, stop }, index) => {
      let next = toLeg(leg);
      if (next.depart && next.depart.slice(0, 10) < cursor) {
        notes.push(
          `The ride to ${leg.toId} is dated ${next.depart.slice(0, 10)}, before ${cursor}; dropped its dates.`,
        );
        next = omit(next, ["arrive", "depart"]);
      }
      const endsAtStay = index === buffer.length - 1 && nightsAt(stop) > 0;
      const arrival = stop.sDate;
      if (!endsAtStay) {
        if (!stop.isLayover) next = { ...next, visited: true };
        next = withStopMedia(next, stop);
      }
      if (!next.arrive && (!endsAtStay || arrival.includes("T"))) {
        if (arrival.slice(0, 10) >= cursor) next = { ...next, arrive: arrival };
        else
          notes.push(
            `${stop.cityId} is dated ${arrival.slice(0, 10)}, before you left on ${cursor}; dropped that date.`,
          );
      }
      if (next.arrive) cursor = next.arrive.slice(0, 10);
      return next;
    });
    steps.push({ legs, type: "move" });
    buffer = [];
  };

  for (const pair of pairs) {
    buffer.push(pair);
    const { stop } = pair;
    if (nightsAt(stop) > 0) {
      flushMove();
      stay = {
        checkIn: stop.sDate.slice(0, 10),
        checkOut: stop.eDate.slice(0, 10),
        cityId: stop.cityId,
        ...(stop.photoPath ? { photoPath: stop.photoPath } : {}),
        ...(stop.rowConstraints ? { rowConstraints: stop.rowConstraints } : {}),
        ...(stop.targetRowHeight
          ? { targetRowHeight: stop.targetRowHeight }
          : {}),
        type: "stay",
      };
      steps.push(stay);
      cursor = stay.checkOut;
      continue;
    }

    if (stay && stop.cityId === stay.cityId) {
      const places = buffer.slice(0, -1);
      const dates = new Set(
        (places.length > 0 ? places : buffer).map(({ stop: seen }) =>
          seen.sDate.slice(0, 10),
        ),
      );
      const date = [...dates].toSorted()[0]!;
      if (dates.size > 1)
        notes.push(
          `A day trip from ${stay.cityId} spans ${[...dates].join(", ")}; filed it under ${date}.`,
        );
      if (date < stay.checkIn || date > stay.checkOut)
        notes.push(
          `The day trip on ${date} falls outside the stay in ${stay.cityId} (${stay.checkIn} to ${stay.checkOut}).`,
        );
      stay.outings = [
        ...(stay.outings ?? []),
        {
          date,
          legs: buffer.map(({ leg, stop: seen }, index) => {
            /* A bare date on a day-trip leg only repeats the day trip's date. */
            const timed = toLeg({
              ...leg,
              eDate: leg.eDate?.includes("T") ? leg.eDate : undefined,
              sDate: leg.sDate?.includes("T") ? leg.sDate : undefined,
            });
            return index === buffer.length - 1
              ? timed
              : withStopMedia(timed, seen);
          }),
        },
      ];
      buffer = [];
    }
  }
  flushMove();

  return {
    notes,
    trip: TripJsonSchema.parse({
      ...omit(legacy, ["returnCityId", "steps"]),
      steps,
    }),
  };
}
