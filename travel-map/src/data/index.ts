import { FlightCompany } from "@/core";
import { Ferry } from "@/core/classes/Ferry";
import { FerryCompany } from "@/core/typings/FerryCompany";

import { City, Country, Trip } from "../core";
import { Flight } from "../core";
import { Australia } from "./Australia/Australia";
import { Cairns } from "./Australia/Cairns/Cairns";
import { Sydney } from "./Australia/Sydney/Sydney";
import { Austria } from "./Austria/Austria";
import { Vienna } from "./Austria/Vienna/Vienna";
import { Anderlecht } from "./Belgium/Anderlecht/Anderlecht";
import { Belgium } from "./Belgium/Belgium";
import { Bruges } from "./Belgium/Bruges/Bruges";
import { Brussels } from "./Belgium/Brussels/Brussels";
import { Bulgaria } from "./Bulgaria/Bulgaria";
import { Rila } from "./Bulgaria/Rila/Rila";
import { Sofia } from "./Bulgaria/Sofia/Sofia";
import { Shanghai } from "./China/Shanghai/Shanghai";
import { Cannes } from "./France/Cannes/Cannes";
import { France } from "./France/France";
import { Marseille } from "./France/Marseille/Marseille";
import { Nice } from "./France/Nice/Nice";
import { SaintTropez } from "./France/SaintTropez/SaintTropez";
import { Toulon } from "./France/Toulon/Toulon";
import { Berlin } from "./Germany/Berlin/Berlin";
import { Germany } from "./Germany/Germany";
import { Budapest } from "./Hungary/Budapest/Budapest";
import { Hungary } from "./Hungary/Hungary";
import { Alghero } from "./Italy/Alghero/Alghero";
import { Bologna } from "./Italy/Bologna/Bologna";
import { Cagliari } from "./Italy/Cagliari/Cagliari";
import { Cefalù } from "./Italy/Cefalù/Cefalù";
import { Genoa } from "./Italy/Genoa/Genoa";
import { Imola } from "./Italy/Imola/Imola";
import { Italy } from "./Italy/Italy";
import { Livorno } from "./Italy/Livorno/Livorno";
import { Muravera } from "./Italy/Muravera/Muravera";
import { Olbia } from "./Italy/Olbia/Olbia";
import { PeschieraDelGarda } from "./Italy/PeschieraDelGarda/PeschieraDelGarda";
import { PortoTorres } from "./Italy/PortoTorres/PortoTorres";
import { Rome } from "./Italy/Rome/Rome";
import { Terni } from "./Italy/Terni/Terni";
import { Turin } from "./Italy/Turin/Turin";
import { Verona } from "./Italy/Verona/Verona";
import { Fujikawaguchiko } from "./Japan/Fujikawaguchiko/Fujikawaguchiko";
import { Himeji } from "./Japan/Himeji/Himeji";
import { Japan } from "./Japan/Japan";
import { Kanazawa } from "./Japan/Kanazawa/Kanazawa";
import { Kobe } from "./Japan/Kobe/Kobe";
import { Kyoto } from "./Japan/Kyoto/Kyoto";
import { Matsumoto } from "./Japan/Matsumoto/Matsumoto";
import { Nara } from "./Japan/Nara/Nara";
import { Osaka } from "./Japan/Osaka/Osaka";
import { Oshino } from "./Japan/Oshino/Oshino";
import { Shirakawago } from "./Japan/Shirakawago/Shirakawago";
import { Takayama } from "./Japan/Takayama/Takayama";
import { Tokyo } from "./Japan/Tokyo/Tokyo";
import { Comino } from "./Malta/Comino/Comino";
import { Luqa } from "./Malta/Luqa/Luqa";
import { Malta } from "./Malta/Malta";
import { Mdina } from "./Malta/Mdina/Mdina";
import { Rabat } from "./Malta/Rabat/Rabat";
import { SanGiljan } from "./Malta/SanGiljan/SanGiljan";
import { SanPawlIlBahar } from "./Malta/SanPawlIlBahar/SanPawlIlBahar";
import { Sliema } from "./Malta/Sliema/Sliema";
import { Valletta } from "./Malta/Valletta/Valletta";
import { Victoria } from "./Malta/Victoria/Victoria";
import { Monaco } from "./Monaco/Monaco";
import { MonteCarlo } from "./Monaco/MonteCarlo/MonteCarlo";
import { Braga } from "./Portugal/Braga/Braga";
import { Porto } from "./Portugal/Porto/Porto";
import { Portugal } from "./Portugal/Portugal";
import { Barcelona } from "./Spain/Barcelona/Barcelona";
import { Sevilla } from "./Spain/Sevilla/Sevilla";
import { Spain } from "./Spain/Spain";
import { London } from "./UnitedKingdom/London/London";
import { UnitedKingdom } from "./UnitedKingdom/UnitedKingdom";
import { Vatican } from "./Vatican/Vatican";
import { VaticanCity } from "./Vatican/Vatican/VaticanCity";

export const livedCountries: Country[] = [Italy];
export const livedCities: City[] = [Muravera, Cagliari];

export const visitedCountries: Country[] = [
  Australia,
  Austria,
  Belgium,
  Bulgaria,
  France,
  Germany,
  Hungary,
  Italy,
  Japan,
  Malta,
  Monaco,
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
  Cairns,
  Cannes,
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
  Marseille,
  Matsumoto,
  Mdina,
  MonteCarlo,
  Nara,
  Nice,
  Osaka,
  Oshino,
  PeschieraDelGarda,
  Porto,
  Rabat,
  Rila,
  Rome,
  SaintTropez,
  SanGiljan,
  SanPawlIlBahar,
  Sevilla,
  Shirakawago,
  Sliema,
  Sofia,
  Sydney,
  Takayama,
  Terni,
  Tokyo,
  Toulon,
  Turin,
  Valletta,
  VaticanCity,
  Verona,
  Victoria,
  Vienna,
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
  new Flight({
    sCity: Cagliari,
    eCity: Rome,
    company: FlightCompany.AEROITALIA,
  }),
  new Flight({
    sCity: Rome,
    eCity: Shanghai,
    company: FlightCompany.CHINA_EASTERN_AIRLINES,
  }),
  new Flight({
    sCity: Shanghai,
    eCity: Sydney,
    company: FlightCompany.CHINA_EASTERN_AIRLINES,
  }),
  new Flight({
    sCity: Sydney,
    eCity: Cairns,
    company: FlightCompany.JETSTAR,
  }),
  new Flight({
    sCity: Sydney,
    eCity: Cairns,
    company: FlightCompany.VIRGIN_AUSTRALIA,
  }),
  new Flight({
    sCity: Sydney,
    eCity: Shanghai,
    company: FlightCompany.CHINA_EASTERN_AIRLINES,
  }),
  new Flight({
    sCity: Shanghai,
    eCity: Rome,
    company: FlightCompany.CHINA_EASTERN_AIRLINES,
  }),
  new Flight({
    sCity: Rome,
    eCity: Cagliari,
    company: FlightCompany.AEROITALIA,
  }),
];

export const takenFerries: Ferry[] = [
  new Ferry({ sCity: Olbia, eCity: Livorno, company: FerryCompany.TIRRENIA }),
  new Ferry({ sCity: Livorno, eCity: Olbia, company: FerryCompany.TIRRENIA }),
  new Ferry({
    sCity: PortoTorres,
    eCity: Toulon,
    company: FerryCompany.CORSICA_FERRIES,
  }),
  new Ferry({
    sCity: Toulon,
    eCity: PortoTorres,
    company: FerryCompany.CORSICA_FERRIES,
  }),
];

export const futureCountries: Country[] = [];
export const futureCities: City[] = [];

export const visitedTrips: Trip[] = [
  new Trip({
    id: "london-school-trip-2011",
    name: "London Trip",
    sDate: new Date(2011, 4, 9),
    eDate: new Date(2011, 4, 12),
    destinations: [{ city: London, travelIdx: 0 }],
    route: [London.name],
    backgroundImgSourceKey: "london-school-trip-2011.jpg",
  }),
  new Trip({
    id: "berlin-school-trip-2015",
    name: "Berlin School Trip",
    sDate: new Date(2015, 3, 15),
    eDate: new Date(2015, 3, 19),
    destinations: [{ city: Berlin, travelIdx: 0 }],
    route: [Berlin.name],
    backgroundImgSourceKey: "berlin-school-trip-2015.jpg",
  }),
  new Trip({
    id: "barcelona-school-trip-2016",
    name: "Barcelona School Trip",
    sDate: new Date(2016, 3, 11),
    eDate: new Date(2016, 3, 15),
    destinations: [{ city: Barcelona, travelIdx: 0 }],
    route: [Barcelona.name],
    backgroundImgSourceKey: "barcelona-school-trip-2016.jpg",
  }),
  new Trip({
    id: "bologna-trip-2017",
    name: "Bologna Trip",
    sDate: new Date(2017, 10, 16),
    eDate: new Date(2017, 10, 19),
    destinations: [{ city: Bologna, travelIdx: 0 }],
    route: [Bologna.name],
    backgroundImgSourceKey: "bologna-trip-2017.jpg",
  }),
  new Trip({
    id: "rome-trip-2021",
    name: "Rome Trip",
    sDate: new Date(2021, 6, 27),
    eDate: new Date(2021, 7, 3),
    destinations: [
      { city: Rome, travelIdx: 0 },
      { city: VaticanCity, travelIdx: 0 },
    ],
    route: [Rome.name, VaticanCity.name],
    backgroundImgSourceKey: "rome-trip-2021.jpg",
  }),
  new Trip({
    id: "cefalù-trip-2021",
    name: "Cefalù Trip",
    sDate: new Date(2021, 8, 23),
    eDate: new Date(2021, 8, 26),
    destinations: [{ city: Cefalù, travelIdx: 0 }],
    route: [Cefalù.name],
    backgroundImgSourceKey: "cefalù-trip-2021.jpg",
  }),
  new Trip({
    id: "terni-trip-2022",
    name: "Terni Trip",
    sDate: new Date(2022, 1, 27),
    eDate: new Date(2022, 1, 27),
    destinations: [{ city: Terni, travelIdx: 0 }],
    route: [Terni.name],
    backgroundImgSourceKey: "terni-trip-2022.jpg",
  }),
  new Trip({
    id: "imola-f1-trip-2022",
    name: "Imola F1 Trip",
    sDate: new Date(2022, 3, 22),
    eDate: new Date(2022, 3, 25),
    destinations: [{ city: Imola, travelIdx: 0 }],
    route: [Imola.name],
    backgroundImgSourceKey: "imola-f1-trip-2022.jpg",
  }),
  new Trip({
    id: "budapest-trip-2023",
    name: "Budapest Trip",
    sDate: new Date(2023, 4, 6),
    eDate: new Date(2023, 4, 9),
    destinations: [{ city: Budapest, travelIdx: 0 }],
    route: [Budapest.name],
    backgroundImgSourceKey: "budapest-trip-2023.jpg",
  }),
  new Trip({
    id: "belgium-trip-2023",
    name: "Belgium Trip",
    sDate: new Date(2023, 7, 5),
    eDate: new Date(2023, 7, 9),
    destinations: [
      { city: Brussels, travelIdx: 0 },
      { city: Anderlecht, travelIdx: 0 },
      { city: Bruges, travelIdx: 0 },
    ],
    route: [Brussels.name, Anderlecht.name, Bruges.name],
    backgroundImgSourceKey: "belgium-trip-2023.jpg",
  }),
  new Trip({
    id: "turin-atp-trip-2023",
    name: "Turin ATP Trip",
    sDate: new Date(2023, 10, 11),
    eDate: new Date(2023, 10, 14),
    destinations: [
      { city: Turin, travelIdx: 0 },
      { city: Genoa, travelIdx: 0 },
    ],
    route: [Turin.name, Genoa.name],
    backgroundImgSourceKey: "turin-atp-trip-2023.jpg",
  }),
  new Trip({
    id: "portugal-trip-2024",
    name: "Portugal Trip",
    sDate: new Date(2024, 3, 19),
    eDate: new Date(2024, 3, 22),
    destinations: [
      { city: Porto, travelIdx: 0 },
      { city: Braga, travelIdx: 0 },
    ],
    route: [Porto.name, Braga.name],
    backgroundImgSourceKey: "portugal-trip-2024.jpg",
  }),
  new Trip({
    id: "japan-trip-2024",
    name: "Japan Trip",
    sDate: new Date(2024, 7, 13),
    eDate: new Date(2024, 7, 25),
    backgroundImgSourceKey: "japan-trip-2024.jpg",
    destinations: [
      { city: Rome, travelIdx: 1 },
      { city: Tokyo, travelIdx: 0 },
      { city: Oshino, travelIdx: 0 },
      { city: Fujikawaguchiko, travelIdx: 0 },
      { city: Matsumoto, travelIdx: 0 },
      { city: Takayama, travelIdx: 0 },
      { city: Shirakawago, travelIdx: 0 },
      { city: Kanazawa, travelIdx: 0 },
      { city: Kyoto, travelIdx: 0 },
      { city: Himeji, travelIdx: 0 },
      { city: Kobe, travelIdx: 0 },
      { city: Nara, travelIdx: 0 },
      { city: Osaka, travelIdx: 0 },
    ],
    route: [
      Rome.name,
      Tokyo.name,
      Oshino.name,
      Fujikawaguchiko.name,
      Matsumoto.name,
      Takayama.name,
      Shirakawago.name,
      Kanazawa.name,
      Kyoto.name,
      Himeji.name,
      Kobe.name,
      Nara.name,
      Osaka.name,
    ],
  }),
  new Trip({
    id: "venetian-trip-2023",
    name: "Venetian Trip",
    sDate: new Date(2024, 9, 4),
    eDate: new Date(2024, 9, 6),
    destinations: [
      { city: PeschieraDelGarda, travelIdx: 0 },
      { city: Verona, travelIdx: 0 },
    ],
    route: [PeschieraDelGarda.name, Verona.name],
    backgroundImgSourceKey: "venetian-trip-2023.jpg",
  }),
  new Trip({
    id: "malta-trip-2025",
    name: "Malta Trip",
    sDate: new Date(2025, 0, 1),
    eDate: new Date(2025, 0, 5),
    destinations: [
      { city: Valletta, travelIdx: 0 },
      { city: Sliema, travelIdx: 0 },
      { city: SanGiljan, travelIdx: 0 },
      { city: SanPawlIlBahar, travelIdx: 0 },
      { city: Mdina, travelIdx: 0 },
      { city: Rabat, travelIdx: 0 },
      { city: Comino, travelIdx: 0 },
      { city: Victoria, travelIdx: 0 },
    ],
    route: [
      Sliema.name,
      Mdina.name,
      Rabat.name,
      Valletta.name,
      SanGiljan.name,
      SanPawlIlBahar.name,
      Comino.name,
      Victoria.name,
    ],
    backgroundImgSourceKey: "malta-trip-2025.jpg",
  }),
  new Trip({
    id: "vienna-trip-2025",
    name: "Vienna Trip",
    sDate: new Date(2025, 4, 17),
    eDate: new Date(2025, 4, 20),
    destinations: [{ city: Vienna, travelIdx: 0 }],
    route: [Vienna.name],
    backgroundImgSourceKey: "vienna-trip-2025.jpg",
  }),
  new Trip({
    id: "sevilla-trip-2025",
    name: "Sevilla Trip",
    sDate: new Date(2025, 3, 4),
    eDate: new Date(2025, 3, 8),
    destinations: [{ city: Sevilla, travelIdx: 0 }],
    route: [Sevilla.name],
    backgroundImgSourceKey: "sevilla-trip-2025.jpg",
  }),
  new Trip({
    id: "cefalù-trip-2025",
    name: "Cefalù Trip",
    sDate: new Date(2025, 4, 17),
    eDate: new Date(2025, 4, 20),
    destinations: [{ city: Cefalù, travelIdx: 1 }],
    route: [Cefalù.name],
    backgroundImgSourceKey: "cefalù-trip-2025.jpg",
  }),
  new Trip({
    id: "bulgaria-trip-2025",
    name: "Bulgaria Trip",
    sDate: new Date(2025, 7, 17),
    eDate: new Date(2025, 7, 21),
    destinations: [
      { city: Sofia, travelIdx: 0 },
      { city: Rila, travelIdx: 0 },
    ],
    route: [Sofia.name, Rila.name],
    backgroundImgSourceKey: "bulgaria-trip-2025.jpg",
  }),
  new Trip({
    id: "australia-trip-2025",
    name: "Australia Trip",
    sDate: new Date(2025, 10, 18),
    eDate: new Date(2025, 10, 28),
    destinations: [
      { city: Sydney, travelIdx: 0 },
      { city: Cairns, travelIdx: 0 },
    ],
    route: [Sydney.name, Cairns.name],
    backgroundImgSourceKey: "australia-trip-2025.jpg",
  }),
  new Trip({
    id: "cote-d-azur-trip-2025-2026",
    name: "Côte d'Azur Trip",
    sDate: new Date(2025, 11, 28),
    eDate: new Date(2026, 0, 2),
    destinations: [
      { city: Toulon, travelIdx: 0 },
      { city: SaintTropez, travelIdx: 0 },
      { city: Nice, travelIdx: 0 },
      { city: MonteCarlo, travelIdx: 0 },
      { city: Cannes, travelIdx: 0 },
      { city: Marseille, travelIdx: 0 },
    ],
    route: [
      Toulon.name,
      SaintTropez.name,
      Nice.name,
      MonteCarlo.name,
      Cannes.name,
      Marseille.name,
      Toulon.name,
    ],
    backgroundImgSourceKey: "cote-d-azur-trip-2025-2026.jpg",
  }),
];
