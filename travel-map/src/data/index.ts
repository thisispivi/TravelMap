import { Anderlecht } from "./cities/Anderlecht/Anderlecht";
import { Barcelona } from "./cities/Barcelona/Barcelona";
import { Berlin } from "./cities/Berlin/Berlin";
import { Bologna } from "./cities/Bologna/Bologna";
import { Braga } from "./cities/Braga/Braga";
import { Bruges } from "./cities/Bruges/Bruges";
import { Brussels } from "./cities/Brussels/Brussels";
import { Budapest } from "./cities/Budapest/Budapest";
import { Cagliari } from "./cities/Cagliari/Cagliari";
import { Cefalù } from "./cities/Cefalù/Cefalù";
import { City } from "../core";
import { Flight } from "../core/classes/Flight";
import { Fujikawaguchiko } from "./cities/Fujikawaguchiko/Fujikawaguchiko";
import { Genoa } from "./cities/Genoa/Genoa";
import { Himeji } from "./cities/Himeji/Himeji";
import { Imola } from "./cities/Imola/Imola";
import { Kanazawa } from "./cities/Kanazawa/Kanazawa";
import { Kobe } from "./cities/Kobe/Kobe";
import { Kyoto } from "./cities/Kyoto/Kyoto";
import { London } from "./cities/London/London";
import { Matsumoto } from "./cities/Matsumoto/Matsumoto";
import { Muravera } from "./cities/Muravera/Muravera";
import { Nara } from "./cities/Nara/Nara";
import { Osaka } from "./cities/Osaka/Osaka";
import { Oshino } from "./cities/Oshino/Oshino";
import { Porto } from "./cities/Porto/Porto";
import { Rome } from "./cities/Rome/Rome";
import { Shirakawago } from "./cities/Shirakawago/Shirakawago";
import { Takayama } from "./cities/Takayama/Takayama";
import { Terni } from "./cities/Terni/Terni";
import { Tokyo } from "./cities/Tokyo/Tokyo";
import { Turin } from "./cities/Turin/Turin";
import { Verona } from "./cities/Verona/Verona";
import {
  Belgium,
  Germany,
  Hungary,
  Italy,
  Japan,
  Portugal,
  Spain,
  UnitedKingdom,
} from "./countries/countries";

export const livedCountries = { Italy };
export const livedCities: City[] = [Muravera, Cagliari];

export const visitedCountries = {
  Belgium,
  Germany,
  Hungary,
  Italy,
  Japan,
  Portugal,
  Spain,
  UnitedKingdom,
};
export const visitedCities: City[] = [
  Anderlecht,
  Barcelona,
  Berlin,
  Bologna,
  Braga,
  Bruges,
  Brussels,
  Budapest,
  Cefalù,
  Fujikawaguchiko,
  Genoa,
  Himeji,
  Imola,
  Kanazawa,
  Kobe,
  Kyoto,
  London,
  Matsumoto,
  Nara,
  Osaka,
  Oshino,
  Porto,
  Rome,
  Shirakawago,
  Takayama,
  Terni,
  Tokyo,
  Turin,
];

export const takenFlights: Flight[] = [
  new Flight({ sCity: Cagliari, eCity: London }),
  new Flight({ sCity: London, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Berlin }),
  new Flight({ sCity: Berlin, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Barcelona }),
  new Flight({ sCity: Barcelona, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Bologna }),
  new Flight({ sCity: Bologna, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Rome }),
  new Flight({ sCity: Rome, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Cefalù }),
  new Flight({ sCity: Cefalù, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Rome }),
  new Flight({ sCity: Rome, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Budapest }),
  new Flight({ sCity: Budapest, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Brussels }),
  new Flight({ sCity: Brussels, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Turin }),
  new Flight({ sCity: Genoa, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Porto }),
  new Flight({ sCity: Porto, eCity: Cagliari }),
  new Flight({ sCity: Cagliari, eCity: Rome }),
  new Flight({ sCity: Rome, eCity: Tokyo }),
  new Flight({ sCity: Osaka, eCity: Tokyo }),
  new Flight({ sCity: Tokyo, eCity: Rome }),
  new Flight({ sCity: Rome, eCity: Cagliari }),
];

export const futureCountries = { Italy };
export const futureCities: City[] = [Verona];
