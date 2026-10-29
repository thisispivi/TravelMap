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
 * Collects every city the trip only passed through — its origin, airports,
 * changes, and the ports a ferry called at — that has no regular marker.
 * @param {Trip} trip - The trip whose pass-through cities should be collected
 * @param {City[]} existingCities - Cities already represented on the map
 * @returns {City[]} The cities that still need markers
 */
export function getTripLayoverCities(
  trip: Trip,
  existingCities: City[],
): City[] {
  const knownCityNames = new Set(existingCities.map((city) => city.name));
  const auxiliaryCities = new Map<string, City>();

  for (const city of [
    ...trip.getPassThroughCities(),
    ...trip.getLegs().flatMap((leg) => [leg.from, leg.to]),
    trip.returnTo,
  ])
    addAuxiliaryCity(city, knownCityNames, auxiliaryCities);

  return Array.from(auxiliaryCities.values());
}

/**
 * Identifies every city the trip touches, so the map can quiet the pins of
 * every other trip while this one is open. Destinations cover stays no leg
 * reaches, such as a trip recorded as stays alone; ids keep two cities that
 * share a name apart.
 * @param {Trip} trip - The open trip
 * @returns {Set<string>} The ids of the cities on the trip
 */
export function getTripCityIds(trip: Trip): Set<string> {
  return new Set(
    [
      trip.origin,
      trip.returnTo,
      ...trip.destinations.map(({ city }) => city),
      ...trip.getLegs().flatMap((leg) => [leg.from, ...leg.via, leg.to]),
    ].map(({ id }) => id),
  );
}
