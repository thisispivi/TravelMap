import { City } from "./city";
import { Country } from "./country";

export const visited = {
  Belgium: new Country("Belgium", { r: 213, g: 48, b: 50 }),
  Spain: new Country("Spain", { r: 243, g: 159, b: 24 }),
  Italy: new Country("Italy", { r: 0, g: 86, b: 185 }),
  Hungary: new Country("Hungary", { r: 217, g: 80, b: 48 }),
  Germany: new Country("Germany", { r: 49, g: 127, b: 67 }),
  UnitedKingdom: new Country("UnitedKingdom", { r: 132, g: 195, b: 190 }),
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
];
