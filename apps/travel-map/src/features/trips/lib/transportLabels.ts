import { TransportMode } from "@travelmap/core";

/**
 * The singular and plural translation keys naming a transport mode's legs.
 * @property {string} one - The `tripDetail` key used for a single leg
 * @property {string} other - The `tripDetail` key used for several legs
 */
interface TransportModeNouns {
  one: string;
  other: string;
}

/**
 * Names the legs of each transport mode. Journeys are counted in their own
 * nouns rather than in the mode itself — a car leg is "a drive", not "a car" —
 * so the counts read as prose wherever they are shown.
 */
export const TRANSPORT_MODE_NOUNS: Record<TransportMode, TransportModeNouns> = {
  plane: { one: "flight", other: "flights" },
  ferry: { one: "ferry", other: "ferries" },
  train: { one: "train", other: "trains" },
  bus: { one: "bus", other: "buses" },
  car: { one: "drive", other: "drives" },
  taxi: { one: "taxi", other: "taxis" },
  walk: { one: "walk", other: "walks" },
};
