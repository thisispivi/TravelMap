import { Anderlecht } from "./Belgium/Anderlecht/Anderlecht";
import { Austria } from "./Austria/Austria";
import { Barcelona } from "./Spain/Barcelona/Barcelona";
import { Belgium } from "./Belgium/Belgium";
import { Berlin } from "./Germany/Berlin/Berlin";
import { Bologna } from "./Italy/Bologna/Bologna";
import { Braga } from "./Portugal/Braga/Braga";
import { Bruges } from "./Belgium/Bruges/Bruges";
import { Brussels } from "./Belgium/Brussels/Brussels";
import { Budapest } from "./Hungary/Budapest/Budapest";
import { Cagliari } from "./Italy/Cagliari/Cagliari";
import { Cefalù } from "./Italy/Cefalù/Cefalù";
import { City, Country } from "../core";
import { Comino } from "./Malta/Comino/Comino";
import { Flight } from "../core";
import { Fujikawaguchiko } from "./Japan/Fujikawaguchiko/Fujikawaguchiko";
import { Genoa } from "./Italy/Genoa/Genoa";
import { Germany } from "./Germany/Germany";
import { Himeji } from "./Japan/Himeji/Himeji";
import { Hungary } from "./Hungary/Hungary";
import { Imola } from "./Italy/Imola/Imola";
import { Italy } from "./Italy/Italy";
import { Japan } from "./Japan/Japan";
import { Kanazawa } from "./Japan/Kanazawa/Kanazawa";
import { Kobe } from "./Japan/Kobe/Kobe";
import { Kyoto } from "./Japan/Kyoto/Kyoto";
import { London } from "./UnitedKingdom/London/London";
import { Luqa } from "./Malta/Luqa/Luqa";
import { Malta } from "./Malta/Malta";
import { Matsumoto } from "./Japan/Matsumoto/Matsumoto";
import { Mdina } from "./Malta/Mdina/Mdina";
import { Muravera } from "./Italy/Muravera/Muravera";
import { Nara } from "./Japan/Nara/Nara";
import { Osaka } from "./Japan/Osaka/Osaka";
import { Oshino } from "./Japan/Oshino/Oshino";
import { PeschieraDelGarda } from "./Italy/PeschieraDelGarda/PeschieraDelGarda";
import { Porto } from "./Portugal/Porto/Porto";
import { Portugal } from "./Portugal/Portugal";
import { Rabat } from "./Malta/Rabat/Rabat";
import { Rome } from "./Italy/Rome/Rome";
import { SanGiljan } from "./Malta/SanGiljan/SanGiljan";
import { SanPawlIlBahar } from "./Malta/SanPawlIlBahar/SanPawlIlBahar";
import { Shirakawago } from "./Japan/Shirakawago/Shirakawago";
import { Sliema } from "./Malta/Sliema/Sliema";
import { Spain } from "./Spain/Spain";
import { Takayama } from "./Japan/Takayama/Takayama";
import { Terni } from "./Italy/Terni/Terni";
import { Tokyo } from "./Japan/Tokyo/Tokyo";
import { Turin } from "./Italy/Turin/Turin";
import { UnitedKingdom } from "./UnitedKingdom/UnitedKingdom";
import { Valletta } from "./Malta/Valletta/Valletta";
import { Vatican } from "./Vatican/Vatican";
import { VaticanCity } from "./Vatican/Vatican/VaticanCity";
import { Verona } from "./Italy/Verona/Verona";
import { Victoria } from "./Malta/Victoria/Victoria";
import { Vienna } from "./Austria/Vienna/Vienna";

export const livedCountries: Country[] = [Italy];
export const livedCities: City[] = [Muravera, Cagliari];

export const visitedCountries: Country[] = [
  Belgium,
  Germany,
  Hungary,
  Italy,
  Japan,
  Malta,
  Portugal,
  Spain,
  UnitedKingdom,
  Vatican,
];
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
  Comino,
  Fujikawaguchiko,
  Genoa,
  Himeji,
  Imola,
  Kanazawa,
  Kobe,
  Kyoto,
  London,
  Matsumoto,
  Mdina,
  Nara,
  Osaka,
  Oshino,
  PeschieraDelGarda,
  Porto,
  Rabat,
  Rome,
  SanGiljan,
  Shirakawago,
  Sliema,
  Takayama,
  Terni,
  Tokyo,
  Turin,
  Valletta,
  VaticanCity,
  Verona,
  Victoria,
  SanPawlIlBahar,
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
  new Flight({ sCity: Cagliari, eCity: Luqa }),
  new Flight({ sCity: Luqa, eCity: Cagliari }),
];

export const futureCountries: Country[] = [Austria];
export const futureCities: City[] = [Vienna];
