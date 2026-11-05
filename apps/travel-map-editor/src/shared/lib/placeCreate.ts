import { CityJson, deriveLegDistance, toId } from "@travelmap/core";

import { cityPath, uniqueId } from "@/data/paths";
import { DatasetSnapshot, DocumentWrite } from "@/data/store";

import { WorldCity } from "./gazetteer";

/**
 * What adding a place to the dataset would do, before anything is written.
 * Returned rather than applied so the editor can disclose the file creations
 * to the author and undo them as one action.
 * @property {string} cityId - The city the itinerary should reference
 * @property {DocumentWrite[]} writes - Documents that would be created
 * @property {boolean} isExisting - Whether the dataset already had this place
 * @property {string | null} nearbyCityId - An existing city at almost this spot
 */
export interface PlannedPlace {
  cityId: string;
  writes: DocumentWrite[];
  isExisting: boolean;
  nearbyCityId: string | null;
}

/* Gazetteers may vary slightly for the same pin, but neighbouring cities are distinct. */
const DUPLICATE_RADIUS_KM = 1;

/**
 * Finds a city already in the dataset at effectively the same map point.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @param {[number, number]} coordinates - Longitude and latitude
 * @returns {string | null} The nearby city's id, when there is one
 */
export function findNearbyCity(
  dataset: DatasetSnapshot,
  coordinates: [number, number],
): string | null {
  const nearby = dataset.cities.find(
    ({ value }) =>
      deriveLegDistance(value.coordinates, coordinates) <= DUPLICATE_RADIUS_KM,
  );
  return nearby?.value.id ?? null;
}

/**
 * Works out what adding a gazetteer match would create.
 * An existing city with the same name in the same country, or at effectively
 * the same coordinates, is reused instead of creating a duplicate document.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @param {WorldCity} city - The chosen gazetteer entry
 * @returns {PlannedPlace | null} The plan, or null when the country is unknown
 */
export function planPlace(
  dataset: DatasetSnapshot,
  city: WorldCity,
): PlannedPlace | null {
  if (!city.country) return null;

  const nearbyCityId = findNearbyCity(dataset, city.coordinates);
  const normalizedName = city.name.trim().toLocaleLowerCase();
  const byName = dataset.cities.find(
    ({ value }) =>
      value.countryId === city.country?.id &&
      value.name.trim().toLocaleLowerCase() === normalizedName,
  );
  const reused = byName?.value.id ?? nearbyCityId;
  if (reused)
    return {
      cityId: reused,
      isExisting: true,
      nearbyCityId,
      writes: [],
    };

  const country = city.country;
  const cityId = uniqueId(
    toId(city.name),
    dataset.cities.map(({ value }) => value.id),
  );
  const document: CityJson = {
    id: cityId,
    name: city.name,
    countryId: country.id,
    coordinates: city.coordinates,
    population: city.population,
    timeZone: city.timeZone,
  };
  return {
    cityId,
    isExisting: false,
    nearbyCityId,
    writes: [{ path: cityPath(country.id, cityId), value: document }],
  };
}

/**
 * Builds the city document for a point the author placed by hand, for places
 * the gazetteer does not carry.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @param {string} name - The place name
 * @param {string} countryId - The owning country's code
 * @param {[number, number]} coordinates - Longitude and latitude
 * @param {string} timeZone - The IANA timezone covering the point
 * @returns {PlannedPlace} The plan for the manual place
 */
export function planManualPlace(
  dataset: DatasetSnapshot,
  name: string,
  countryId: string,
  coordinates: [number, number],
  timeZone: string,
): PlannedPlace {
  const cityId = uniqueId(
    toId(name),
    dataset.cities.map(({ value }) => value.id),
  );
  const document: CityJson = {
    id: cityId,
    name,
    countryId,
    coordinates,
    timeZone,
  };

  return {
    cityId,
    isExisting: false,
    nearbyCityId: findNearbyCity(dataset, coordinates),
    writes: [{ path: cityPath(countryId, cityId), value: document }],
  };
}
