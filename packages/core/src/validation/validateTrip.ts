import type {
  CityJson,
  TripJson,
  TripStopJson,
  TripTransportJson,
} from "../schema";
import { parseLocalDate } from "../world/date";
import {
  deriveLegDistance,
  deriveTripDateRange,
  impliedSpeedKmh,
  isLegConsistent,
  stopAfter,
  stopBefore,
} from "../world/derive";
import type { Issue, IssueFix, IssueSeverity } from "./issues";

/**
 * Everything a trip needs resolving against to be checked.
 * @property {Map<string, CityJson>} cities - Every city in the dataset, by id
 * @property {Set<string>} photoKeys - Gallery manifest keys present on disk
 */
export interface TripValidationContext {
  cities: Map<string, CityJson>;
  photoKeys: Set<string>;
}

/* Above this an itinerary is describing something that did not happen. */
const IMPOSSIBLE_SPEED_KMH = 1000;

/**
 * Reports whether an authored date string can be parsed at all.
 * @param {string} [value] - The authored date
 * @returns {boolean} Whether the value parses as a local date
 */
function isParsableDate(value?: string): boolean {
  if (!value) return false;
  try {
    parseLocalDate(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Names a city for a message, degrading to the raw id when the reference is
 * the very thing that is broken.
 * @param {TripValidationContext} context - Resolution context
 * @param {string} id - The referenced city id
 * @returns {string} A human-readable label
 */
function cityLabel(context: TripValidationContext, id: string): string {
  return context.cities.get(id)?.name ?? (id || "—");
}

/**
 * Replaces one step without mutating the trip it belongs to.
 * @param {TripJson} trip - The trip to copy
 * @param {number} index - Position of the step to replace
 * @param {TripJson["steps"][number]} step - The replacement step
 * @returns {TripJson} A copy carrying the replacement
 */
function withStep(
  trip: TripJson,
  index: number,
  step: TripJson["steps"][number],
): TripJson {
  return {
    ...trip,
    steps: trip.steps.map((existing, position) =>
      position === index ? step : existing,
    ),
  };
}

/**
 * Removes one step without mutating the trip it belongs to.
 * @param {TripJson} trip - The trip to copy
 * @param {number} index - Position of the step to remove
 * @returns {TripJson} A copy without that step
 */
function withoutStep(trip: TripJson, index: number): TripJson {
  return {
    ...trip,
    steps: trip.steps.filter((_unused, position) => position !== index),
  };
}

/**
 * Checks one trip against every rule that does not need other trips.
 * Ordering is deliberate: reference and date problems that would stop the
 * public app from building are reported first, so a caller that only renders
 * the first few issues still shows the ones that matter.
 * @param {TripJson} trip - The trip to check
 * @param {TripValidationContext} context - Resolution context
 * @param {string} path - Dataset-relative path of the trip document
 * @returns {Issue[]} Every problem found, most severe first
 */
export function validateTrip(
  trip: TripJson,
  context: TripValidationContext,
  path: string,
): Issue[] {
  const issues: Issue[] = [];

  /**
   * Records one problem against this trip.
   * @param {string} code - Stable issue identifier
   * @param {IssueSeverity} severity - How badly it affects the site
   * @param {string} message - Untranslated fallback description
   * @param {number} [index] - Step position, when the issue is about a step
   * @param {Record<string, string | number>} [params] - Translation parameters
   * @param {IssueFix} [fix] - An available repair
   * @returns {void}
   */
  function report(
    code: string,
    severity: IssueSeverity,
    message: string,
    index?: number,
    params?: Record<string, string | number>,
    fix?: IssueFix,
  ): void {
    issues.push({
      code,
      fix,
      message,
      params,
      path,
      severity,
      subject:
        index === undefined
          ? { kind: "trip", tripId: trip.id }
          : { index, kind: "step", tripId: trip.id },
    });
  }

  if (!trip.title.trim())
    report("trip.titleRequired", "blocking", "The trip needs a title.");
  if (!isParsableDate(trip.sDate))
    report("trip.invalidStart", "blocking", "The trip start is not a date.");
  if (!isParsableDate(trip.eDate))
    report("trip.invalidEnd", "blocking", "The trip end is not a date.");
  if (
    isParsableDate(trip.sDate) &&
    isParsableDate(trip.eDate) &&
    trip.eDate < trip.sDate
  )
    report(
      "trip.endBeforeStart",
      "blocking",
      "The trip ends before it starts.",
    );
  if (!context.cities.has(trip.originCityId))
    report(
      "trip.unknownOrigin",
      "blocking",
      `The origin city "${trip.originCityId}" does not exist.`,
      undefined,
      { cityId: trip.originCityId },
    );
  if (!context.cities.has(trip.returnCityId))
    report(
      "trip.unknownReturn",
      "blocking",
      `The return city "${trip.returnCityId}" does not exist.`,
      undefined,
      { cityId: trip.returnCityId },
    );
  if (trip.mapFocus && !Number.isFinite(trip.mapFocus.zoom))
    report(
      "trip.invalidMapFocus",
      "blocking",
      "The map focus zoom is not a number.",
    );
  if (trip.coverImage && !trip.coverImage.startsWith("/"))
    report(
      "trip.coverImagePath",
      "warning",
      "Cover image paths are relative to the CDN and start with a slash.",
    );
  if (trip.steps.length === 0)
    report("trip.noSteps", "warning", "The trip has no itinerary yet.");

  const stopIndexes = trip.steps.flatMap((step, index) =>
    step.type === "stop" ? [index] : [],
  );
  const firstStop = trip.steps[stopIndexes[0] ?? -1];
  const lastStop = trip.steps[stopIndexes.at(-1) ?? -1];

  trip.steps.forEach((step, index) => {
    if (step.type === "stop") {
      validateStop(step, index);
      return;
    }
    validateLeg(step, index);
  });

  /**
   * Checks one stay.
   * @param {TripStopJson} step - The stop to check
   * @param {number} index - Position of the stop
   * @returns {void}
   */
  function validateStop(step: TripStopJson, index: number): void {
    const label = cityLabel(context, step.cityId);
    if (!context.cities.has(step.cityId))
      report(
        "stop.unknownCity",
        "blocking",
        `Stop ${index + 1} references the unknown city "${step.cityId}".`,
        index,
        { cityId: step.cityId, position: index + 1 },
      );
    if (!isParsableDate(step.sDate))
      report(
        "stop.invalidArrival",
        "blocking",
        `${label} has no valid arrival date.`,
        index,
        { city: label },
      );
    if (!isParsableDate(step.eDate))
      report(
        "stop.invalidDeparture",
        "blocking",
        `${label} has no valid departure date.`,
        index,
        { city: label },
      );
    if (
      isParsableDate(step.sDate) &&
      isParsableDate(step.eDate) &&
      step.eDate < step.sDate
    )
      report(
        "stop.endBeforeStart",
        "blocking",
        `${label} departs before it is reached.`,
        index,
        { city: label },
      );
    if (step.photoPath && !context.photoKeys.has(step.photoPath))
      report(
        "stop.missingGallery",
        "warning",
        `${label} references the missing gallery "${step.photoPath}".`,
        index,
        { city: label, photoPath: step.photoPath },
        {
          apply: (current) =>
            withStep(current, index, { ...step, photoPath: undefined }),
          label: "Remove the reference",
        },
      );

    const previous = stopBefore(trip.steps, index);
    if (previous?.cityId === step.cityId)
      report(
        "stop.duplicateConsecutive",
        "warning",
        `${label} is recorded twice in a row.`,
        index,
        { city: label },
      );
    if (
      isParsableDate(step.sDate) &&
      isParsableDate(trip.sDate) &&
      step.sDate < trip.sDate
    )
      report(
        "stop.beforeTripStart",
        "warning",
        `${label} starts before the trip does.`,
        index,
        { city: label },
        {
          apply: (current) => ({ ...current, sDate: step.sDate }),
          label: `Start the trip on ${step.sDate}`,
        },
      );
    if (
      isParsableDate(step.eDate) &&
      isParsableDate(trip.eDate) &&
      step.eDate > trip.eDate
    )
      report(
        "stop.afterTripEnd",
        "warning",
        `${label} ends after the trip does.`,
        index,
        { city: label },
        {
          apply: (current) => ({ ...current, eDate: step.eDate }),
          label: `End the trip on ${step.eDate}`,
        },
      );
    if (previous && previous.cityId !== step.cityId) {
      const between = trip.steps
        .slice(trip.steps.indexOf(previous) + 1, index)
        .some((candidate) => candidate.type === "transport");
      if (!between)
        report(
          "itinerary.missingLeg",
          "suggestion",
          `No transport is recorded between ${cityLabel(context, previous.cityId)} and ${label}.`,
          index,
          { from: cityLabel(context, previous.cityId), to: label },
        );
    }
  }

  /**
   * Checks one leg between two stops.
   * @param {TripTransportJson} step - The leg to check
   * @param {number} index - Position of the leg
   * @returns {void}
   */
  function validateLeg(step: TripTransportJson, index: number): void {
    const from = cityLabel(context, step.fromId);
    const to = cityLabel(context, step.toId);
    for (const [id, field] of [
      [step.fromId, "departure"],
      [step.toId, "arrival"],
    ] as const)
      if (!context.cities.has(id))
        report(
          "leg.unknownCity",
          "blocking",
          `Step ${index + 1} has an unknown ${field} city "${id}".`,
          index,
          { cityId: id, field, position: index + 1 },
        );
    for (const id of step.viaIds ?? [])
      if (!context.cities.has(id))
        report(
          "leg.unknownVia",
          "blocking",
          `Step ${index + 1} passes through the unknown city "${id}".`,
          index,
          { cityId: id, position: index + 1 },
        );
    if (step.sDate !== undefined && !isParsableDate(step.sDate))
      report(
        "leg.invalidDeparture",
        "blocking",
        `The ${from} departure is not a date.`,
        index,
        { from },
      );
    if (step.eDate !== undefined && !isParsableDate(step.eDate))
      report(
        "leg.invalidArrival",
        "blocking",
        `The ${to} arrival is not a date.`,
        index,
        { to },
      );
    if (
      isParsableDate(step.sDate) &&
      isParsableDate(step.eDate) &&
      step.eDate! < step.sDate!
    )
      report(
        "leg.arrivalBeforeDeparture",
        "blocking",
        `The leg to ${to} arrives before it departs.`,
        index,
        { to },
      );
    if (step.fromId && step.fromId === step.toId)
      report(
        "leg.identicalEndpoints",
        "warning",
        `This ${step.mode} leg starts and ends in ${from}.`,
        index,
        { city: from, mode: step.mode },
        {
          apply: (current) => withoutStep(current, index),
          label: "Remove the leg",
        },
      );
    if (!isLegConsistent(trip.steps, index)) {
      const expectedFrom = stopBefore(trip.steps, index)?.cityId ?? step.fromId;
      const expectedTo = stopAfter(trip.steps, index)?.cityId ?? step.toId;
      report(
        "leg.endpointMismatch",
        "warning",
        `This leg does not connect ${cityLabel(context, expectedFrom)} to ${cityLabel(context, expectedTo)}.`,
        index,
        {
          from: cityLabel(context, expectedFrom),
          to: cityLabel(context, expectedTo),
        },
        {
          apply: (current) =>
            withStep(current, index, {
              ...step,
              fromId: expectedFrom,
              toId: expectedTo,
            }),
          label: "Reconnect to the surrounding stops",
        },
      );
    }
    if (step.flight && step.mode !== "plane")
      report(
        "leg.flightOnNonFlight",
        "warning",
        `Flight details are recorded on a ${step.mode} leg.`,
        index,
        { mode: step.mode },
        {
          apply: (current) =>
            withStep(current, index, { ...step, flight: undefined }),
          label: "Remove the flight details",
        },
      );
    if (step.ferry && step.mode !== "ferry")
      report(
        "leg.ferryOnNonFerry",
        "warning",
        `Ferry details are recorded on a ${step.mode} leg.`,
        index,
        { mode: step.mode },
        {
          apply: (current) =>
            withStep(current, index, { ...step, ferry: undefined }),
          label: "Remove the ferry details",
        },
      );

    const fromCity = context.cities.get(step.fromId);
    const toCity = context.cities.get(step.toId);
    if (fromCity && toCity && step.durationMinutes) {
      const distance =
        step.distanceInKm ??
        deriveLegDistance(fromCity.coordinates, toCity.coordinates);
      if (
        impliedSpeedKmh(distance, step.durationMinutes) > IMPOSSIBLE_SPEED_KMH
      )
        report(
          "leg.impossibleSpeed",
          "warning",
          `${from} to ${to} in ${step.durationMinutes} minutes is faster than any of these modes travel.`,
          index,
          { from, minutes: step.durationMinutes, to },
        );
    }
  }

  if (
    firstStop?.type === "stop" &&
    context.cities.has(trip.originCityId) &&
    firstStop.cityId !== trip.originCityId
  )
    report(
      "trip.originMismatch",
      "suggestion",
      `The trip starts in ${cityLabel(context, firstStop.cityId)} but its origin is ${cityLabel(context, trip.originCityId)}.`,
      undefined,
      { origin: cityLabel(context, trip.originCityId) },
      {
        apply: (current) => ({
          ...current,
          originCityId: firstStop.cityId,
        }),
        label: "Use the first stop as the origin",
      },
    );
  if (
    lastStop?.type === "stop" &&
    context.cities.has(trip.returnCityId) &&
    lastStop.cityId !== trip.returnCityId
  )
    report(
      "trip.returnMismatch",
      "suggestion",
      `The trip ends in ${cityLabel(context, lastStop.cityId)} but its return is ${cityLabel(context, trip.returnCityId)}.`,
      undefined,
      { return: cityLabel(context, trip.returnCityId) },
      {
        apply: (current) => ({
          ...current,
          returnCityId: lastStop.cityId,
        }),
        label: "Use the last stop as the return",
      },
    );

  const derived = deriveTripDateRange(trip.steps);
  if (stopIndexes.length === 0 && trip.steps.length > 0)
    report(
      "trip.noDatedStops",
      "suggestion",
      "The trip has legs but no stays, so it has no dates of its own.",
    );
  if (
    derived.sDate &&
    derived.eDate &&
    isParsableDate(trip.sDate) &&
    isParsableDate(trip.eDate) &&
    (derived.sDate !== trip.sDate || derived.eDate !== trip.eDate) &&
    derived.sDate >= trip.sDate &&
    derived.eDate <= trip.eDate
  )
    report(
      "trip.rangeLooserThanStops",
      "suggestion",
      `The stops only cover ${derived.sDate} to ${derived.eDate}.`,
      undefined,
      { eDate: derived.eDate, sDate: derived.sDate },
      {
        apply: (current) => ({
          ...current,
          eDate: derived.eDate!,
          sDate: derived.sDate!,
        }),
        label: "Match the trip dates to its stops",
      },
    );

  const order: Record<IssueSeverity, number> = {
    blocking: 0,
    suggestion: 2,
    warning: 1,
  };
  return issues.toSorted(
    (first, second) => order[first.severity] - order[second.severity],
  );
}
