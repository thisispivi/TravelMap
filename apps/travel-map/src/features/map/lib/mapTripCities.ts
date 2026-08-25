import { City, Trip } from "@travelmap/core";

/**
 * Adds a city when no regular marker already represents it.
 * @param {City | undefined} city - The optional city to add
 * @param {Set<string>} knownCityNames - Names represented by regular markers
 * @param {Map<string, City>} auxiliaryCities - Auxiliary markers collected so far
 * @returns {void}
 */
function addAuxiliaryCity(
  city: City | undefined,
  knownCityNames: Set<string>,
  auxiliaryCities: Map<string, City>,
): void {
  if (city && !knownCityNames.has(city.name)) {
    auxiliaryCities.set(city.name, city);
  }
}

/**
 * Collects every layover, origin, return, and via city without a regular marker.
 * @param {Trip} trip - The trip whose auxiliary cities should be collected
 * @param {City[]} existingCities - Cities already represented on the map
 * @returns {City[]} The auxiliary cities that still need markers
 */
export function getTripLayoverCities(
  trip: Trip,
  existingCities: City[],
): City[] {
  const knownCityNames = new Set(existingCities.map((city) => city.name));
  const auxiliaryCities = new Map<string, City>();

  for (const destination of trip.destinations) {
    if (destination.isLayover) {
      addAuxiliaryCity(destination.city, knownCityNames, auxiliaryCities);
    }
  }

  for (const step of trip.steps) {
    if (step.type !== "transport") continue;

    addAuxiliaryCity(step.from, knownCityNames, auxiliaryCities);
    addAuxiliaryCity(step.to, knownCityNames, auxiliaryCities);

    for (const via of step.via ?? step.ferry?.via ?? []) {
      addAuxiliaryCity(via, knownCityNames, auxiliaryCities);
    }
  }

  addAuxiliaryCity(trip.origin?.city, knownCityNames, auxiliaryCities);
  addAuxiliaryCity(trip.returnTo?.city, knownCityNames, auxiliaryCities);

  return Array.from(auxiliaryCities.values());
}

/**
 * Numbers the cities a trip actually stays in, following the order of its
 * steps. Layovers are excluded: an airport you changed planes in is not a stop
 * on the itinerary, and numbering it would misstate how many places were seen.
 * @param {Trip} trip - The trip whose stops should be numbered
 * @returns {Map<string, number>} Each stop city name mapped to its 1-based position
 */
export function getTripStopOrder(trip: Trip): Map<string, number> {
  const order = new Map<string, number>();

  for (const destination of trip.destinations) {
    if (destination.isLayover || order.has(destination.city.name)) continue;
    order.set(destination.city.name, order.size + 1);
  }

  return order;
}
