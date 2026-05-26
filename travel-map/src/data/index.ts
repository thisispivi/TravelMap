import { unique } from "remeda";

import {
  City,
  Country,
  Ferry,
  FerryCompany,
  Flight,
  FlightCompany,
  Image,
  TransportMode,
  Trip,
  TripRouteStep,
  TripStopStep,
  TripTransportStep,
} from "../core";
import { Cairns } from "./Australia/Cairns/Cairns";
import { Sydney } from "./Australia/Sydney/Sydney";
import { Vienna } from "./Austria/Vienna/Vienna";
import { Anderlecht } from "./Belgium/Anderlecht/Anderlecht";
import { Bruges } from "./Belgium/Bruges/Bruges";
import { Brussels } from "./Belgium/Brussels/Brussels";
import { Rila } from "./Bulgaria/Rila/Rila";
import { Sofia } from "./Bulgaria/Sofia/Sofia";
import { Shanghai } from "./China/Shanghai/Shanghai";
import { Ajaccio } from "./France/Ajaccio/Ajaccio";
import { Cannes } from "./France/Cannes/Cannes";
import { Marseille } from "./France/Marseille/Marseille";
import { Nice } from "./France/Nice/Nice";
import { SaintTropez } from "./France/SaintTropez/SaintTropez";
import { Toulon } from "./France/Toulon/Toulon";
import { Berlin } from "./Germany/Berlin/Berlin";
import { Budapest } from "./Hungary/Budapest/Budapest";
import { Alghero } from "./Italy/Alghero/Alghero";
import { Bergamo } from "./Italy/Bergamo/Bergamo";
import { Bologna } from "./Italy/Bologna/Bologna";
import { Cagliari } from "./Italy/Cagliari/Cagliari";
import { Cefalù } from "./Italy/Cefalù/Cefalù";
import { Genoa } from "./Italy/Genoa/Genoa";
import { Imola } from "./Italy/Imola/Imola";
import { Muravera } from "./Italy/Muravera/Muravera";
import { PeschieraDelGarda } from "./Italy/PeschieraDelGarda/PeschieraDelGarda";
import { PortoTorres } from "./Italy/PortoTorres/PortoTorres";
import { Rome } from "./Italy/Rome/Rome";
import { Terni } from "./Italy/Terni/Terni";
import { Turin } from "./Italy/Turin/Turin";
import { Verona } from "./Italy/Verona/Verona";
import { Fujikawaguchiko } from "./Japan/Fujikawaguchiko/Fujikawaguchiko";
import { Himeji } from "./Japan/Himeji/Himeji";
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
import { Mdina } from "./Malta/Mdina/Mdina";
import { Rabat } from "./Malta/Rabat/Rabat";
import { SanGiljan } from "./Malta/SanGiljan/SanGiljan";
import { SanPawlIlBahar } from "./Malta/SanPawlIlBahar/SanPawlIlBahar";
import { Sliema } from "./Malta/Sliema/Sliema";
import { Valletta } from "./Malta/Valletta/Valletta";
import { Victoria } from "./Malta/Victoria/Victoria";
import { MonteCarlo } from "./Monaco/MonteCarlo/MonteCarlo";
import { Braga } from "./Portugal/Braga/Braga";
import { Porto } from "./Portugal/Porto/Porto";
import { Bran } from "./Romania/Bran/Bran";
import { Brasov } from "./Romania/Brasov/Brasov";
import { Bucharest } from "./Romania/Bucharest/Bucharest";
import { Sinaia } from "./Romania/Sinaia/Sinaia";
import { Bratislava } from "./Slovakia/Bratislava/Bratislava";
import { Devin } from "./Slovakia/Devin/Devin";
import { Barcelona } from "./Spain/Barcelona/Barcelona";
import { Sevilla } from "./Spain/Sevilla/Sevilla";
import { Stockholm } from "./Sweden/Stockholm/Stockholm";
import { London } from "./UnitedKingdom/London/London";
import { VaticanCity } from "./Vatican/Vatican/VaticanCity";

const photoModules = import.meta.glob("./**/photos/tr_*.ts", {
  eager: true,
}) as Record<string, Record<string, Image[]>>;

const d = (...args: number[]) =>
  new Date(...(args as [number, number, number]));

function tripPhotos(path: string): Image[] {
  return Object.values(photoModules[`./${path}.ts`] ?? {})[0] ?? [];
}

function stay(
  city: City,
  sDate: Date,
  eDate: Date,
  photoPath?: string,
  data: Omit<
    Partial<TripStopStep>,
    "type" | "city" | "sDate" | "eDate" | "photos"
  > = {},
): TripStopStep {
  return {
    type: "stop",
    city,
    sDate,
    eDate,
    photos: photoPath ? tripPhotos(photoPath) : undefined,
    ...data,
  };
}

function layover(city: City, date: Date): TripStopStep {
  return stay(city, date, date, undefined, { isLayover: true });
}

function move(
  mode: TransportMode,
  from: City,
  to: City,
  data: Omit<TripTransportStep, "type" | "mode" | "from" | "to"> = {},
): TripTransportStep {
  return { type: "transport", mode, from, to, ...data };
}

const plane = (
  from: City,
  to: City,
  company?: FlightCompany,
  data: Omit<TripTransportStep, "type" | "mode" | "from" | "to"> = {},
) => move("plane", from, to, { ...data, flight: { company, ...data.flight } });

const ferry = (
  from: City,
  to: City,
  company?: FerryCompany,
  data: Omit<TripTransportStep, "type" | "mode" | "from" | "to"> = {},
) => move("ferry", from, to, { ...data, ferry: { company, ...data.ferry } });

function trip(
  id: string,
  sDate: Date,
  eDate: Date,
  origin: City,
  returnTo: City,
  steps: TripRouteStep[],
): Trip {
  return new Trip({
    id,
    sDate,
    eDate,
    origin: { city: origin },
    returnTo: { city: returnTo },
    steps,
    backgroundImgSourceKey: `${id}.jpg`,
  });
}

function roundTripByPlane(
  id: string,
  city: City,
  sDate: Date,
  eDate: Date,
  company: FlightCompany,
  photoPath: string,
  extraStops: TripRouteStep[] = [],
): Trip {
  return trip(id, sDate, eDate, Cagliari, Cagliari, [
    plane(Cagliari, city, company),
    stay(city, sDate, eDate, photoPath),
    ...extraStops,
    plane(city, Cagliari, company),
  ]);
}

export const livedCities: City[] = [Muravera, Cagliari];

export const futureCities: City[] = [Stockholm];

export const visitedTrips: Trip[] = [
  roundTripByPlane(
    "london-school-trip-2011",
    London,
    d(2011, 4, 9),
    d(2011, 4, 12),
    FlightCompany.EASYJET,
    "UnitedKingdom/London/photos/tr_090511_120511",
  ),
  roundTripByPlane(
    "berlin-school-trip-2015",
    Berlin,
    d(2015, 3, 15),
    d(2015, 3, 19),
    FlightCompany.RYANAIR,
    "Germany/Berlin/photos/tr_150415_190415",
  ),
  roundTripByPlane(
    "barcelona-school-trip-2016",
    Barcelona,
    d(2016, 3, 11),
    d(2016, 3, 15),
    FlightCompany.RYANAIR,
    "Spain/Barcelona/photos/tr_110416_150416",
  ),
  roundTripByPlane(
    "bologna-trip-2017",
    Bologna,
    d(2017, 10, 16),
    d(2017, 10, 19),
    FlightCompany.RYANAIR,
    "Italy/Bologna/photos/tr_161117_191117",
  ),
  trip("rome-trip-2021", d(2021, 6, 27), d(2021, 7, 3), Cagliari, Cagliari, [
    plane(Cagliari, Rome, FlightCompany.RYANAIR),
    stay(
      Rome,
      d(2021, 6, 27),
      d(2021, 7, 3),
      "Italy/Rome/photos/tr_270721_030821",
    ),
    stay(
      VaticanCity,
      d(2021, 6, 30),
      d(2021, 6, 30),
      "Vatican/Vatican/photos/tr_300721_300721",
    ),
    plane(Rome, Cagliari, FlightCompany.RYANAIR),
  ]),
  roundTripByPlane(
    "cefalù-trip-2021",
    Cefalù,
    d(2021, 8, 23),
    d(2021, 8, 26),
    FlightCompany.RYANAIR,
    "Italy/Cefalù/photos/tr_230921_260921",
  ),
  trip("terni-trip-2022", d(2022, 1, 27), d(2022, 1, 27), Cagliari, Cagliari, [
    move("car", Cagliari, Terni),
    stay(
      Terni,
      d(2022, 1, 27),
      d(2022, 1, 27),
      "Italy/Terni/photos/tr_270122_270122",
    ),
    move("car", Terni, Cagliari),
  ]),
  trip(
    "imola-f1-trip-2022",
    d(2022, 3, 22),
    d(2022, 3, 25),
    Cagliari,
    Cagliari,
    [
      move("car", Cagliari, Imola),
      stay(
        Imola,
        d(2022, 3, 22),
        d(2022, 3, 25),
        "Italy/Imola/photos/tr_220422_250422",
      ),
      move("car", Imola, Cagliari),
    ],
  ),
  roundTripByPlane(
    "budapest-trip-2023",
    Budapest,
    d(2023, 4, 6),
    d(2023, 4, 9),
    FlightCompany.RYANAIR,
    "Hungary/Budapest/photos/tr_060523_090523",
  ),
  trip("belgium-trip-2023", d(2023, 7, 5), d(2023, 7, 9), Cagliari, Cagliari, [
    plane(Cagliari, Brussels, FlightCompany.RYANAIR),
    stay(
      Brussels,
      d(2023, 7, 5),
      d(2023, 7, 10),
      "Belgium/Brussels/photos/tr_050823_100823",
    ),
    move("train", Brussels, Anderlecht),
    stay(
      Anderlecht,
      d(2023, 7, 6),
      d(2023, 7, 6),
      "Belgium/Anderlecht/photos/tr_060823_060823",
    ),
    move("train", Anderlecht, Bruges),
    stay(
      Bruges,
      d(2023, 7, 9),
      d(2023, 7, 9),
      "Belgium/Bruges/photos/tr_090823_090823",
    ),
    plane(Brussels, Cagliari, FlightCompany.RYANAIR),
  ]),
  trip(
    "turin-atp-trip-2023",
    d(2023, 10, 11),
    d(2023, 10, 14),
    Cagliari,
    Cagliari,
    [
      plane(Cagliari, Turin, FlightCompany.RYANAIR),
      stay(
        Turin,
        d(2023, 10, 11),
        d(2023, 10, 14),
        "Italy/Turin/photos/tr_111123_141123",
      ),
      move("train", Turin, Genoa),
      stay(
        Genoa,
        d(2023, 10, 14),
        d(2023, 10, 14),
        "Italy/Genoa/photos/tr_141123_141123",
      ),
      plane(Genoa, Cagliari, FlightCompany.RYANAIR),
    ],
  ),
  trip(
    "portugal-trip-2024",
    d(2024, 3, 19),
    d(2024, 3, 22),
    Cagliari,
    Cagliari,
    [
      plane(Cagliari, Porto, FlightCompany.RYANAIR),
      stay(
        Porto,
        d(2024, 3, 19),
        d(2024, 3, 22),
        "Portugal/Porto/photos/tr_190424_220424",
      ),
      move("train", Porto, Braga),
      stay(
        Braga,
        d(2024, 3, 20),
        d(2024, 3, 20),
        "Portugal/Braga/photos/tr_200424_200424",
      ),
      plane(Porto, Cagliari, FlightCompany.RYANAIR),
    ],
  ),
  trip("japan-trip-2024", d(2024, 7, 13), d(2024, 7, 25), Cagliari, Cagliari, [
    plane(Cagliari, Rome, FlightCompany.AEROITALIA),
    stay(
      Rome,
      d(2024, 7, 10),
      d(2024, 7, 12),
      "Italy/Rome/photos/tr_100824_120824",
    ),
    plane(Rome, Tokyo, FlightCompany.ITA_AIRWAYS),
    stay(
      Tokyo,
      d(2024, 7, 13),
      d(2024, 7, 18),
      "Japan/Tokyo/photos/tr_130824_180824",
    ),
    move("bus", Tokyo, Oshino),
    stay(
      Oshino,
      d(2024, 7, 15, 12),
      d(2024, 7, 15, 12),
      "Japan/Oshino/photos/tr_150824_150824",
    ),
    move("bus", Oshino, Fujikawaguchiko),
    stay(
      Fujikawaguchiko,
      d(2024, 7, 15, 13),
      d(2024, 7, 15, 13),
      "Japan/Fujikawaguchiko/photos/tr_150824_150824",
    ),
    move("bus", Tokyo, Matsumoto),
    stay(
      Matsumoto,
      d(2024, 7, 18),
      d(2024, 7, 18),
      "Japan/Matsumoto/photos/tr_180824_180824",
    ),
    move("bus", Matsumoto, Takayama),
    stay(
      Takayama,
      d(2024, 7, 18),
      d(2024, 7, 19),
      "Japan/Takayama/photos/tr_180824_190824",
    ),
    move("bus", Takayama, Shirakawago),
    stay(
      Shirakawago,
      d(2024, 7, 19),
      d(2024, 7, 19),
      "Japan/Shirakawago/photos/tr_190824_190824",
    ),
    move("bus", Shirakawago, Kanazawa),
    stay(
      Kanazawa,
      d(2024, 7, 19),
      d(2024, 7, 21),
      "Japan/Kanazawa/photos/tr_190824_210824",
    ),
    move("train", Kanazawa, Kyoto),
    stay(
      Kyoto,
      d(2024, 7, 21),
      d(2024, 7, 27),
      "Japan/Kyoto/photos/tr_210824_270824",
    ),
    move("train", Kyoto, Himeji),
    stay(
      Himeji,
      d(2024, 7, 23),
      d(2024, 7, 23),
      "Japan/Himeji/photos/tr_230824_230824",
    ),
    move("train", Himeji, Kobe),
    stay(
      Kobe,
      d(2024, 7, 23),
      d(2024, 7, 23),
      "Japan/Kobe/photos/tr_230824_230824",
    ),
    move("train", Kyoto, Nara),
    stay(
      Nara,
      d(2024, 7, 24),
      d(2024, 7, 24),
      "Japan/Nara/photos/tr_240824_240824",
    ),
    move("train", Nara, Osaka),
    stay(
      Osaka,
      d(2024, 7, 25),
      d(2024, 7, 25),
      "Japan/Osaka/photos/tr_250824_250824",
    ),
    plane(Osaka, Tokyo, FlightCompany.ALL_NIPPON_AIRWAYS),
    layover(Tokyo, d(2024, 7, 25)),
    plane(Tokyo, Rome, FlightCompany.ITA_AIRWAYS),
    layover(Rome, d(2024, 7, 25)),
    plane(Rome, Cagliari, FlightCompany.ITA_AIRWAYS),
  ]),
  trip("venetian-trip-2023", d(2024, 9, 4), d(2024, 9, 6), Cagliari, Cagliari, [
    plane(Cagliari, Verona, FlightCompany.RYANAIR),
    layover(Verona, d(2024, 9, 4)),
    move("train", Verona, PeschieraDelGarda),
    stay(
      PeschieraDelGarda,
      d(2024, 9, 4),
      d(2024, 9, 6),
      "Italy/PeschieraDelGarda/photos/tr_041024_061024",
    ),
    move("train", PeschieraDelGarda, Verona),
    stay(
      Verona,
      d(2024, 9, 6),
      d(2024, 9, 6),
      "Italy/Verona/photos/tr_061024_061024",
    ),
    plane(Verona, Cagliari, FlightCompany.RYANAIR),
  ]),
  trip("malta-trip-2025", d(2025, 0, 1), d(2025, 0, 5), Cagliari, Cagliari, [
    plane(Cagliari, Luqa, FlightCompany.RYANAIR),
    layover(Luqa, d(2025, 0, 1)),
    move("car", Luqa, Sliema),
    stay(
      Sliema,
      d(2025, 0, 1),
      d(2025, 0, 5),
      "Malta/Sliema/photos/tr_010125_050125",
    ),
    stay(
      Valletta,
      d(2025, 0, 2, 2),
      d(2025, 0, 2, 2),
      "Malta/Valletta/photos/tr_020125_020125",
    ),
    stay(
      Mdina,
      d(2025, 0, 2),
      d(2025, 0, 2),
      "Malta/Mdina/photos/tr_020125_020125",
    ),
    stay(
      Rabat,
      d(2025, 0, 2, 1),
      d(2025, 0, 2, 1),
      "Malta/Rabat/photos/tr_020125_020125",
    ),
    stay(
      Valletta,
      d(2025, 0, 3),
      d(2025, 0, 3),
      "Malta/Valletta/photos/tr_030125_030125",
    ),
    stay(
      SanGiljan,
      d(2025, 0, 2, 23),
      d(2025, 0, 2, 23),
      "Malta/SanGiljan/photos/tr_020125_020125",
    ),
    stay(
      SanPawlIlBahar,
      d(2025, 0, 4),
      d(2025, 0, 4),
      "Malta/SanPawlIlBahar/photos/tr_040125_040125",
    ),
    stay(
      Comino,
      d(2025, 0, 4, 11),
      d(2025, 0, 4, 11),
      "Malta/Comino/photos/tr_040125_040125",
    ),
    stay(
      Victoria,
      d(2025, 0, 4, 15),
      d(2025, 0, 4, 15),
      "Malta/Victoria/photos/tr_040125_040125",
    ),
    stay(
      SanGiljan,
      d(2025, 0, 4, 23),
      d(2025, 0, 4, 23),
      "Malta/SanGiljan/photos/tr_040125_040125",
      {
        rowConstraints: { minPhotos: 2, maxPhotos: 7 },
      },
    ),
    move("car", Sliema, Luqa),
    layover(Luqa, d(2025, 0, 5)),
    plane(Luqa, Cagliari, FlightCompany.RYANAIR),
  ]),
  roundTripByPlane(
    "sevilla-trip-2025",
    Sevilla,
    d(2025, 3, 4),
    d(2025, 3, 8),
    FlightCompany.RYANAIR,
    "Spain/Sevilla/photos/tr_040425_080425",
  ),
  roundTripByPlane(
    "vienna-trip-2025",
    Vienna,
    d(2025, 4, 17),
    d(2025, 4, 20),
    FlightCompany.RYANAIR,
    "Austria/Vienna/photos/tr_170525_200525",
  ),
  roundTripByPlane(
    "cefalù-trip-2025",
    Cefalù,
    d(2025, 5, 14),
    d(2025, 5, 17),
    FlightCompany.RYANAIR,
    "Italy/Cefalù/photos/tr_140625_170625",
  ),
  trip(
    "bulgaria-trip-2025",
    d(2025, 7, 17),
    d(2025, 7, 21),
    Cagliari,
    Cagliari,
    [
      move("car", Cagliari, Alghero),
      plane(Alghero, Sofia, FlightCompany.WIZZ_AIR),
      stay(
        Sofia,
        d(2025, 7, 17),
        d(2025, 7, 21),
        "Bulgaria/Sofia/photos/tr_170825_210825",
      ),
      move("car", Sofia, Rila),
      stay(
        Rila,
        d(2025, 7, 19),
        d(2025, 7, 19),
        "Bulgaria/Rila/photos/tr_190825_190825",
      ),
      plane(Sofia, Alghero, FlightCompany.WIZZ_AIR),
      move("car", Alghero, Cagliari),
    ],
  ),
  trip(
    "australia-trip-2025",
    d(2025, 10, 18),
    d(2025, 10, 28),
    Cagliari,
    Cagliari,
    [
      plane(Cagliari, Rome, FlightCompany.AEROITALIA),
      layover(Rome, d(2025, 10, 18)),
      plane(Rome, Shanghai, FlightCompany.CHINA_EASTERN_AIRLINES),
      layover(Shanghai, d(2025, 10, 19)),
      plane(Shanghai, Sydney, FlightCompany.CHINA_EASTERN_AIRLINES),
      stay(
        Sydney,
        d(2025, 10, 18),
        d(2025, 10, 20),
        "Australia/Sydney/photos/tr_181125_281125",
      ),
      plane(Sydney, Cairns, FlightCompany.JETSTAR),
      stay(
        Cairns,
        d(2025, 10, 20),
        d(2025, 10, 23),
        "Australia/Cairns/photos/tr_201125_231125",
      ),
      plane(Cairns, Sydney, FlightCompany.VIRGIN_AUSTRALIA),
      stay(
        Sydney,
        d(2025, 10, 23),
        d(2025, 10, 28),
        "Australia/Sydney/photos/tr_181125_281125",
      ),
      plane(Sydney, Shanghai, FlightCompany.CHINA_EASTERN_AIRLINES),
      layover(Shanghai, d(2025, 10, 28)),
      plane(Shanghai, Rome, FlightCompany.CHINA_EASTERN_AIRLINES),
      layover(Rome, d(2025, 10, 28)),
      plane(Rome, Cagliari, FlightCompany.AEROITALIA),
    ],
  ),
  trip(
    "cote-d-azur-trip-2025-2026",
    d(2025, 11, 28),
    d(2026, 0, 2),
    Muravera,
    Muravera,
    [
      move("car", Muravera, PortoTorres, {
        durationMinutes: 210,
        distanceInKm: 244,
      }),
      ferry(PortoTorres, Toulon, FerryCompany.CORSICA_FERRIES, {
        via: [Ajaccio],
        ferry: { via: [Ajaccio], durationMinutes: 900, distanceInKm: 506 },
      }),
      layover(Ajaccio, d(2025, 11, 28)),
      stay(Toulon, d(2025, 11, 28), d(2025, 11, 28)),
      move("car", Toulon, SaintTropez, {
        durationMinutes: 90,
        distanceInKm: 70,
      }),
      stay(
        SaintTropez,
        d(2025, 11, 28, 11),
        d(2025, 11, 28),
        "France/SaintTropez/photos/tr_281225_281225",
      ),
      move("car", SaintTropez, Nice, {
        durationMinutes: 100,
        distanceInKm: 112,
      }),
      stay(
        Nice,
        d(2025, 11, 28, 17),
        d(2025, 11, 31),
        "France/Nice/photos/tr_281225_311225",
      ),
      move("car", Nice, MonteCarlo, { durationMinutes: 35, distanceInKm: 22 }),
      stay(
        MonteCarlo,
        d(2025, 11, 29),
        d(2025, 11, 29),
        "Monaco/MonteCarlo/photos/tr_291225_291225",
      ),
      move("car", Nice, Cannes, { durationMinutes: 40, distanceInKm: 34 }),
      stay(
        Cannes,
        d(2025, 11, 31),
        d(2025, 11, 31),
        "France/Cannes/photos/tr_311225_311225",
      ),
      move("car", Cannes, Toulon, { durationMinutes: 95, distanceInKm: 126 }),
      stay(
        Toulon,
        d(2025, 11, 31, 15),
        d(2026, 0, 2),
        "France/Toulon/photos/tr_281225_020126",
      ),
      move("car", Toulon, Marseille, { durationMinutes: 55, distanceInKm: 66 }),
      stay(
        Marseille,
        d(2026, 0, 1),
        d(2026, 0, 1),
        "France/Marseille/photos/tr_010126_010126",
      ),
      move("car", Marseille, Toulon, { durationMinutes: 55, distanceInKm: 66 }),
      ferry(Toulon, PortoTorres, FerryCompany.CORSICA_FERRIES, {
        via: [Ajaccio],
        ferry: { via: [Ajaccio], durationMinutes: 900, distanceInKm: 506 },
      }),
      layover(Ajaccio, d(2026, 0, 2)),
      move("car", PortoTorres, Muravera, {
        durationMinutes: 210,
        distanceInKm: 244,
      }),
    ],
  ),
  trip(
    "romania-trip-2026",
    d(2026, 2, 26),
    d(2026, 2, 31),
    Cagliari,
    Cagliari,
    [
      plane(Cagliari, Bergamo, FlightCompany.RYANAIR),
      layover(Bergamo, d(2026, 2, 26)),
      plane(Bergamo, Bucharest, FlightCompany.RYANAIR),
      stay(
        Bucharest,
        d(2026, 2, 26),
        d(2026, 2, 30),
        "Romania/Bucharest/photos/tr_260326_300326",
      ),
      move("car", Bucharest, Sinaia),
      stay(
        Sinaia,
        d(2026, 2, 27),
        d(2026, 2, 27),
        "Romania/Sinaia/photos/tr_270326_270326",
      ),
      move("car", Sinaia, Brasov),
      stay(
        Brasov,
        d(2026, 2, 27),
        d(2026, 2, 27),
        "Romania/Brasov/photos/tr_270326_270326",
      ),
      move("car", Brasov, Bran),
      stay(
        Bran,
        d(2026, 2, 27),
        d(2026, 2, 27),
        "Romania/Bran/photos/tr_270326_270326",
      ),
      plane(Bucharest, Bergamo, FlightCompany.RYANAIR),
      layover(Bergamo, d(2026, 2, 31)),
      plane(Bergamo, Cagliari, FlightCompany.RYANAIR),
    ],
  ),
  trip("slovakia-trip-2026", d(2026, 4, 1), d(2026, 4, 4), Cagliari, Cagliari, [
    move("car", Cagliari, Alghero),
    plane(Alghero, Bratislava, FlightCompany.RYANAIR),
    stay(
      Bratislava,
      d(2026, 4, 1),
      d(2026, 4, 4),
      "Slovakia/Bratislava/photos/tr_010526_040526",
    ),
    move("car", Bratislava, Devin),
    stay(
      Devin,
      d(2026, 4, 3),
      d(2026, 4, 3),
      "Slovakia/Devin/photos/tr_030526_030526",
    ),
    plane(Bratislava, Alghero, FlightCompany.RYANAIR),
    move("car", Alghero, Cagliari),
  ]),
];

export const visitedCities: City[] = unique(
  visitedTrips.flatMap((trip) =>
    trip.destinations
      .filter((destination) => !destination.isLayover)
      .map(({ city }) => city),
  ),
).sort((a, b) => a.name.localeCompare(b.name));

export const visitedCountries: Country[] = unique(
  visitedCities.map((city) => city.country),
).sort((a, b) => a.id.localeCompare(b.id));

export const takenFlights: Flight[] = visitedTrips.flatMap((trip) =>
  trip.getFlights(),
);

export const takenFerries: Ferry[] = visitedTrips.flatMap((trip) =>
  trip.getFerries(),
);
