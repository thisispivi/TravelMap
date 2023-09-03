import { City } from "../classes/City";
import { Country } from "../classes/Country";

export const visited = {
  Belgium: new Country("Belgium", { r: 213, g: 48, b: 50 }),
  Spain: new Country("Spain", { r: 243, g: 159, b: 24 }),
  Italy: new Country("Italy", { r: 0, g: 86, b: 185 }),
  Hungary: new Country("Hungary", { r: 217, g: 80, b: 48 }),
  Germany: new Country("Germany", { r: 49, g: 127, b: 67 }),
  UnitedKingdom: new Country("United Kingdom", { r: 132, g: 195, b: 190 }),
};

export const cities: City[] = [
  new City(
    "Brussels",
    visited.Belgium,
    1180531,
    [4.34878, 50.85045],
    new Date(2023, 8, 5),
    new Date(2023, 8, 10)
  ),
  new City(
    "Bruges",
    visited.Belgium,
    118284,
    [3.22424, 51.209348],
    new Date(2023, 8, 9),
    new Date(2023, 8, 9)
  ),
  new City(
    "Anderlecht",
    visited.Belgium,
    119714,
    [4.2360105, 50.8127957],
    new Date(2023, 8, 6),
    new Date(2023, 8, 6)
  ),

  new City(
    "Budapest",
    visited.Hungary,
    1756000,
    [19.040236, 47.497913],
    new Date(2023, 8, 11),
    new Date(2023, 8, 15)
  ),

  new City(
    "Berlin",
    visited.Germany,
    3769000,
    [13.404954, 52.520008],
    new Date(2023, 8, 16),
    new Date(2023, 8, 20)
  ),

  new City(
    "Barcelona",
    visited.Spain,
    1620000,
    [2.173403, 41.385064],
    new Date(2016, 4, 11),
    new Date(2016, 4, 15)
  ),
  new City(
    "London",
    visited.UnitedKingdom,
    8900000,
    [-0.118092, 51.509865],
    new Date(2023, 8, 26),
    new Date(2023, 8, 30)
  ),
  new City(
    "Turin",
    visited.Italy,
    886837,
    [7.686856, 45.070312],
    new Date(2023, 9, 1),
    new Date(2023, 9, 5)
  ),
  new City(
    "Padua",
    visited.Italy,
    214198,
    [11.876761, 45.406435],
    new Date(2023, 9, 6),
    new Date(2023, 9, 10)
  ),
  new City(
    "Rome",
    visited.Italy,
    2872800,
    [12.496366, 41.902782],
    new Date(2023, 10, 11),
    new Date(2023, 10, 15)
  ),
  new City(
    "Verona",
    visited.Italy,
    258108,
    [10.991621, 45.438384],
    new Date(2023, 10, 16),
    new Date(2023, 10, 20)
  ),
  new City(
    "Venice",
    visited.Italy,
    261905,
    [12.315515, 45.440847],
    new Date(2023, 10, 21),
    new Date(2023, 10, 25)
  ),
  new City(
    "Terni",
    visited.Italy,
    112528,
    [12.646361, 42.560253],
    new Date(2023, 10, 26),
    new Date(2023, 10, 30)
  ),
  new City(
    "Perugia",
    visited.Italy,
    168066,
    [12.38878, 43.110717],
    new Date(2023, 11, 1),
    new Date(2023, 11, 5)
  ),
  new City(
    "Assisi",
    visited.Italy,
    28403,
    [12.619786, 43.070702],
    new Date(2023, 11, 6),
    new Date(2023, 11, 10)
  ),
  new City(
    "Cuneo",
    visited.Italy,
    56048,
    [7.55, 44.383331],
    new Date(2023, 11, 6),
    new Date(2023, 11, 10)
  ),
  new City(
    "Gressoney-La-Trinité",
    visited.Italy,
    392,
    [7.833333, 45.833332],
    new Date(2023, 11, 11),
    new Date(2023, 11, 15)
  ),
  new City(
    "Genoa",
    visited.Italy,
    583601,
    [8.946256, 44.40565],
    new Date(2023, 11, 16),
    new Date(2023, 11, 20)
  ),
  new City(
    "Livorno",
    visited.Italy,
    158493,
    [10.310567, 43.551876],
    new Date(2023, 11, 6),
    new Date(2023, 11, 10)
  ),
  new City(
    "Pisa",
    visited.Italy,
    90127,
    [10.401682, 43.722839],
    new Date(2023, 11, 6),
    new Date(2023, 11, 10)
  ),
];

function getCitiesOrderedByCoordinates(): City[] {
  return cities.sort((a, b) => {
    return b.coordinates[1] - a.coordinates[1];
  });
}

export const orderedCities = getCitiesOrderedByCoordinates();
