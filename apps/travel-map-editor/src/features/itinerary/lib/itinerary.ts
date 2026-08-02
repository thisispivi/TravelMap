import {
  deriveTripDateRange,
  guessTransportMode,
  realignLeg,
  TripJson,
  TripStopJson,
  TripTransportJson,
} from "@travelmap/core";

import { derivedDistanceKm } from "../../routes/lib/legDerivation";

/** One element of a trip's ordered itinerary, either a stay or a leg. */
export type Step = TripJson["steps"][number];

/**
 * Rebuilds every leg's endpoints from the stops surrounding it. Called after
 * any structural change so the itinerary can never drift into the state the
 * previous editor shipped, where a leg claimed to run from a city to itself.
 * @param {TripJson} trip - The trip to realign
 * @returns {TripJson} A copy with consistent legs
 */
export function realignLegs(trip: TripJson): TripJson {
  return {
    ...trip,
    steps: trip.steps.map((step, index) =>
      step.type === "transport" ? realignLeg(step, trip.steps, index) : step,
    ),
  };
}

/**
 * Widens the trip's own dates to cover every stop it contains.
 * @param {TripJson} trip - The trip to adjust
 * @returns {TripJson} A copy whose range covers its stops
 */
export function coverStopDates(trip: TripJson): TripJson {
  const derived = deriveTripDateRange(trip.steps);
  if (!derived.sDate || !derived.eDate) return trip;
  return {
    ...trip,
    eDate:
      trip.eDate && trip.eDate > derived.eDate ? trip.eDate : derived.eDate,
    sDate:
      trip.sDate && trip.sDate < derived.sDate ? trip.sDate : derived.sDate,
  };
}

/**
 * Keeps the stored origin and return in step with the itinerary's own ends.
 * Both fields stay in the JSON because the public app reads them, but the
 * author never has to maintain them by hand.
 * @param {TripJson} trip - The trip to adjust
 * @returns {TripJson} A copy whose endpoints match its first and last stop
 */
export function deriveEndpoints(trip: TripJson): TripJson {
  const stops = trip.steps.filter(
    (step): step is TripStopJson => step.type === "stop",
  );
  const first = stops.at(0);
  const last = stops.at(-1);
  if (!first || !last) return trip;
  return {
    ...trip,
    originCityId: first.cityId,
    returnCityId: last.cityId,
  };
}

/**
 * Applies every structural derivation in the order they depend on each other.
 * @param {TripJson} trip - The trip to normalise
 * @returns {TripJson} A consistent copy
 */
export function normalizeTrip(trip: TripJson): TripJson {
  return deriveEndpoints(coverStopDates(realignLegs(trip)));
}

/**
 * Finds the last stop in an itinerary, which is where a new leg departs from.
 * @param {Step[]} steps - Ordered itinerary steps
 * @returns {TripStopJson | undefined} The final stay, when there is one
 */
function lastStop(steps: Step[]): TripStopJson | undefined {
  return steps.findLast((step): step is TripStopJson => step.type === "stop");
}

/**
 * Adds a stay, and the leg that reaches it.
 * The leg is materialised rather than asked for: two consecutive stays always
 * imply a journey, and making the author create it separately is what produced
 * legs pointing at their own origin in the previous editor.
 * @param {TripJson} trip - The trip to extend
 * @param {string} cityId - The city being visited
 * @param {Map<string, [number, number]>} coordinatesById - City coordinates
 * @param {string} [sDate] - Arrival date, defaulting to the previous departure
 * @returns {TripJson} A copy carrying the new stop and its leg
 */
export function addStop(
  trip: TripJson,
  cityId: string,
  coordinatesById: Map<string, [number, number]>,
  sDate?: string,
): TripJson {
  const previous = lastStop(trip.steps);
  const arrival = sDate ?? previous?.eDate ?? trip.sDate;
  const stop: TripStopJson = {
    type: "stop",
    cityId,
    eDate: arrival,
    sDate: arrival,
  };
  const steps: Step[] = [...trip.steps];

  if (previous && previous.cityId !== cityId) {
    const distance = derivedDistanceKm(
      previous.cityId,
      cityId,
      coordinatesById,
    );
    steps.push({
      type: "transport",
      fromId: previous.cityId,
      mode: guessTransportMode(distance ?? 0),
      toId: cityId,
    });
  }
  steps.push(stop);

  return normalizeTrip({ ...trip, steps });
}

/**
 * Adds a leg on its own, for the rare itinerary that needs one between stays
 * the author has not recorded yet.
 * @param {TripJson} trip - The trip to extend
 * @param {number} index - Position to insert at
 * @returns {TripJson} A copy carrying the new leg
 */
export function addLeg(trip: TripJson, index: number): TripJson {
  const anchor = lastStop(trip.steps)?.cityId ?? trip.originCityId;
  const leg: TripTransportJson = {
    type: "transport",
    fromId: anchor,
    mode: "train",
    toId: anchor,
  };
  return realignLegs({
    ...trip,
    steps: trip.steps.toSpliced(index, 0, leg),
  });
}

/**
 * Replaces one step in place, leaving the rest of the itinerary alone.
 * @param {TripJson} trip - The trip to edit
 * @param {number} index - Position of the step
 * @param {Step} step - The replacement step
 * @returns {TripJson} A copy carrying the replacement
 */
export function replaceStep(
  trip: TripJson,
  index: number,
  step: Step,
): TripJson {
  return {
    ...trip,
    steps: trip.steps.map((existing, position) =>
      position === index ? step : existing,
    ),
  };
}

/**
 * Removes a step and re-derives everything that depended on its position.
 * @param {TripJson} trip - The trip to edit
 * @param {number} index - Position of the step
 * @returns {TripJson} A copy without that step
 */
export function removeStep(trip: TripJson, index: number): TripJson {
  return normalizeTrip({
    ...trip,
    steps: trip.steps.filter((_unused, position) => position !== index),
  });
}

/**
 * Moves a step to another position, then realigns the legs it passed.
 * @param {TripJson} trip - The trip to edit
 * @param {number} from - Current position
 * @param {number} to - Destination position
 * @returns {TripJson} A copy with the step moved
 */
export function moveStep(trip: TripJson, from: number, to: number): TripJson {
  const step = trip.steps[from];
  if (!step || to < 0 || to >= trip.steps.length || from === to) return trip;
  return normalizeTrip({
    ...trip,
    steps: trip.steps.toSpliced(from, 1).toSpliced(to, 0, step),
  });
}

/**
 * Reorders the itinerary by the dates the author gave its stays, for the case
 * where places were added in the order they were remembered rather than the
 * order they were visited. Undated stops keep their relative position.
 * @param {TripJson} trip - The trip to reorder
 * @returns {TripJson} A copy sorted by stop date
 */
export function sortByDate(trip: TripJson): TripJson {
  const stops = trip.steps
    .filter((step): step is TripStopJson => step.type === "stop")
    .toSorted((first, second) => first.sDate.localeCompare(second.sDate));
  const legs = trip.steps.filter(
    (step): step is TripTransportJson => step.type === "transport",
  );
  const steps: Step[] = [];

  stops.forEach((stop, position) => {
    if (position > 0) {
      const leg = legs.shift();
      if (leg) steps.push(leg);
    }
    steps.push(stop);
  });

  return normalizeTrip({ ...trip, steps: [...steps, ...legs] });
}

/**
 * Duplicates a step directly after the original.
 * @param {TripJson} trip - The trip to edit
 * @param {number} index - Position of the step to duplicate
 * @returns {TripJson} A copy carrying the duplicate
 */
export function duplicateStep(trip: TripJson, index: number): TripJson {
  const step = trip.steps[index];
  if (!step) return trip;
  return normalizeTrip({
    ...trip,
    steps: trip.steps.toSpliced(index + 1, 0, { ...step }),
  });
}

/**
 * Shifts a date by whole days without letting a timezone offset move it.
 * @param {string} value - The authored date
 * @param {number} days - Days to add, negative to subtract
 * @returns {string} The shifted date, unchanged when unparseable
 */
function shiftDate(value: string, days: number): string {
  const [datePart, timePart] = value.split("T");
  const parsed = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  parsed.setDate(parsed.getDate() + days);
  const shifted = [
    parsed.getFullYear(),
    parsed.getMonth() + 1,
    parsed.getDate(),
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
  return timePart ? `${shifted}T${timePart}` : shifted;
}

/**
 * Moves several steps in time at once, for the trip recorded a week off.
 * @param {TripJson} trip - The trip to edit
 * @param {number[]} indexes - Steps to shift
 * @param {number} days - Days to add, negative to subtract
 * @returns {TripJson} A copy with those steps shifted
 */
export function shiftStepDates(
  trip: TripJson,
  indexes: number[],
  days: number,
): TripJson {
  return normalizeTrip({
    ...trip,
    steps: trip.steps.map((step, index) => {
      if (!indexes.includes(index)) return step;
      if (step.type === "stop")
        return {
          ...step,
          eDate: shiftDate(step.eDate, days),
          sDate: shiftDate(step.sDate, days),
        };
      return {
        ...step,
        eDate: step.eDate ? shiftDate(step.eDate, days) : step.eDate,
        sDate: step.sDate ? shiftDate(step.sDate, days) : step.sDate,
      };
    }),
  });
}

/**
 * Sets one transport mode across several legs at once.
 * @param {TripJson} trip - The trip to edit
 * @param {number[]} indexes - Steps to change, non-legs are ignored
 * @param {TripTransportJson["mode"]} mode - The mode to apply
 * @returns {TripJson} A copy with those legs changed
 */
export function setLegMode(
  trip: TripJson,
  indexes: number[],
  mode: TripTransportJson["mode"],
): TripJson {
  return {
    ...trip,
    steps: trip.steps.map((step, index) =>
      indexes.includes(index) && step.type === "transport"
        ? { ...step, mode }
        : step,
    ),
  };
}

/**
 * Removes several steps at once, as one undoable edit.
 * @param {TripJson} trip - The trip to edit
 * @param {number[]} indexes - Steps to remove
 * @returns {TripJson} A copy without those steps
 */
export function removeSteps(trip: TripJson, indexes: number[]): TripJson {
  return normalizeTrip({
    ...trip,
    steps: trip.steps.filter((_step, index) => !indexes.includes(index)),
  });
}

/**
 * Merges a stop into the one before it, keeping the wider date range and
 * dropping the leg that used to sit between them.
 * @param {TripJson} trip - The trip to edit
 * @param {number} index - The later of the two stops
 * @returns {TripJson} A copy with the pair merged
 */
export function mergeWithPreviousStop(trip: TripJson, index: number): TripJson {
  const step = trip.steps[index];
  if (step?.type !== "stop") return trip;
  const previousIndex = trip.steps.findLastIndex(
    (candidate, position) => position < index && candidate.type === "stop",
  );
  const previous = trip.steps[previousIndex];
  if (!previous || previous.type !== "stop") return trip;

  const merged: TripStopJson = {
    ...previous,
    eDate: step.eDate > previous.eDate ? step.eDate : previous.eDate,
    photoPath: previous.photoPath ?? step.photoPath,
    sDate: step.sDate < previous.sDate ? step.sDate : previous.sDate,
  };
  return normalizeTrip({
    ...trip,
    steps: trip.steps
      .map((candidate, position) =>
        position === previousIndex ? merged : candidate,
      )
      .filter((_candidate, position) => {
        if (position === index) return false;
        return !(position > previousIndex && position < index);
      }),
  });
}
