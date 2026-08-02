import {
  deriveLegDistance,
  estimateDurationMinutes,
  guessTransportMode,
  TransportMode,
  TripTransportJson,
} from "@travelmap/core";

/**
 * The values the editor can work out for a leg, offered beside the fields
 * rather than written into them. Nothing here reaches the JSON until the
 * author accepts it, which is what makes every stored value authored.
 * @property {number} [distanceInKm] - Suggested great-circle distance
 * @property {number} [durationMinutes] - Suggested duration for the mode
 * @property {TransportMode} [mode] - Suggested mode for the distance
 */
export interface LegSuggestions {
  distanceInKm?: number;
  durationMinutes?: number;
  mode?: TransportMode;
}

/**
 * Works out how far apart two cities are, when both are known.
 * @param {string} fromId - Departure city id
 * @param {string} toId - Arrival city id
 * @param {Map<string, [number, number]>} coordinatesById - City coordinates
 * @returns {number | undefined} Distance in kilometres, when both resolve
 */
export function derivedDistanceKm(
  fromId: string,
  toId: string,
  coordinatesById: Map<string, [number, number]>,
): number | undefined {
  const from = coordinatesById.get(fromId);
  const to = coordinatesById.get(toId);
  if (!from || !to) return undefined;
  return deriveLegDistance(from, to);
}

/**
 * Collects every suggestion available for a leg.
 * @param {TripTransportJson} leg - The leg to describe
 * @param {Map<string, [number, number]>} coordinatesById - City coordinates
 * @returns {LegSuggestions} What the editor can work out
 */
export function suggestForLeg(
  leg: TripTransportJson,
  coordinatesById: Map<string, [number, number]>,
): LegSuggestions {
  const distanceInKm = derivedDistanceKm(leg.fromId, leg.toId, coordinatesById);
  if (distanceInKm === undefined) return {};
  return {
    distanceInKm,
    durationMinutes: estimateDurationMinutes(leg.mode, distanceInKm),
    mode: guessTransportMode(distanceInKm),
  };
}

/**
 * Formats a duration the way an itinerary reads it, rather than as raw minutes.
 * @param {number} minutes - Duration in minutes
 * @returns {string} A compact `2h 15m` style label
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}
