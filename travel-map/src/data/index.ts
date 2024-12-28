import { City } from "../core";
import { Flight } from "../core/classes/Flight";

import { Anderlecht } from "./Belgium/Anderlecht/Anderlecht";
import { Barcelona } from "./Spain/Barcelona/Barcelona";
import { Berlin } from "./Germany/Berlin/Berlin";
import { Bologna } from "./Italy/Bologna/Bologna";
import { Braga } from "./Portugal/Braga/Braga";
import { Bruges } from "./Belgium/Bruges/Bruges";
import { Brussels } from "./Belgium/Brussels/Brussels";
import { Budapest } from "./Hungary/Budapest/Budapest";
import { Cagliari } from "./Italy/Cagliari/Cagliari";
import { Cefalù } from "./Italy/Cefalù/Cefalù";
import { Fujikawaguchiko } from "./Japan/Fujikawaguchiko/Fujikawaguchiko";
import { Genoa } from "./Italy/Genoa/Genoa";
import { Himeji } from "./Japan/Himeji/Himeji";
import { Imola } from "./Italy/Imola/Imola";
import { Kanazawa } from "./Japan/Kanazawa/Kanazawa";
import { Kobe } from "./Japan/Kobe/Kobe";
import { Kyoto } from "./Japan/Kyoto/Kyoto";
import { London } from "./UnitedKingdom/London/London";
import { Matsumoto } from "./Japan/Matsumoto/Matsumoto";
import { Mdina } from "./Malta/Mdina/Mdina";
import { Muravera } from "./Italy/Muravera/Muravera";
import { Nara } from "./Japan/Nara/Nara";
import { Osaka } from "./Japan/Osaka/Osaka";
import { Oshino } from "./Japan/Oshino/Oshino";
import { PeschieraDelGarda } from "./Italy/PeschieraDelGarda/PeschieraDelGarda";
import { Porto } from "./Portugal/Porto/Porto";
import { Rabat } from "./Malta/Rabat/Rabat";
import { Rome } from "./Italy/Rome/Rome";
import { Shirakawago } from "./Japan/Shirakawago/Shirakawago";
import { Sliema } from "./Malta/Sliema/Sliema";
import { Takayama } from "./Japan/Takayama/Takayama";
import { Terni } from "./Italy/Terni/Terni";
import { Tokyo } from "./Japan/Tokyo/Tokyo";
import { Turin } from "./Italy/Turin/Turin";
import { Valletta } from "./Malta/Valletta/Valletta";
import { VaticanCity } from "./Vatican/Vatican/VaticanCity";
import { Verona } from "./Italy/Verona/Verona";

import { Belgium } from "./Belgium/Belgium";
import { Germany } from "./Germany/Germany";
import { Hungary } from "./Hungary/Hungary";
import { Italy } from "./Italy/Italy";
import { Japan } from "./Japan/Japan";
import { Malta } from "./Malta/Malta";
import { Portugal } from "./Portugal/Portugal";
import { Spain } from "./Spain/Spain";
import { UnitedKingdom } from "./UnitedKingdom/UnitedKingdom";
import { Vatican } from "./Vatican/Vatican";

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
  Vatican,
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
  PeschieraDelGarda,
  Porto,
  Rome,
  Shirakawago,
  Takayama,
  Terni,
  Tokyo,
  Turin,
  VaticanCity,
  Verona,
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
  new Flight({ sCity: Cagliari, eCity: Verona }),
  new Flight({ sCity: Verona, eCity: Cagliari }),
];

export const futureCountries = { Malta };
export const futureCities: City[] = [Sliema, Valletta, Rabat, Mdina];
