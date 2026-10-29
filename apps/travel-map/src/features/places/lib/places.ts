import { City, Country, Trip } from "@travelmap/core";

/**
 * How much of a city the record holds.
 * @property {number} visits - Trips that reached it
 * @property {number} nights - Nights slept there
 */
export interface CityVisits {
  visits: number;
  nights: number;
}

/**
 * Counts the trips that reached a city and the nights slept there.
 * @param {City} city - The city
 * @param {Trip[]} trips - The trips to read
 * @returns {CityVisits} Its visits and nights
 */
export function cityVisits(city: City, trips: Trip[]): CityVisits {
  let visits = 0;
  let nights = 0;
  for (const trip of trips) {
    if (trip.route.includes(city.id)) visits += 1;
    for (const stay of trip.stays)
      if (stay.city.id === city.id) nights += stay.nights;
  }
  return { nights, visits };
}

/**
 * One country's cities.
 * @property {Country} country - The country
 * @property {City[]} cities - Its cities, by name
 */
export interface CountryGroup {
  country: Country;
  cities: City[];
}

/**
 * Groups cities by country, both in the reader's alphabetical order.
 * @param {City[]} cities - The cities
 * @param {string} locale - The active locale
 * @returns {CountryGroup[]} One group per country
 */
export function groupByCountry(cities: City[], locale: string): CountryGroup[] {
  const groups = new Map<string, CountryGroup>();
  for (const city of cities) {
    const group = groups.get(city.country.id) ?? {
      cities: [],
      country: city.country,
    };
    group.cities.push(city);
    groups.set(city.country.id, group);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      cities: group.cities.toSorted((first, second) =>
        first
          .getLocalizedName(locale)
          .localeCompare(second.getLocalizedName(locale), locale),
      ),
    }))
    .toSorted((first, second) =>
      first.country
        .getLocalizedName(locale)
        .localeCompare(second.country.getLocalizedName(locale), locale),
    );
}
