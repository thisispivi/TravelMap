import { Alghero } from "./Italy/Alghero/Alghero";
import { Anderlecht } from "./Belgium/Anderlecht/Anderlecht";
import { Australia } from "./Australia/Australia";
import { Austria } from "./Austria/Austria";
import { Barcelona } from "./Spain/Barcelona/Barcelona";
import { Belgium } from "./Belgium/Belgium";
import { Berlin } from "./Germany/Berlin/Berlin";
import { Bologna } from "./Italy/Bologna/Bologna";
import { Braga } from "./Portugal/Braga/Braga";
import { Bruges } from "./Belgium/Bruges/Bruges";
import { Brussels } from "./Belgium/Brussels/Brussels";
import { Budapest } from "./Hungary/Budapest/Budapest";
import { Bulgaria } from "./Bulgaria/Bulgaria";
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
import { Rila } from "./Bulgaria/Rila/Rila";
import { Rome } from "./Italy/Rome/Rome";
import { SanGiljan } from "./Malta/SanGiljan/SanGiljan";
import { SanPawlIlBahar } from "./Malta/SanPawlIlBahar/SanPawlIlBahar";
import { Sevilla } from "./Spain/Sevilla/Sevilla";
import { Shirakawago } from "./Japan/Shirakawago/Shirakawago";
import { Sliema } from "./Malta/Sliema/Sliema";
import { Sofia } from "./Bulgaria/Sofia/Sofia";
import { Spain } from "./Spain/Spain";
import { Sydney } from "./Australia/Sydney/Sydney";
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
import { FlightCompany } from "@/core";

export const livedCountries: Country[] = [Italy];
export const livedCities: City[] = [Muravera, Cagliari];

export const visitedCountries: Country[] = [
  Austria,
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
  Bulgaria,
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
  SanPawlIlBahar,
  Sevilla,
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
  Vienna,
  Sofia,
  Rila,
];

export const takenFlights: Flight[] = [
  new Flight({
    sCity: Cagliari,
    eCity: London,
    company: FlightCompany.EASYJET,
  }),
  new Flight({
    sCity: London,
    eCity: Cagliari,
    company: FlightCompany.EASYJET,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Berlin,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Berlin,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Barcelona,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Barcelona,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Bologna,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Bologna,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({ sCity: Cagliari, eCity: Rome, company: FlightCompany.RYANAIR }),
  new Flight({ sCity: Rome, eCity: Cagliari, company: FlightCompany.RYANAIR }),
  new Flight({
    sCity: Cagliari,
    eCity: Cefalù,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cefalù,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Rome,
    company: FlightCompany.ITA_AIRWAYS,
  }),
  new Flight({
    sCity: Rome,
    eCity: Cagliari,
    company: FlightCompany.ITA_AIRWAYS,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Budapest,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Budapest,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Brussels,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Brussels,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({ sCity: Cagliari, eCity: Turin, company: FlightCompany.RYANAIR }),
  new Flight({ sCity: Genoa, eCity: Cagliari, company: FlightCompany.RYANAIR }),
  new Flight({ sCity: Cagliari, eCity: Porto, company: FlightCompany.RYANAIR }),
  new Flight({ sCity: Porto, eCity: Cagliari, company: FlightCompany.RYANAIR }),
  new Flight({
    sCity: Cagliari,
    eCity: Rome,
    company: FlightCompany.ITA_AIRWAYS,
  }),
  new Flight({ sCity: Rome, eCity: Tokyo, company: FlightCompany.ITA_AIRWAYS }),
  new Flight({
    sCity: Osaka,
    eCity: Tokyo,
    company: FlightCompany.ALL_NIPPON_AIRWAYS,
  }),
  new Flight({ sCity: Tokyo, eCity: Rome, company: FlightCompany.ITA_AIRWAYS }),
  new Flight({
    sCity: Rome,
    eCity: Cagliari,
    company: FlightCompany.ITA_AIRWAYS,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Verona,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Verona,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({ sCity: Cagliari, eCity: Luqa, company: FlightCompany.RYANAIR }),
  new Flight({ sCity: Luqa, eCity: Cagliari, company: FlightCompany.RYANAIR }),
  new Flight({
    sCity: Cagliari,
    eCity: Sevilla,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Sevilla,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Vienna,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Vienna,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cagliari,
    eCity: Cefalù,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({
    sCity: Cefalù,
    eCity: Cagliari,
    company: FlightCompany.RYANAIR,
  }),
  new Flight({ sCity: Alghero, eCity: Sofia, company: FlightCompany.WIZZ_AIR }),
  new Flight({ sCity: Sofia, eCity: Alghero, company: FlightCompany.WIZZ_AIR }),
];

export const futureCountries: Country[] = [Australia];
export const futureCities: City[] = [Sydney];
