import { CityJson, TripJson, walkTripLegs } from "@travelmap/core";

import type { DataFile } from "@/data/store";

import type { MapPin, MapRoute, MapScene } from "../context/MapScene.context";

/**
 * Names the map id of a step, the same id the itinerary selects it by.
 * @param {number} index - The step's position
 * @returns {string} The id
 */
export function stepMapId(index: number): string {
  return `step:${index}`;
}

/**
 * Names the map id of one ride, the same id the itinerary selects it by.
 * @param {number} index - The step holding the ride
 * @param {number | undefined} outing - The day trip holding it, if any
 * @param {number} leg - The ride's position in its chain
 * @returns {string} The id
 */
export function legMapId(
  index: number,
  outing: number | undefined,
  leg: number,
): string {
  return `leg:${index}:${outing ?? ""}:${leg}`;
}

/**
 * Turns a trip into what the shared map draws: its origin, a numbered pin for
 * each stay, a smaller pin for each place only passed through, and
 * a line for every ride. Places that are not in the dataset yet are skipped,
 * so a half-written trip still draws what it can.
 * @param {TripJson} trip - The trip
 * @param {Map<string, CityJson>} cityById - The dataset's cities
 * @returns {MapScene} The trip's scene, framed on every place it reaches
 */
export function tripScene(
  trip: TripJson,
  cityById: Map<string, CityJson>,
): MapScene {
  const pins: MapPin[] = [];
  const pinned = new Set<string>();

  /**
   * Adds a pin for a city. A place only passed through is pinned once, however
   * many times the trip reaches it; every stay gets its own numbered pin, so a
   * second stay in the same city can still be selected on the map.
   * @param {string} cityId - The city
   * @param {Omit<MapPin, "coordinates" | "label">} details - The pin's id, tone and number
   * @returns {void}
   */
  const pin = (
    cityId: string,
    details: Omit<MapPin, "coordinates" | "label">,
  ): void => {
    const city = cityById.get(cityId);
    if (!city || (details.tone !== "stay" && pinned.has(cityId))) return;
    pinned.add(cityId);
    pins.push({ ...details, coordinates: city.coordinates, label: city.name });
  };

  let stays = 0;
  trip.steps.forEach((step, index) => {
    if (step.type === "stay") {
      stays += 1;
      pin(step.cityId, { id: stepMapId(index), number: stays, tone: "stay" });
    }
  });
  pin(trip.originCityId, { id: "origin", tone: "stop" });

  const routes: MapRoute[] = walkTripLegs(trip).flatMap(
    ({ fromId, index, leg, legIndex, outing }) => {
      const from = cityById.get(fromId);
      const to = cityById.get(leg.toId);
      if (!from || !to || fromId === leg.toId) return [];
      pin(leg.toId, { id: legMapId(index, outing, legIndex), tone: "stop" });
      return [
        {
          from: from.coordinates,
          id: legMapId(index, outing, legIndex),
          isOuting: outing !== undefined,
          mode: leg.mode,
          to: to.coordinates,
        },
      ];
    },
  );

  return {
    frame: pins.map(({ coordinates }) => coordinates),
    pins,
    routes,
  };
}

/**
 * Pins every place any trip slept in, once each, for a map that shows the
 * whole record rather than one trip.
 * @param {DataFile<TripJson>[]} trips - Every trip document
 * @param {Map<string, CityJson>} cityById - The dataset's cities
 * @returns {MapScene} The places, framed on all of them
 */
export function visitedPlacesScene(
  trips: DataFile<TripJson>[],
  cityById: Map<string, CityJson>,
): MapScene {
  const cityIds = new Set(
    trips.flatMap(({ value }) =>
      value.steps.flatMap((step) =>
        step.type === "stay" ? [step.cityId] : [],
      ),
    ),
  );
  const pins: MapPin[] = [...cityIds].flatMap((id) => {
    const city = cityById.get(id);
    return city
      ? [
          {
            coordinates: city.coordinates,
            id: `city:${id}`,
            label: city.name,
            tone: "place" as const,
          },
        ]
      : [];
  });
  return {
    frame: pins.map(({ coordinates }) => coordinates),
    pins,
    routes: [],
  };
}
