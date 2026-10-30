import { TransportMode } from "@travelmap/core";
import variables from "@travelmap/ui/styles/_variables.module.scss";

/** Each transport mode's colour, shared by the map routes, the passes and the statistics. */
export const MODE_COLORS: Record<TransportMode, string> = {
  bus: variables.transportBus,
  car: variables.transportCar,
  ferry: variables.transportFerry,
  plane: variables.transportPlane,
  taxi: variables.transportTaxi,
  train: variables.transportTrain,
  walk: variables.transportWalk,
};
