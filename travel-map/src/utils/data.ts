import { City } from "../classes/City";
import { Country } from "../classes/Country";

export const visited = {
  Belgium: new Country("Belgium", { h: 158, s: 72, l: 42 }),
  Spain: new Country("Spain", { h: 175, s: 92, l: 19 }),
  Italy: new Country("Italy", { h: 5, s: 80, l: 67 }),
  Hungary: new Country("Hungary", { h: 45, s: 80, l: 63 }),
  Germany: new Country("Germany", { h: 290, s: 70, l: 40 }),
  UnitedKingdom: new Country("United Kingdom", { h: 201, s: 80, l: 47 }),
};

export const cities: City[] = [
  new City(
    "Brussels",
    visited.Belgium,
    1180531,
    [4.34878, 50.85045],
    [[new Date(2023, 7, 5), new Date(2023, 7, 10)]]
  ),
  new City(
    "Bruges",
    visited.Belgium,
    118284,
    [3.22424, 51.209348],
    [[new Date(2023, 7, 9), new Date(2023, 7, 9)]]
  ),
  new City(
    "Anderlecht",
    visited.Belgium,
    119714,
    [4.1360105, 50.8127957],
    [[new Date(2023, 7, 6), new Date(2023, 7, 6)]]
  ),

  new City(
    "Budapest",
    visited.Hungary,
    1756000,
    [19.040236, 47.497913],
    [[new Date(2023, 4, 6), new Date(2023, 4, 9)]]
  ),

  new City(
    "Berlin",
    visited.Germany,
    3769000,
    [13.404954, 52.520008],
    [[new Date(2023, 8, 16), new Date(2023, 8, 20)]]
  ),

  new City(
    "Barcelona",
    visited.Spain,
    1620000,
    [2.173403, 41.385064],
    [[new Date(2016, 3, 11), new Date(2016, 3, 15)]]
  ),
  new City(
    "London",
    visited.UnitedKingdom,
    8900000,
    [-0.118092, 51.509865],
    [[new Date(2023, 8, 26), new Date(2023, 8, 30)]]
  ),
  new City(
    "Rome",
    visited.Italy,
    2872800,
    [12.496366, 41.902782],
    [[new Date(2023, 10, 11), new Date(2023, 10, 15)]]
  ),
  new City(
    "Imola",
    visited.Italy,
    69815,
    [11.716667, 44.350555],
    [[new Date(2022, 3, 22), new Date(2022, 3, 24)]]
  ),
];

function getCitiesOrderedByCoordinates(): City[] {
  return cities.sort((a, b) => {
    return b.coordinates[1] - a.coordinates[1];
  });
}

export const orderedCities = getCitiesOrderedByCoordinates();
