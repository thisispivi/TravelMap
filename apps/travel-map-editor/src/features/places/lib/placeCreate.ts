import { CityJson, CountryJson, deriveLegDistance } from "@travelmap/core";

import { locales } from "../../../data/dataset";
import { cityPath, countryPath, toId, uniqueId } from "../../../data/paths";
import { DatasetSnapshot, DocumentWrite } from "../../../data/store";
import { translationsForLocales } from "../../../shared/lib/worldCountries";
import { WorldCity } from "./gazetteer";

/**
 * What adding a place to the dataset would do, before anything is written.
 * Returned rather than applied so the editor can disclose the file creations
 * to the author and undo them as one action.
 * @property {string} cityId - The city the itinerary should reference
 * @property {DocumentWrite[]} writes - Documents that would be created
 * @property {string | null} createsCountry - Country created, when new
 * @property {boolean} isExisting - Whether the dataset already had this place
 * @property {string | null} nearbyCityId - An existing city at almost this spot
 */
export interface PlannedPlace {
  cityId: string;
  writes: DocumentWrite[];
  createsCountry: string | null;
  isExisting: boolean;
  nearbyCityId: string | null;
}

/*
 * Successive hues a third of the wheel apart, so countries added one after
 * another never come out looking alike on the map.
 */
const HUE_STEP = 137;
const DEFAULT_SATURATION = 68;
const DEFAULT_LIGHTNESS = 50;

/*
 * Two gazetteer entries this close together are almost always the same place
 * recorded twice, or a suburb the author means to fold into its city.
 */
const DUPLICATE_RADIUS_KM = 25;

/**
 * Picks a map colour for a newly created country, spaced away from the ones
 * already in the dataset.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {{ h: number; s: number; l: number }} The suggested fill
 */
function nextCountryColor(dataset: DatasetSnapshot): {
  h: number;
  s: number;
  l: number;
} {
  return {
    h: (dataset.countries.length * HUE_STEP) % 360,
    l: DEFAULT_LIGHTNESS,
    s: DEFAULT_SATURATION,
  };
}

/**
 * Finds a city already in the dataset that is close enough to be the same
 * place, so an import or a second search never creates a duplicate Rome.
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
 * An existing city with the same id, or one within a few kilometres, is reused
 * instead: the itinerary wants a reference, not a second copy of the place.
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
  const byName = dataset.cities.find(({ value }) => value.name === city.name);
  const reused = byName?.value.id ?? nearbyCityId;
  if (reused)
    return {
      cityId: reused,
      createsCountry: null,
      isExisting: true,
      nearbyCityId,
      writes: [],
    };

  const writes: DocumentWrite[] = [];
  const country = city.country;
  const hasCountry = dataset.countries.some(
    ({ value }) => value.id === country.id,
  );

  if (!hasCountry) {
    const document: CountryJson = {
      id: country.id,
      name: country.name,
      nameByLocale: translationsForLocales(country, locales()),
      color: nextCountryColor(dataset),
      continent: country.continent,
      currency: country.currency,
    };
    writes.push({ path: countryPath(country.id), value: document });
  }

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
  writes.push({ path: cityPath(country.id, cityId), value: document });

  return {
    cityId,
    createsCountry: hasCountry ? null : country.name,
    isExisting: false,
    nearbyCityId,
    writes,
  };
}

/**
 * Builds the city document for a point the author placed by hand, for places
 * the gazetteer does not carry.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @param {string} name - The place name
 * @param {string} countryId - The owning country, which must already exist
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
    createsCountry: null,
    isExisting: false,
    nearbyCityId: findNearbyCity(dataset, coordinates),
    writes: [{ path: cityPath(countryId, cityId), value: document }],
  };
}
