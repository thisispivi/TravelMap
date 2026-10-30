import { CityJson, TripJson, walkTripLegs } from "@travelmap/core";

import type { DataFile } from "../../../data/store";
import type { MapRoute } from "../../../shared/context/MapScene.context";
import { legMapId } from "../../map/lib/tripScene";

/**
 * Gathers every ride made with each operator across all trips, as map lines:
 * a flight by its airline, a crossing by its ferry line.
 * @param {DataFile<TripJson>[]} trips - Every trip document
 * @param {Map<string, CityJson>} cityById - The dataset's cities
 * @returns {Map<string, MapRoute[]>} Rides by operator id
 */
export function companyRides(
  trips: DataFile<TripJson>[],
  cityById: Map<string, CityJson>,
): Map<string, MapRoute[]> {
  const rides = new Map<string, MapRoute[]>();
  for (const { value: trip } of trips)
    for (const { fromId, index, leg, legIndex, outing } of walkTripLegs(trip)) {
      const operator = leg.flight?.company ?? leg.ferry?.company;
      const from = cityById.get(fromId);
      const to = cityById.get(leg.toId);
      if (!operator || !from || !to) continue;
      rides.set(operator, [
        ...(rides.get(operator) ?? []),
        {
          from: from.coordinates,
          id: `${trip.id}:${legMapId(index, outing, legIndex)}`,
          isOuting: outing !== undefined,
          mode: leg.mode,
          to: to.coordinates,
        },
      ]);
    }
  return rides;
}
