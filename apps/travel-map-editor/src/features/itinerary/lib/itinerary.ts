import {
  addDays,
  deriveLegDistance,
  deriveTripDateRange,
  guessTransportMode,
  TransportMode,
  TripJson,
  TripLegJson,
  TripStayJson,
  TripStepJson,
} from "@travelmap/core";

/**
 * Where one leg lives: a move's chain, or a day trip's chain inside a stay.
 * @property {number} index - Position of the step
 * @property {number} [outing] - Position of the day trip, when the leg is in one
 * @property {number} leg - Position within the chain
 */
export interface LegAddress {
  index: number;
  outing?: number;
  leg: number;
}

/**
 * Widens the trip's own dates to cover its itinerary, so the author never
 * maintains them by hand. Only widens: an undated overnight flight home can
 * end a trip a day after anything the itinerary records.
 * @param {TripJson} trip - The trip to adjust
 * @returns {TripJson} A copy whose range covers its itinerary
 */
function syncTripDates(trip: TripJson): TripJson {
  const { eDate, sDate } = deriveTripDateRange(trip.steps);
  return {
    ...trip,
    eDate: eDate && eDate > trip.eDate ? eDate : trip.eDate,
    sDate: sDate && sDate < trip.sDate ? sDate : trip.sDate,
  };
}

/**
 * Finds where the traveller stands at the end of the itinerary.
 * @param {TripJson} trip - The trip
 * @returns {string} The city id
 */
export function currentCityId(trip: TripJson): string {
  const last = trip.steps.at(-1);
  if (!last) return trip.originCityId;
  return last.type === "stay" ? last.cityId : last.legs.at(-1)!.toId;
}

/**
 * Finds the latest date the itinerary has reached, used to prefill the next
 * stay so the author types as little as possible.
 * @param {TripJson} trip - The trip
 * @returns {string} A YYYY-MM-DD date
 */
function currentDate(trip: TripJson): string {
  return (deriveTripDateRange(trip.steps).eDate ?? trip.sDate).slice(0, 10);
}

/**
 * Builds a leg towards a city with a mode guessed from the distance, which the
 * author can change; nothing else is filled in because nothing else is known.
 * @param {string} fromId - Where the leg departs
 * @param {string} toId - Where it arrives
 * @param {Map<string, [number, number]>} coordinates - City coordinates by id
 * @returns {TripLegJson} The new leg
 */
function newLeg(
  fromId: string,
  toId: string,
  coordinates: Map<string, [number, number]>,
): TripLegJson {
  const from = coordinates.get(fromId);
  const to = coordinates.get(toId);
  return {
    mode:
      from && to ? guessTransportMode(deriveLegDistance(from, to)) : "train",
    toId,
  };
}

/**
 * Travels on to a city: extends the current journey when the trip ends in one,
 * otherwise starts a new journey from the last stay or the origin.
 * @param {TripJson} trip - The trip
 * @param {string} toId - The destination
 * @param {Map<string, [number, number]>} coordinates - City coordinates by id
 * @returns {TripJson} The extended trip
 */
export function travelTo(
  trip: TripJson,
  toId: string,
  coordinates: Map<string, [number, number]>,
): TripJson {
  const leg = newLeg(currentCityId(trip), toId, coordinates);
  const last = trip.steps.at(-1);
  const steps: TripStepJson[] =
    last?.type === "move"
      ? [...trip.steps.slice(0, -1), { ...last, legs: [...last.legs, leg] }]
      : [...trip.steps, { legs: [leg], type: "move" }];
  return syncTripDates({ ...trip, steps });
}

/**
 * Sleeps where the traveller now is, for a number of nights starting on the
 * latest date the itinerary has reached unless a date is given.
 * @param {TripJson} trip - The trip
 * @param {number} nights - Nights to stay
 * @param {string} [checkIn] - The first night, when known
 * @returns {TripJson} The extended trip
 */
export function stayHere(
  trip: TripJson,
  nights: number,
  checkIn: string = currentDate(trip),
): TripJson {
  const stay: TripStayJson = {
    checkIn,
    checkOut: addDays(checkIn, Math.max(0, nights)),
    cityId: currentCityId(trip),
    type: "stay",
  };
  return syncTripDates({ ...trip, steps: [...trip.steps, stay] });
}

/**
 * What an imported row says about a place besides which city it is.
 * @property {TransportMode} [mode] - How the traveller got there
 * @property {string} [checkIn] - The day they arrived
 * @property {number} nights - Nights slept there, zero for a passing visit
 */
interface ImportedVisit {
  mode?: TransportMode;
  checkIn?: string;
  nights: number;
}

/**
 * Appends one imported place: travel there, then either sleep there or record
 * it as a place seen on the way, which is all a list of places can say.
 * @param {TripJson} trip - The trip
 * @param {string} cityId - The place
 * @param {Map<string, [number, number]>} coordinates - City coordinates by id
 * @param {ImportedVisit} visit - What the row said about the visit
 * @returns {TripJson} The extended trip
 */
export function importPlace(
  trip: TripJson,
  cityId: string,
  coordinates: Map<string, [number, number]>,
  visit: ImportedVisit,
): TripJson {
  const moved = travelTo(trip, cityId, coordinates);
  const move = moved.steps.at(-1);
  if (move?.type !== "move") return moved;
  const leg = move.legs.at(-1)!;
  const arrived = replaceStep(moved, moved.steps.length - 1, {
    ...move,
    legs: [
      ...move.legs.slice(0, -1),
      {
        ...leg,
        ...(visit.mode ? { mode: visit.mode } : {}),
        ...(visit.nights > 0 ? {} : { visited: true }),
        ...(visit.checkIn && visit.nights === 0
          ? { arrive: visit.checkIn }
          : {}),
      },
    ],
  });
  return visit.nights > 0
    ? stayHere(arrived, visit.nights, visit.checkIn)
    : arrived;
}

/**
 * Adds a day trip to a stay: there and back on one date, with the date
 * defaulting to the first full day of the stay.
 * @param {TripJson} trip - The trip
 * @param {number} index - Position of the stay
 * @param {string} toId - The place visited
 * @param {Map<string, [number, number]>} coordinates - City coordinates by id
 * @returns {TripJson} The trip with the day trip added
 */
export function addOuting(
  trip: TripJson,
  index: number,
  toId: string,
  coordinates: Map<string, [number, number]>,
): TripJson {
  return mapStay(trip, index, (stay) => {
    const there = newLeg(stay.cityId, toId, coordinates);
    const date =
      stay.checkOut > stay.checkIn ? addDays(stay.checkIn, 1) : stay.checkIn;
    return {
      ...stay,
      outings: [
        ...(stay.outings ?? []),
        {
          date: date > stay.checkOut ? stay.checkOut : date,
          legs: [there, { mode: there.mode, toId: stay.cityId }],
        },
      ],
    };
  });
}

/**
 * Adds another place to a chain. In a day trip it goes before the ride back,
 * so the chain still ends at the stay.
 * @param {TripJson} trip - The trip
 * @param {Omit<LegAddress, "leg">} at - The chain
 * @param {string} toId - The place
 * @param {Map<string, [number, number]>} coordinates - City coordinates by id
 * @returns {TripJson} The trip with the place added
 */
export function addPlaceTo(
  trip: TripJson,
  at: Omit<LegAddress, "leg">,
  toId: string,
  coordinates: Map<string, [number, number]>,
): TripJson {
  const step = trip.steps[at.index];
  if (!step) return trip;
  if (step.type === "move" || at.outing === undefined) {
    if (step.type !== "move") return trip;
    const fromId = step.legs.at(-1)!.toId;
    return syncTripDates(
      replaceStep(trip, at.index, {
        ...step,
        legs: [...step.legs, newLeg(fromId, toId, coordinates)],
      }),
    );
  }

  return mapStay(trip, at.index, (stay) => ({
    ...stay,
    outings: stay.outings?.map((outing, position) => {
      if (position !== at.outing) return outing;
      const last = outing.legs.at(-1);
      const returns = last?.toId === stay.cityId;
      const kept = returns ? outing.legs.slice(0, -1) : outing.legs;
      const fromId = kept.at(-1)?.toId ?? stay.cityId;
      const leg = newLeg(fromId, toId, coordinates);
      return { ...outing, legs: [...kept, leg, ...(returns ? [last!] : [])] };
    }),
  }));
}

/**
 * Ends the trip back at its origin: a new journey after a stay, or one more
 * leg on the journey the trip ends in.
 * @param {TripJson} trip - The trip
 * @param {Map<string, [number, number]>} coordinates - City coordinates by id
 * @returns {TripJson} The completed trip
 */
export function returnHome(
  trip: TripJson,
  coordinates: Map<string, [number, number]>,
): TripJson {
  return travelTo(trip, trip.originCityId, coordinates);
}

/**
 * Replaces one step.
 * @param {TripJson} trip - The trip
 * @param {number} index - Position of the step
 * @param {TripStepJson} step - The replacement
 * @returns {TripJson} The changed trip
 */
export function replaceStep(
  trip: TripJson,
  index: number,
  step: TripStepJson,
): TripJson {
  return syncTripDates({
    ...trip,
    steps: trip.steps.map((existing, position) =>
      position === index ? step : existing,
    ),
  });
}

/**
 * Changes a stay through a function, leaving any other step alone.
 * @param {TripJson} trip - The trip
 * @param {number} index - Position of the stay
 * @param {(stay: TripStayJson) => TripStayJson} change - The change
 * @returns {TripJson} The changed trip
 */
function mapStay(
  trip: TripJson,
  index: number,
  change: (stay: TripStayJson) => TripStayJson,
): TripJson {
  const step = trip.steps[index];
  return step?.type === "stay" ? replaceStep(trip, index, change(step)) : trip;
}

/**
 * Replaces one leg wherever it lives.
 * @param {TripJson} trip - The trip
 * @param {LegAddress} at - Where the leg is
 * @param {TripLegJson} leg - The replacement
 * @returns {TripJson} The changed trip
 */
export function updateLeg(
  trip: TripJson,
  at: LegAddress,
  leg: TripLegJson,
): TripJson {
  return editChain(trip, at, (legs) =>
    legs.map((existing, position) => (position === at.leg ? leg : existing)),
  );
}

/**
 * Removes one leg. A journey or day trip left with no legs goes with it, since
 * neither can exist empty.
 * @param {TripJson} trip - The trip
 * @param {LegAddress} at - Where the leg is
 * @returns {TripJson} The changed trip
 */
export function removeLeg(trip: TripJson, at: LegAddress): TripJson {
  return editChain(trip, at, (legs) =>
    legs.filter((_unused, position) => position !== at.leg),
  );
}

/**
 * Applies a change to one chain of legs and drops the chain's container when
 * the change empties it.
 * @param {TripJson} trip - The trip
 * @param {Omit<LegAddress, "leg">} at - The chain
 * @param {(legs: TripLegJson[]) => TripLegJson[]} change - The change
 * @returns {TripJson} The changed trip
 */
function editChain(
  trip: TripJson,
  at: Omit<LegAddress, "leg">,
  change: (legs: TripLegJson[]) => TripLegJson[],
): TripJson {
  const step = trip.steps[at.index];
  if (!step) return trip;
  if (step.type === "move") {
    const legs = change(step.legs);
    return legs.length > 0
      ? replaceStep(trip, at.index, { ...step, legs })
      : removeStep(trip, at.index);
  }

  return mapStay(trip, at.index, (stay) => ({
    ...stay,
    outings: stay.outings?.flatMap((outing, position) => {
      if (position !== at.outing) return [outing];
      const legs = change(outing.legs);
      return legs.length > 0 ? [{ ...outing, legs }] : [];
    }),
  }));
}

/**
 * Removes a whole step.
 * @param {TripJson} trip - The trip
 * @param {number} index - Position of the step
 * @returns {TripJson} The changed trip
 */
export function removeStep(trip: TripJson, index: number): TripJson {
  return syncTripDates({
    ...trip,
    steps: trip.steps.filter((_unused, position) => position !== index),
  });
}

/**
 * Lists every chain's departure city for one step, so a leg editor can say
 * "from" without storing it.
 * @param {TripJson} trip - The trip
 * @param {Omit<LegAddress, "leg">} at - The chain
 * @returns {string[]} Departure city ids, one per leg
 */
export function chainOrigins(
  trip: TripJson,
  at: Omit<LegAddress, "leg">,
): string[] {
  const step = trip.steps[at.index];
  if (!step) return [];
  const legs =
    step.type === "move"
      ? step.legs
      : (step.outings?.[at.outing ?? -1]?.legs ?? []);
  const start =
    step.type === "stay"
      ? step.cityId
      : currentCityId({ ...trip, steps: trip.steps.slice(0, at.index) });
  return legs.map((_leg, position) =>
    position === 0 ? start : legs[position - 1]!.toId,
  );
}

/** Why the editor is asking the author to pick a place. */
export type PlaceRequest =
  | { kind: "travel" }
  | { kind: "dayTrip"; index: number }
  | { kind: "addToChain"; index: number; outing?: number };

/**
 * Applies the place the author picked to whatever asked for it.
 * @param {TripJson} trip - The trip
 * @param {PlaceRequest} request - What the place is for
 * @param {string} cityId - The picked place
 * @param {Map<string, [number, number]>} coordinates - City coordinates by id
 * @returns {TripJson} The changed trip
 */
export function applyPlace(
  trip: TripJson,
  request: PlaceRequest,
  cityId: string,
  coordinates: Map<string, [number, number]>,
): TripJson {
  switch (request.kind) {
    case "travel":
      return travelTo(trip, cityId, coordinates);
    case "dayTrip":
      return addOuting(trip, request.index, cityId, coordinates);
    case "addToChain":
      return addPlaceTo(trip, request, cityId, coordinates);
  }
}
