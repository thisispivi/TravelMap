import type {
  CityJson,
  TripJson,
  TripLegJson,
  TripStayJson,
  TripStepJson,
} from "../schema";
import { parseLocalDate, zonedDurationMinutes } from "../world/date";
import {
  deriveLegDistance,
  deriveTripDateRange,
  impliedSpeedKmh,
  LocatedLeg,
  walkTripLegs,
} from "../world/derive";
import type { Issue, IssueFix, IssueSeverity, IssueSubject } from "./issues";

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
 * Replaces one step without mutating the trip it belongs to.
 * @param {TripJson} trip - The trip to copy
 * @param {number} index - Position of the step to replace
 * @param {(step: TripStepJson) => TripStepJson} change - Builds the replacement
 * @returns {TripJson} A copy carrying the replacement
 */
function withStep(
  trip: TripJson,
  index: number,
  change: (step: TripStepJson) => TripStepJson,
): TripJson {
  return {
    ...trip,
    steps: trip.steps.map((step, position) =>
      position === index ? change(step) : step,
    ),
  };
}

/**
 * Replaces one leg wherever it lives — in a move or in a stay's day trip.
 * @param {TripJson} trip - The trip to copy
 * @param {LocatedLeg} at - Where the leg is
 * @param {(leg: TripLegJson) => TripLegJson | null} change - The replacement, or null to remove it
 * @returns {TripJson} A copy carrying the change
 */
function withLeg(
  trip: TripJson,
  at: Pick<LocatedLeg, "index" | "legIndex" | "outing">,
  change: (leg: TripLegJson) => TripLegJson | null,
): TripJson {
  /**
   * Applies the change to one chain.
   * @param {TripLegJson[]} legs - The chain
   * @returns {TripLegJson[]} The changed chain
   */
  const apply = (legs: TripLegJson[]): TripLegJson[] =>
    legs.flatMap((leg, position) => {
      if (position !== at.legIndex) return [leg];
      const next = change(leg);
      return next ? [next] : [];
    });

  return withStep(trip, at.index, (step) =>
    step.type === "move"
      ? { ...step, legs: apply(step.legs) }
      : {
          ...step,
          outings: step.outings?.map((outing, position) =>
            position === at.outing
              ? { ...outing, legs: apply(outing.legs) }
              : outing,
          ),
        },
  );
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
   * Names a city for a message, degrading to the raw id when the reference is
   * the very thing that is broken.
   * @param {string} id - The referenced city id
   * @returns {string} A human-readable label
   */
  const label = (id: string): string =>
    context.cities.get(id)?.name ?? (id || "—");

  /**
   * Records one problem against this trip.
   * @param {string} code - Stable issue identifier
   * @param {IssueSeverity} severity - How badly it affects the site
   * @param {string} message - Untranslated fallback description
   * @param {Omit<Extract<IssueSubject, { kind: "step" }>, "kind" | "tripId">} [at] - The step, day trip, and leg it is about
   * @param {Record<string, string | number>} [params] - Translation parameters
   * @param {IssueFix} [fix] - An available repair
   * @returns {void}
   */
  function report(
    code: string,
    severity: IssueSeverity,
    message: string,
    at?: Omit<Extract<IssueSubject, { kind: "step" }>, "kind" | "tripId">,
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
      subject: at
        ? { ...at, kind: "step", tripId: trip.id }
        : { kind: "trip", tripId: trip.id },
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
      `The starting city "${trip.originCityId}" does not exist.`,
      undefined,
      { cityId: trip.originCityId },
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

  let here = trip.originCityId;
  let previousStay: TripStayJson | undefined;
  trip.steps.forEach((step, index) => {
    const previous = trip.steps[index - 1];
    if (step.type === "move") {
      if (previous?.type === "move")
        report(
          "move.consecutive",
          "suggestion",
          "Two journeys follow each other with no stay between them.",
          { index },
          undefined,
          {
            apply: (current) => ({
              ...current,
              steps: current.steps.flatMap((candidate, position) => {
                if (position === index) return [];
                if (position !== index - 1 || candidate.type !== "move")
                  return [candidate];
                return [
                  { ...candidate, legs: [...candidate.legs, ...step.legs] },
                ];
              }),
            }),
            label: "Join them into one journey",
          },
        );
      here = step.legs.at(-1)?.toId ?? here;
      return;
    }

    validateStay(step, index, here);
    if (previous?.type === "stay")
      report(
        "stay.noMoveBetween",
        "warning",
        `Nothing records how you got from ${label(previous.cityId)} to ${label(step.cityId)}.`,
        { index },
        { from: label(previous.cityId), to: label(step.cityId) },
      );
    if (previousStay && step.checkIn < previousStay.checkOut)
      report(
        "stay.overlap",
        "warning",
        `${label(step.cityId)} starts before you left ${label(previousStay.cityId)}.`,
        { index },
        { city: label(step.cityId), previous: label(previousStay.cityId) },
      );
    previousStay = step;
    here = step.cityId;
  });

  /**
   * Checks one stay and the day trips taken from it.
   * @param {TripStayJson} stay - The stay to check
   * @param {number} index - Position of the stay
   * @param {string} arrivedAt - Where the previous move left the traveller
   * @returns {void}
   */
  function validateStay(
    stay: TripStayJson,
    index: number,
    arrivedAt: string,
  ): void {
    const city = label(stay.cityId);
    if (!context.cities.has(stay.cityId))
      report(
        "stay.unknownCity",
        "blocking",
        `Stay ${index + 1} references the unknown city "${stay.cityId}".`,
        { index },
        { cityId: stay.cityId, position: index + 1 },
      );
    if (stay.checkOut < stay.checkIn)
      report(
        "stay.endBeforeStart",
        "blocking",
        `You leave ${city} before you arrive.`,
        { index },
        { city },
      );
    if (stay.photoPath && !context.photoKeys.has(stay.photoPath))
      report(
        "stay.missingGallery",
        "warning",
        `${city} points at the missing gallery "${stay.photoPath}".`,
        { index },
        { city, photoPath: stay.photoPath },
        {
          apply: (current) =>
            withStep(current, index, (step) => ({
              ...step,
              photoPath: undefined,
            })),
          label: "Remove the reference",
        },
      );
    if (arrivedAt !== stay.cityId && context.cities.has(stay.cityId)) {
      const previous = trip.steps[index - 1];
      report(
        "stay.notReached",
        "warning",
        `The journey before ${city} ends in ${label(arrivedAt)}.`,
        { index },
        { arrivedAt: label(arrivedAt), city },
        previous?.type === "move"
          ? {
              apply: (current) =>
                withStep(current, index - 1, (step) =>
                  step.type === "move"
                    ? {
                        ...step,
                        legs: step.legs.map((leg, position) =>
                          position === step.legs.length - 1
                            ? { ...leg, toId: stay.cityId }
                            : leg,
                        ),
                      }
                    : step,
                ),
              label: `End that journey in ${city}`,
            }
          : undefined,
      );
    }

    (stay.outings ?? []).forEach((outing, outingIndex) => {
      if (outing.date < stay.checkIn || outing.date > stay.checkOut)
        report(
          "outing.outsideStay",
          "warning",
          `The day trip on ${outing.date} is outside your stay in ${city}.`,
          { index, outing: outingIndex },
          { city, date: outing.date },
        );
      const last = outing.legs.at(-1);
      if (last && last.toId !== stay.cityId)
        report(
          "outing.notBack",
          "warning",
          `The day trip on ${outing.date} never comes back to ${city}.`,
          { index, outing: outingIndex },
          { city, date: outing.date },
          {
            apply: (current) =>
              withStep(current, index, (step) =>
                step.type === "stay"
                  ? {
                      ...step,
                      outings: step.outings?.map((candidate, position) =>
                        position === outingIndex
                          ? {
                              ...candidate,
                              legs: [
                                ...candidate.legs,
                                { mode: last.mode, toId: stay.cityId },
                              ],
                            }
                          : candidate,
                      ),
                    }
                  : step,
              ),
            label: `Add the ride back to ${city}`,
          },
        );
    });
  }

  for (const located of walkTripLegs(trip)) validateLeg(located);

  /**
   * Reports what is wrong with one leg: unknown or identical endpoints, a
   * missing gallery, transport details that contradict its mode, an arrival
   * before its departure, or a speed no vehicle reaches.
   * @param {LocatedLeg} located - The leg and where it departs from
   * @returns {void}
   */
  function validateLeg(located: LocatedLeg): void {
    const { fromId, index, leg, legIndex, outing } = located;
    const at = { index, leg: legIndex, outing };
    const from = label(fromId);
    const to = label(leg.toId);
    if (!context.cities.has(leg.toId))
      report(
        "leg.unknownCity",
        "blocking",
        `A ride goes to the unknown city "${leg.toId}".`,
        at,
        { cityId: leg.toId },
      );
    for (const id of [...(leg.viaIds ?? []), ...(leg.ferry?.viaIds ?? [])])
      if (!context.cities.has(id))
        report(
          "leg.unknownVia",
          "blocking",
          `A ride passes through the unknown city "${id}".`,
          at,
          { cityId: id },
        );
    if (leg.photoPath && !context.photoKeys.has(leg.photoPath))
      report(
        "leg.missingGallery",
        "warning",
        `${to} points at the missing gallery "${leg.photoPath}".`,
        at,
        { city: to, photoPath: leg.photoPath },
        {
          apply: (current) =>
            withLeg(current, located, (candidate) => ({
              ...candidate,
              photoPath: undefined,
            })),
          label: "Remove the reference",
        },
      );
    if (fromId === leg.toId)
      report(
        "leg.identicalEndpoints",
        "warning",
        `This ${leg.mode} ride starts and ends in ${from}.`,
        at,
        { city: from, mode: leg.mode },
        {
          apply: (current) => withLeg(current, located, () => null),
          label: "Remove the ride",
        },
      );

    const fromCity = context.cities.get(fromId);
    const toCity = context.cities.get(leg.toId);
    const timed =
      fromCity && toCity && leg.depart && leg.arrive
        ? zonedDurationMinutes(
            leg.depart,
            fromCity.timeZone,
            leg.arrive,
            toCity.timeZone,
          )
        : undefined;
    if (
      (timed !== undefined && timed < 0) ||
      (leg.depart &&
        leg.arrive &&
        leg.arrive.slice(0, 10) < leg.depart.slice(0, 10))
    )
      report(
        "leg.arrivalBeforeDeparture",
        "blocking",
        `The ride to ${to} arrives before it leaves.`,
        at,
        { to },
      );
    if (leg.flight && leg.mode !== "plane")
      report(
        "leg.flightOnNonFlight",
        "warning",
        `Flight details are recorded on a ${leg.mode} ride.`,
        at,
        { mode: leg.mode },
        {
          apply: (current) =>
            withLeg(current, located, (candidate) => ({
              ...candidate,
              flight: undefined,
            })),
          label: "Remove the flight details",
        },
      );
    if (leg.ferry && leg.mode !== "ferry")
      report(
        "leg.ferryOnNonFerry",
        "warning",
        `Ferry details are recorded on a ${leg.mode} ride.`,
        at,
        { mode: leg.mode },
        {
          apply: (current) =>
            withLeg(current, located, (candidate) => ({
              ...candidate,
              ferry: undefined,
            })),
          label: "Remove the ferry details",
        },
      );

    const minutes = leg.durationMinutes ?? timed;
    if (fromCity && toCity && minutes) {
      const distance =
        leg.distanceInKm ??
        deriveLegDistance(fromCity.coordinates, toCity.coordinates);
      if (impliedSpeedKmh(distance, minutes) > IMPOSSIBLE_SPEED_KMH)
        report(
          "leg.impossibleSpeed",
          "warning",
          `${from} to ${to} in ${minutes} minutes is faster than any of these modes travel.`,
          at,
          { from, minutes, to },
        );
    }
  }

  const first = trip.steps[0];
  if (first?.type === "stay" && first.cityId !== trip.originCityId)
    report(
      "trip.startsWithStay",
      "suggestion",
      `The trip starts in ${label(trip.originCityId)} but the first thing recorded is a stay in ${label(first.cityId)}.`,
      { index: 0 },
      { city: label(first.cityId), origin: label(trip.originCityId) },
      {
        apply: (current) => ({ ...current, originCityId: first.cityId }),
        label: `Start the trip in ${label(first.cityId)}`,
      },
    );

  const derived = deriveTripDateRange(trip.steps);
  if (
    derived.sDate &&
    derived.eDate &&
    isParsableDate(trip.sDate) &&
    isParsableDate(trip.eDate) &&
    (derived.sDate !== trip.sDate.slice(0, 10) ||
      derived.eDate !== trip.eDate.slice(0, 10))
  )
    report(
      "trip.rangeMismatch",
      "suggestion",
      `The itinerary covers ${derived.sDate} to ${derived.eDate}.`,
      undefined,
      { eDate: derived.eDate, sDate: derived.sDate },
      {
        apply: (current) => ({
          ...current,
          eDate: derived.eDate!,
          sDate: derived.sDate!,
        }),
        label: "Match the trip dates to its itinerary",
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
