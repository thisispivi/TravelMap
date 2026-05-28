import { unique } from "remeda";

import {
  d,
  ferry,
  layover,
  move,
  plane,
  roundTripByPlane,
  stay,
  trip,
} from "@/core/helpers/tripBuilders/tripBuilders";

import {
  City,
  Country,
  Ferry,
  FerryCompany,
  Flight,
  FlightCompany,
  Trip,
} from "../core";
import { Cairns } from "./Australia/Cairns/Cairns";
import { Sydney } from "./Australia/Sydney/Sydney";
import { Vienna } from "./Austria/Vienna/Vienna";
import { Anderlecht } from "./Belgium/Anderlecht/Anderlecht";
import { Bruges } from "./Belgium/Bruges/Bruges";
import { Brussels } from "./Belgium/Brussels/Brussels";
import { Charleroi } from "./Belgium/Charleroi/Charleroi";
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
import { Livorno } from "./Italy/Livorno/Livorno";
import { Muravera } from "./Italy/Muravera/Muravera";
import { Olbia } from "./Italy/Olbia/Olbia";
import { Palermo } from "./Italy/Palermo/Palermo";
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

export const livedCities: City[] = [Muravera, Cagliari];

export const futureCities: City[] = [Stockholm];

export const visitedTrips: Trip[] = [
  roundTripByPlane({
    id: "london-school-trip-2011",
    city: London,
    sDate: d({ year: 2011, monthIndex: 4, day: 9 }),
    eDate: d({ year: 2011, monthIndex: 4, day: 12 }),
    company: FlightCompany.EASYJET,
    photoPath: "UnitedKingdom/London/photos/tr_090511_120511",
    data: { durationMinutes: 2 * 60 + 45 },
  }),
  roundTripByPlane({
    id: "berlin-school-trip-2015",
    city: Berlin,
    sDate: d({ year: 2015, monthIndex: 3, day: 15 }),
    eDate: d({ year: 2015, monthIndex: 3, day: 19 }),
    company: FlightCompany.RYANAIR,
    photoPath: "Germany/Berlin/photos/tr_150415_190415",
    data: { durationMinutes: 2 * 60 + 30 },
  }),
  roundTripByPlane({
    id: "barcelona-school-trip-2016",
    city: Barcelona,
    sDate: d({ year: 2016, monthIndex: 3, day: 11 }),
    eDate: d({ year: 2016, monthIndex: 3, day: 15 }),
    company: FlightCompany.RYANAIR,
    photoPath: "Spain/Barcelona/photos/tr_110416_150416",
    data: { durationMinutes: 1 * 60 + 45 },
  }),
  roundTripByPlane({
    id: "bologna-trip-2017",
    city: Bologna,
    sDate: d({ year: 2017, monthIndex: 10, day: 16 }),
    eDate: d({ year: 2017, monthIndex: 10, day: 19 }),
    company: FlightCompany.RYANAIR,
    photoPath: "Italy/Bologna/photos/tr_161117_191117",
    data: { durationMinutes: 1 * 60 + 25 },
  }),
  trip({
    id: "rome-trip-2021",
    sDate: d({ year: 2021, monthIndex: 6, day: 27 }),
    eDate: d({ year: 2021, monthIndex: 7, day: 3 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Rome,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 1 * 60 + 5 },
      }),
      stay({
        city: Rome,
        sDate: d({ year: 2021, monthIndex: 6, day: 27 }),
        eDate: d({ year: 2021, monthIndex: 7, day: 3 }),
        photoPath: "Italy/Rome/photos/tr_270721_030821",
      }),
      move({
        mode: "bus",
        from: Rome,
        to: VaticanCity,
        data: {
          sDate: d({ year: 2021, monthIndex: 6, day: 30 }),
          eDate: d({ year: 2021, monthIndex: 6, day: 30 }),
          distanceInKm: 3.7,
          durationMinutes: 25,
          roundTrip: true,
        },
      }),
      stay({
        city: VaticanCity,
        sDate: d({ year: 2021, monthIndex: 6, day: 30 }),
        eDate: d({ year: 2021, monthIndex: 6, day: 30 }),
        photoPath: "Vatican/Vatican/photos/tr_300721_300721",
      }),
      plane({
        from: Rome,
        to: Cagliari,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 1 * 60 + 5 },
      }),
    ],
  }),
  trip({
    id: "cefalù-trip-2021",
    sDate: d({ year: 2021, monthIndex: 8, day: 23 }),
    eDate: d({ year: 2021, monthIndex: 8, day: 26 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Palermo,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 50 },
      }),
      layover({
        city: Palermo,
        date: d({ year: 2021, monthIndex: 8, day: 23 }),
      }),
      move({
        mode: "car",
        from: Palermo,
        to: Cefalù,
        data: {
          sDate: d({ year: 2021, monthIndex: 8, day: 23 }),
          eDate: d({ year: 2021, monthIndex: 8, day: 23 }),
          distanceInKm: 70,
          durationMinutes: 1 * 60,
        },
      }),
      stay({
        city: Cefalù,
        sDate: d({ year: 2021, monthIndex: 8, day: 23 }),
        eDate: d({ year: 2021, monthIndex: 8, day: 26 }),
        photoPath: "Italy/Cefalù/photos/tr_230921_260921",
      }),
      move({
        mode: "car",
        from: Cefalù,
        to: Palermo,
        data: {
          sDate: d({ year: 2021, monthIndex: 8, day: 26 }),
          eDate: d({ year: 2021, monthIndex: 8, day: 26 }),
          distanceInKm: 70,
          durationMinutes: 1 * 60,
        },
      }),
      layover({
        city: Palermo,
        date: d({ year: 2021, monthIndex: 8, day: 26 }),
      }),
      plane({
        from: Palermo,
        to: Cagliari,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 50 },
      }),
    ],
  }),
  trip({
    id: "terni-trip-2022",
    sDate: d({ year: 2022, monthIndex: 1, day: 25 }),
    eDate: d({ year: 2022, monthIndex: 1, day: 27 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Rome,
        company: FlightCompany.ITA_AIRWAYS,
        data: { durationMinutes: 1 * 60 + 10 },
      }),
      layover({
        city: Rome,
        date: d({ year: 2022, monthIndex: 1, day: 25 }),
      }),
      move({
        mode: "car",
        from: Rome,
        to: Terni,
        data: {
          sDate: d({ year: 2022, monthIndex: 1, day: 25 }),
          eDate: d({ year: 2022, monthIndex: 1, day: 25 }),
          distanceInKm: 98,
          durationMinutes: 1 * 60 + 16,
        },
      }),
      stay({
        city: Terni,
        sDate: d({ year: 2022, monthIndex: 1, day: 25 }),
        eDate: d({ year: 2022, monthIndex: 1, day: 27 }),
        photoPath: "Italy/Terni/photos/tr_250222_270222",
      }),
      move({
        mode: "car",
        from: Terni,
        to: Rome,
        data: {
          sDate: d({ year: 2022, monthIndex: 1, day: 27 }),
          eDate: d({ year: 2022, monthIndex: 1, day: 27 }),
          distanceInKm: 98,
          durationMinutes: 1 * 60 + 16,
        },
      }),
      layover({
        city: Rome,
        date: d({ year: 2022, monthIndex: 1, day: 27 }),
      }),
      plane({
        from: Rome,
        to: Cagliari,
        company: FlightCompany.ITA_AIRWAYS,
        data: { durationMinutes: 1 * 60 + 10 },
      }),
    ],
  }),
  trip({
    id: "imola-f1-trip-2022",
    sDate: d({ year: 2022, monthIndex: 3, day: 21 }),
    eDate: d({ year: 2022, monthIndex: 3, day: 26 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      move({
        mode: "car",
        from: Cagliari,
        to: Olbia,
        data: {
          sDate: d({ year: 2022, monthIndex: 3, day: 21 }),
          eDate: d({ year: 2022, monthIndex: 3, day: 21 }),
          distanceInKm: 271,
          durationMinutes: 190,
        },
      }),
      layover({ city: Olbia, date: d({ year: 2022, monthIndex: 3, day: 21 }) }),
      move({
        mode: "ferry",
        from: Olbia,
        to: Livorno,
        data: {
          ferry: {
            company: FerryCompany.TIRRENIA,
            durationMinutes: 8 * 60,
            distanceInKm: 381,
          },
          sDate: d({ year: 2022, monthIndex: 3, day: 21 }),
          eDate: d({ year: 2022, monthIndex: 3, day: 22 }),
        },
      }),
      layover({
        city: Livorno,
        date: d({ year: 2022, monthIndex: 3, day: 22 }),
      }),
      move({
        mode: "car",
        from: Livorno,
        to: Imola,
        data: {
          distanceInKm: 271,
          durationMinutes: 169,
          sDate: d({ year: 2022, monthIndex: 3, day: 22 }),
          eDate: d({ year: 2022, monthIndex: 3, day: 22 }),
        },
      }),
      stay({
        city: Imola,
        sDate: d({ year: 2022, monthIndex: 3, day: 22 }),
        eDate: d({ year: 2022, monthIndex: 3, day: 25 }),
        photoPath: "Italy/Imola/photos/tr_220422_250422",
      }),
      move({
        mode: "car",
        from: Imola,
        to: Livorno,
        data: {
          distanceInKm: 271,
          durationMinutes: 169,
          sDate: d({ year: 2022, monthIndex: 3, day: 25 }),
          eDate: d({ year: 2022, monthIndex: 3, day: 25 }),
        },
      }),
      layover({
        city: Livorno,
        date: d({ year: 2022, monthIndex: 3, day: 25 }),
      }),
      move({
        mode: "ferry",
        from: Livorno,
        to: Olbia,
        data: {
          ferry: {
            company: FerryCompany.TIRRENIA,
            durationMinutes: 8 * 60,
            distanceInKm: 381,
          },
          sDate: d({ year: 2022, monthIndex: 3, day: 25 }),
          eDate: d({ year: 2022, monthIndex: 3, day: 26 }),
        },
      }),
      layover({
        city: Olbia,
        date: d({ year: 2022, monthIndex: 3, day: 26 }),
      }),
      move({
        mode: "car",
        from: Olbia,
        to: Cagliari,
        data: {
          sDate: d({ year: 2022, monthIndex: 3, day: 26 }),
          eDate: d({ year: 2022, monthIndex: 3, day: 26 }),
          distanceInKm: 271,
          durationMinutes: 190,
        },
      }),
    ],
  }),
  roundTripByPlane({
    id: "budapest-trip-2023",
    city: Budapest,
    sDate: d({ year: 2023, monthIndex: 4, day: 6 }),
    eDate: d({ year: 2023, monthIndex: 4, day: 9 }),
    company: FlightCompany.RYANAIR,
    photoPath: "Hungary/Budapest/photos/tr_060523_090523",
    data: { durationMinutes: 2 * 60 + 5 },
  }),
  trip({
    id: "belgium-trip-2023",
    sDate: d({ year: 2023, monthIndex: 7, day: 5 }),
    eDate: d({ year: 2023, monthIndex: 7, day: 10 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Charleroi,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 2 * 60 + 20 },
      }),
      layover({
        city: Charleroi,
        date: d({ year: 2023, monthIndex: 7, day: 5 }),
      }),
      move({
        mode: "bus",
        from: Charleroi,
        to: Brussels,
        data: {
          distanceInKm: 60,
          durationMinutes: 55,
          sDate: d({ year: 2023, monthIndex: 7, day: 5 }),
          eDate: d({ year: 2023, monthIndex: 7, day: 5 }),
        },
      }),
      stay({
        city: Brussels,
        sDate: d({ year: 2023, monthIndex: 7, day: 5 }),
        eDate: d({ year: 2023, monthIndex: 7, day: 10 }),
        photoPath: "Belgium/Brussels/photos/tr_050823_100823",
      }),
      move({
        mode: "bus",
        from: Brussels,
        to: Anderlecht,
        data: {
          sDate: d({ year: 2023, monthIndex: 7, day: 6 }),
          eDate: d({ year: 2023, monthIndex: 7, day: 6 }),
          distanceInKm: 7,
          durationMinutes: 20,
          roundTrip: true,
        },
      }),
      stay({
        city: Anderlecht,
        sDate: d({ year: 2023, monthIndex: 7, day: 6 }),
        eDate: d({ year: 2023, monthIndex: 7, day: 6 }),
        photoPath: "Belgium/Anderlecht/photos/tr_060823_060823",
      }),
      move({
        mode: "train",
        from: Brussels,
        to: Bruges,
        data: {
          sDate: d({ year: 2023, monthIndex: 7, day: 9 }),
          eDate: d({ year: 2023, monthIndex: 7, day: 9 }),
          distanceInKm: 95,
          durationMinutes: 65,
          roundTrip: true,
        },
      }),
      stay({
        city: Bruges,
        sDate: d({ year: 2023, monthIndex: 7, day: 9 }),
        eDate: d({ year: 2023, monthIndex: 7, day: 9 }),
        photoPath: "Belgium/Bruges/photos/tr_090823_090823",
      }),
      move({
        mode: "bus",
        from: Brussels,
        to: Charleroi,
        data: {
          distanceInKm: 60,
          durationMinutes: 55,
          sDate: d({ year: 2023, monthIndex: 7, day: 10 }),
          eDate: d({ year: 2023, monthIndex: 7, day: 10 }),
        },
      }),
      layover({
        city: Charleroi,
        date: d({ year: 2023, monthIndex: 7, day: 10 }),
      }),
      plane({
        from: Charleroi,
        to: Cagliari,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 2 * 60 + 20 },
      }),
    ],
  }),
  trip({
    id: "turin-atp-trip-2023",
    sDate: d({ year: 2023, monthIndex: 10, day: 11 }),
    eDate: d({ year: 2023, monthIndex: 10, day: 14 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Turin,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 1 * 60 + 25 },
      }),
      stay({
        city: Turin,
        sDate: d({ year: 2023, monthIndex: 10, day: 11 }),
        eDate: d({ year: 2023, monthIndex: 10, day: 14 }),
        photoPath: "Italy/Turin/photos/tr_111123_141123",
      }),
      move({
        mode: "bus",
        from: Turin,
        to: Genoa,
        data: {
          distanceInKm: 170,
          durationMinutes: 123,
        },
      }),
      stay({
        city: Genoa,
        sDate: d({ year: 2023, monthIndex: 10, day: 14 }),
        eDate: d({ year: 2023, monthIndex: 10, day: 14 }),
        photoPath: "Italy/Genoa/photos/tr_141123_141123",
      }),
      plane({
        from: Genoa,
        to: Cagliari,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 1 * 60 + 20 },
      }),
    ],
  }),
  trip({
    id: "portugal-trip-2024",
    sDate: d({ year: 2024, monthIndex: 3, day: 19 }),
    eDate: d({ year: 2024, monthIndex: 3, day: 22 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Porto,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 2 * 60 + 45 },
      }),
      stay({
        city: Porto,
        sDate: d({ year: 2024, monthIndex: 3, day: 19 }),
        eDate: d({ year: 2024, monthIndex: 3, day: 22 }),
        photoPath: "Portugal/Porto/photos/tr_190424_220424",
      }),
      move({
        mode: "train",
        from: Porto,
        to: Braga,
        data: { durationMinutes: 70, distanceInKm: 55, roundTrip: true },
      }),
      stay({
        city: Braga,
        sDate: d({ year: 2024, monthIndex: 3, day: 20 }),
        eDate: d({ year: 2024, monthIndex: 3, day: 20 }),
        photoPath: "Portugal/Braga/photos/tr_200424_200424",
      }),
      plane({
        from: Porto,
        to: Cagliari,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 2 * 60 + 45 },
      }),
    ],
  }),
  trip({
    id: "japan-trip-2024",
    sDate: d({ year: 2024, monthIndex: 7, day: 13 }),
    eDate: d({ year: 2024, monthIndex: 7, day: 25 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({ from: Cagliari, to: Rome, company: FlightCompany.AEROITALIA }),
      stay({
        city: Rome,
        sDate: d({ year: 2024, monthIndex: 7, day: 10 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 12 }),
        photoPath: "Italy/Rome/photos/tr_100824_120824",
      }),
      plane({ from: Rome, to: Tokyo, company: FlightCompany.ITA_AIRWAYS }),
      stay({
        city: Tokyo,
        sDate: d({ year: 2024, monthIndex: 7, day: 13 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 18 }),
        photoPath: "Japan/Tokyo/photos/tr_130824_180824",
      }),
      move({ mode: "bus", from: Tokyo, to: Oshino }),
      stay({
        city: Oshino,
        sDate: d({ year: 2024, monthIndex: 7, day: 15, hours: 12 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 15, hours: 12 }),
        photoPath: "Japan/Oshino/photos/tr_150824_150824",
      }),
      move({ mode: "bus", from: Oshino, to: Fujikawaguchiko }),
      stay({
        city: Fujikawaguchiko,
        sDate: d({ year: 2024, monthIndex: 7, day: 15, hours: 13 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 15, hours: 13 }),
        photoPath: "Japan/Fujikawaguchiko/photos/tr_150824_150824",
      }),
      move({ mode: "bus", from: Tokyo, to: Matsumoto }),
      stay({
        city: Matsumoto,
        sDate: d({ year: 2024, monthIndex: 7, day: 18 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 18 }),
        photoPath: "Japan/Matsumoto/photos/tr_180824_180824",
      }),
      move({ mode: "bus", from: Matsumoto, to: Takayama }),
      stay({
        city: Takayama,
        sDate: d({ year: 2024, monthIndex: 7, day: 18 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 19 }),
        photoPath: "Japan/Takayama/photos/tr_180824_190824",
      }),
      move({ mode: "bus", from: Takayama, to: Shirakawago }),
      stay({
        city: Shirakawago,
        sDate: d({ year: 2024, monthIndex: 7, day: 19 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 19 }),
        photoPath: "Japan/Shirakawago/photos/tr_190824_190824",
      }),
      move({ mode: "bus", from: Shirakawago, to: Kanazawa }),
      stay({
        city: Kanazawa,
        sDate: d({ year: 2024, monthIndex: 7, day: 19 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 21 }),
        photoPath: "Japan/Kanazawa/photos/tr_190824_210824",
      }),
      move({ mode: "train", from: Kanazawa, to: Kyoto }),
      stay({
        city: Kyoto,
        sDate: d({ year: 2024, monthIndex: 7, day: 21 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 27 }),
        photoPath: "Japan/Kyoto/photos/tr_210824_270824",
      }),
      move({ mode: "train", from: Kyoto, to: Himeji }),
      stay({
        city: Himeji,
        sDate: d({ year: 2024, monthIndex: 7, day: 23 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 23 }),
        photoPath: "Japan/Himeji/photos/tr_230824_230824",
      }),
      move({ mode: "train", from: Himeji, to: Kobe }),
      stay({
        city: Kobe,
        sDate: d({ year: 2024, monthIndex: 7, day: 23 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 23 }),
        photoPath: "Japan/Kobe/photos/tr_230824_230824",
      }),
      move({ mode: "train", from: Kyoto, to: Nara }),
      stay({
        city: Nara,
        sDate: d({ year: 2024, monthIndex: 7, day: 24 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 24 }),
        photoPath: "Japan/Nara/photos/tr_240824_240824",
      }),
      move({ mode: "train", from: Nara, to: Osaka }),
      stay({
        city: Osaka,
        sDate: d({ year: 2024, monthIndex: 7, day: 25 }),
        eDate: d({ year: 2024, monthIndex: 7, day: 25 }),
        photoPath: "Japan/Osaka/photos/tr_250824_250824",
      }),
      plane({
        from: Osaka,
        to: Tokyo,
        company: FlightCompany.ALL_NIPPON_AIRWAYS,
      }),
      layover({ city: Tokyo, date: d({ year: 2024, monthIndex: 7, day: 25 }) }),
      plane({ from: Tokyo, to: Rome, company: FlightCompany.ITA_AIRWAYS }),
      layover({ city: Rome, date: d({ year: 2024, monthIndex: 7, day: 25 }) }),
      plane({ from: Rome, to: Cagliari, company: FlightCompany.ITA_AIRWAYS }),
    ],
  }),
  trip({
    id: "venetian-trip-2023",
    sDate: d({ year: 2024, monthIndex: 9, day: 4 }),
    eDate: d({ year: 2024, monthIndex: 9, day: 6 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Verona,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 1 * 60 + 25 },
      }),
      layover({ city: Verona, date: d({ year: 2024, monthIndex: 9, day: 4 }) }),
      move({
        mode: "train",
        from: Verona,
        to: PeschieraDelGarda,
        data: { durationMinutes: 13, distanceInKm: 28 },
      }),
      stay({
        city: PeschieraDelGarda,
        sDate: d({ year: 2024, monthIndex: 9, day: 4 }),
        eDate: d({ year: 2024, monthIndex: 9, day: 6 }),
        photoPath: "Italy/PeschieraDelGarda/photos/tr_041024_061024",
      }),
      move({
        mode: "train",
        from: PeschieraDelGarda,
        to: Verona,
        data: { durationMinutes: 13, distanceInKm: 28 },
      }),
      stay({
        city: Verona,
        sDate: d({ year: 2024, monthIndex: 9, day: 6 }),
        eDate: d({ year: 2024, monthIndex: 9, day: 6 }),
        photoPath: "Italy/Verona/photos/tr_061024_061024",
      }),
      plane({
        from: Verona,
        to: Cagliari,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 1 * 60 + 25 },
      }),
    ],
  }),
  trip({
    id: "malta-trip-2025",
    sDate: d({ year: 2025, monthIndex: 0, day: 1 }),
    eDate: d({ year: 2025, monthIndex: 0, day: 5 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({ from: Cagliari, to: Luqa, company: FlightCompany.RYANAIR }),
      layover({ city: Luqa, date: d({ year: 2025, monthIndex: 0, day: 1 }) }),
      move({ mode: "car", from: Luqa, to: Sliema }),
      stay({
        city: Sliema,
        sDate: d({ year: 2025, monthIndex: 0, day: 1 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 5 }),
        photoPath: "Malta/Sliema/photos/tr_010125_050125",
      }),
      stay({
        city: Valletta,
        sDate: d({ year: 2025, monthIndex: 0, day: 2, hours: 2 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 2, hours: 2 }),
        photoPath: "Malta/Valletta/photos/tr_020125_020125",
      }),
      stay({
        city: Mdina,
        sDate: d({ year: 2025, monthIndex: 0, day: 2 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 2 }),
        photoPath: "Malta/Mdina/photos/tr_020125_020125",
      }),
      stay({
        city: Rabat,
        sDate: d({ year: 2025, monthIndex: 0, day: 2, hours: 1 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 2, hours: 1 }),
        photoPath: "Malta/Rabat/photos/tr_020125_020125",
      }),
      stay({
        city: Valletta,
        sDate: d({ year: 2025, monthIndex: 0, day: 3 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 3 }),
        photoPath: "Malta/Valletta/photos/tr_030125_030125",
      }),
      stay({
        city: SanGiljan,
        sDate: d({ year: 2025, monthIndex: 0, day: 2, hours: 23 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 2, hours: 23 }),
        photoPath: "Malta/SanGiljan/photos/tr_020125_020125",
      }),
      stay({
        city: SanPawlIlBahar,
        sDate: d({ year: 2025, monthIndex: 0, day: 4 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 4 }),
        photoPath: "Malta/SanPawlIlBahar/photos/tr_040125_040125",
      }),
      stay({
        city: Comino,
        sDate: d({ year: 2025, monthIndex: 0, day: 4, hours: 11 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 4, hours: 11 }),
        photoPath: "Malta/Comino/photos/tr_040125_040125",
      }),
      stay({
        city: Victoria,
        sDate: d({ year: 2025, monthIndex: 0, day: 4, hours: 15 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 4, hours: 15 }),
        photoPath: "Malta/Victoria/photos/tr_040125_040125",
      }),
      stay({
        city: SanGiljan,
        sDate: d({ year: 2025, monthIndex: 0, day: 4, hours: 23 }),
        eDate: d({ year: 2025, monthIndex: 0, day: 4, hours: 23 }),
        photoPath: "Malta/SanGiljan/photos/tr_040125_040125",
        data: {
          rowConstraints: { minPhotos: 2, maxPhotos: 7 },
        },
      }),
      move({ mode: "car", from: Sliema, to: Luqa }),
      layover({ city: Luqa, date: d({ year: 2025, monthIndex: 0, day: 5 }) }),
      plane({ from: Luqa, to: Cagliari, company: FlightCompany.RYANAIR }),
    ],
  }),
  roundTripByPlane({
    id: "sevilla-trip-2025",
    city: Sevilla,
    sDate: d({ year: 2025, monthIndex: 3, day: 4 }),
    eDate: d({ year: 2025, monthIndex: 3, day: 8 }),
    company: FlightCompany.RYANAIR,
    photoPath: "Spain/Sevilla/photos/tr_040425_080425",
  }),
  roundTripByPlane({
    id: "vienna-trip-2025",
    city: Vienna,
    sDate: d({ year: 2025, monthIndex: 4, day: 17 }),
    eDate: d({ year: 2025, monthIndex: 4, day: 20 }),
    company: FlightCompany.RYANAIR,
    photoPath: "Austria/Vienna/photos/tr_170525_200525",
  }),
  roundTripByPlane({
    id: "cefalù-trip-2025",
    city: Cefalù,
    sDate: d({ year: 2025, monthIndex: 5, day: 14 }),
    eDate: d({ year: 2025, monthIndex: 5, day: 17 }),
    company: FlightCompany.RYANAIR,
    photoPath: "Italy/Cefalù/photos/tr_140625_170625",
  }),
  trip({
    id: "bulgaria-trip-2025",
    sDate: d({ year: 2025, monthIndex: 7, day: 17 }),
    eDate: d({ year: 2025, monthIndex: 7, day: 21 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      move({ mode: "car", from: Cagliari, to: Alghero }),
      plane({ from: Alghero, to: Sofia, company: FlightCompany.WIZZ_AIR }),
      stay({
        city: Sofia,
        sDate: d({ year: 2025, monthIndex: 7, day: 17 }),
        eDate: d({ year: 2025, monthIndex: 7, day: 21 }),
        photoPath: "Bulgaria/Sofia/photos/tr_170825_210825",
      }),
      move({ mode: "car", from: Sofia, to: Rila }),
      stay({
        city: Rila,
        sDate: d({ year: 2025, monthIndex: 7, day: 19 }),
        eDate: d({ year: 2025, monthIndex: 7, day: 19 }),
        photoPath: "Bulgaria/Rila/photos/tr_190825_190825",
      }),
      plane({ from: Sofia, to: Alghero, company: FlightCompany.WIZZ_AIR }),
      move({ mode: "car", from: Alghero, to: Cagliari }),
    ],
  }),
  trip({
    id: "australia-trip-2025",
    sDate: d({ year: 2025, monthIndex: 10, day: 18 }),
    eDate: d({ year: 2025, monthIndex: 10, day: 28 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({ from: Cagliari, to: Rome, company: FlightCompany.AEROITALIA }),
      layover({ city: Rome, date: d({ year: 2025, monthIndex: 10, day: 18 }) }),
      plane({
        from: Rome,
        to: Shanghai,
        company: FlightCompany.CHINA_EASTERN_AIRLINES,
      }),
      layover({
        city: Shanghai,
        date: d({ year: 2025, monthIndex: 10, day: 19 }),
      }),
      plane({
        from: Shanghai,
        to: Sydney,
        company: FlightCompany.CHINA_EASTERN_AIRLINES,
      }),
      stay({
        city: Sydney,
        sDate: d({ year: 2025, monthIndex: 10, day: 18 }),
        eDate: d({ year: 2025, monthIndex: 10, day: 20 }),
        photoPath: "Australia/Sydney/photos/tr_181125_281125",
      }),
      plane({ from: Sydney, to: Cairns, company: FlightCompany.JETSTAR }),
      stay({
        city: Cairns,
        sDate: d({ year: 2025, monthIndex: 10, day: 20 }),
        eDate: d({ year: 2025, monthIndex: 10, day: 23 }),
        photoPath: "Australia/Cairns/photos/tr_201125_231125",
      }),
      plane({
        from: Cairns,
        to: Sydney,
        company: FlightCompany.VIRGIN_AUSTRALIA,
      }),
      stay({
        city: Sydney,
        sDate: d({ year: 2025, monthIndex: 10, day: 23 }),
        eDate: d({ year: 2025, monthIndex: 10, day: 28 }),
        photoPath: "Australia/Sydney/photos/tr_181125_281125",
      }),
      plane({
        from: Sydney,
        to: Shanghai,
        company: FlightCompany.CHINA_EASTERN_AIRLINES,
      }),
      layover({
        city: Shanghai,
        date: d({ year: 2025, monthIndex: 10, day: 28 }),
      }),
      plane({
        from: Shanghai,
        to: Rome,
        company: FlightCompany.CHINA_EASTERN_AIRLINES,
      }),
      layover({ city: Rome, date: d({ year: 2025, monthIndex: 10, day: 28 }) }),
      plane({ from: Rome, to: Cagliari, company: FlightCompany.AEROITALIA }),
    ],
  }),
  trip({
    id: "cote-d-azur-trip-2025-2026",
    sDate: d({ year: 2025, monthIndex: 11, day: 28 }),
    eDate: d({ year: 2026, monthIndex: 0, day: 2 }),
    origin: Muravera,
    returnTo: Muravera,
    steps: [
      move({
        mode: "car",
        from: Muravera,
        to: PortoTorres,
        data: {
          durationMinutes: 210,
          distanceInKm: 244,
        },
      }),
      layover({
        city: PortoTorres,
        date: d({ year: 2025, monthIndex: 11, day: 28 }),
      }),
      ferry({
        from: PortoTorres,
        to: Toulon,
        company: FerryCompany.CORSICA_FERRIES,
        data: {
          via: [Ajaccio],
          ferry: { via: [Ajaccio], durationMinutes: 900, distanceInKm: 506 },
        },
      }),
      stay({
        city: Toulon,
        sDate: d({ year: 2025, monthIndex: 11, day: 28 }),
        eDate: d({ year: 2025, monthIndex: 11, day: 28 }),
      }),
      move({
        mode: "car",
        from: Toulon,
        to: SaintTropez,
        data: {
          durationMinutes: 90,
          distanceInKm: 70,
        },
      }),
      stay({
        city: SaintTropez,
        sDate: d({ year: 2025, monthIndex: 11, day: 28, hours: 11 }),
        eDate: d({ year: 2025, monthIndex: 11, day: 28 }),
        photoPath: "France/SaintTropez/photos/tr_281225_281225",
      }),
      move({
        mode: "car",
        from: SaintTropez,
        to: Nice,
        data: {
          durationMinutes: 100,
          distanceInKm: 112,
        },
      }),
      stay({
        city: Nice,
        sDate: d({ year: 2025, monthIndex: 11, day: 28, hours: 17 }),
        eDate: d({ year: 2025, monthIndex: 11, day: 31 }),
        photoPath: "France/Nice/photos/tr_281225_311225",
      }),
      move({
        mode: "car",
        from: Nice,
        to: MonteCarlo,
        data: { durationMinutes: 35, distanceInKm: 22 },
      }),
      stay({
        city: MonteCarlo,
        sDate: d({ year: 2025, monthIndex: 11, day: 29 }),
        eDate: d({ year: 2025, monthIndex: 11, day: 29 }),
        photoPath: "Monaco/MonteCarlo/photos/tr_291225_291225",
      }),
      move({
        mode: "car",
        from: Nice,
        to: Cannes,
        data: { durationMinutes: 40, distanceInKm: 34 },
      }),
      stay({
        city: Cannes,
        sDate: d({ year: 2025, monthIndex: 11, day: 31 }),
        eDate: d({ year: 2025, monthIndex: 11, day: 31 }),
        photoPath: "France/Cannes/photos/tr_311225_311225",
      }),
      move({
        mode: "car",
        from: Cannes,
        to: Toulon,
        data: { durationMinutes: 95, distanceInKm: 126 },
      }),
      stay({
        city: Toulon,
        sDate: d({ year: 2025, monthIndex: 11, day: 31, hours: 15 }),
        eDate: d({ year: 2026, monthIndex: 0, day: 2 }),
        photoPath: "France/Toulon/photos/tr_281225_020126",
      }),
      move({
        mode: "car",
        from: Toulon,
        to: Marseille,
        data: { durationMinutes: 55, distanceInKm: 66 },
      }),
      stay({
        city: Marseille,
        sDate: d({ year: 2026, monthIndex: 0, day: 1 }),
        eDate: d({ year: 2026, monthIndex: 0, day: 1 }),
        photoPath: "France/Marseille/photos/tr_010126_010126",
      }),
      move({
        mode: "car",
        from: Marseille,
        to: Toulon,
        data: { durationMinutes: 55, distanceInKm: 66 },
      }),
      ferry({
        from: Toulon,
        to: PortoTorres,
        company: FerryCompany.CORSICA_FERRIES,
        data: {
          via: [Ajaccio],
          ferry: { via: [Ajaccio], durationMinutes: 900, distanceInKm: 506 },
        },
      }),
      layover({
        city: Ajaccio,
        date: d({ year: 2026, monthIndex: 0, day: 2 }),
      }),
      move({
        mode: "car",
        from: PortoTorres,
        to: Muravera,
        data: {
          durationMinutes: 210,
          distanceInKm: 244,
        },
      }),
    ],
  }),
  trip({
    id: "romania-trip-2026",
    sDate: d({ year: 2026, monthIndex: 2, day: 26 }),
    eDate: d({ year: 2026, monthIndex: 2, day: 31 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      plane({
        from: Cagliari,
        to: Bergamo,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 90 },
      }),
      layover({
        city: Bergamo,
        date: d({ year: 2026, monthIndex: 2, day: 26 }),
      }),
      plane({
        from: Bergamo,
        to: Bucharest,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 2 * 60 + 20 },
      }),
      stay({
        city: Bucharest,
        sDate: d({ year: 2026, monthIndex: 2, day: 26 }),
        eDate: d({ year: 2026, monthIndex: 2, day: 30 }),
        photoPath: "Romania/Bucharest/photos/tr_260326_300326",
      }),
      move({
        mode: "bus",
        from: Bucharest,
        to: Sinaia,
        data: { durationMinutes: 120, distanceInKm: 127 },
      }),
      stay({
        city: Sinaia,
        sDate: d({ year: 2026, monthIndex: 2, day: 27 }),
        eDate: d({ year: 2026, monthIndex: 2, day: 27 }),
        photoPath: "Romania/Sinaia/photos/tr_270326_270326",
      }),
      move({
        mode: "bus",
        from: Sinaia,
        to: Brasov,
        data: { durationMinutes: 58, distanceInKm: 50 },
      }),
      stay({
        city: Brasov,
        sDate: d({ year: 2026, monthIndex: 2, day: 27 }),
        eDate: d({ year: 2026, monthIndex: 2, day: 27 }),
        photoPath: "Romania/Brasov/photos/tr_270326_270326",
      }),
      move({
        mode: "bus",
        from: Brasov,
        to: Bran,
        data: { durationMinutes: 29, distanceInKm: 30 },
      }),
      stay({
        city: Bran,
        sDate: d({ year: 2026, monthIndex: 2, day: 27 }),
        eDate: d({ year: 2026, monthIndex: 2, day: 27 }),
        photoPath: "Romania/Bran/photos/tr_270326_270326",
      }),
      move({
        mode: "bus",
        from: Bran,
        to: Bucharest,
        data: { durationMinutes: 150, distanceInKm: 170 },
      }),
      plane({
        from: Bucharest,
        to: Bergamo,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 2 * 60 + 20 },
      }),
      layover({
        city: Bergamo,
        date: d({ year: 2026, monthIndex: 2, day: 31 }),
      }),
      plane({
        from: Bergamo,
        to: Cagliari,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 90 },
      }),
    ],
  }),
  trip({
    id: "slovakia-trip-2026",
    sDate: d({ year: 2026, monthIndex: 4, day: 1 }),
    eDate: d({ year: 2026, monthIndex: 4, day: 4 }),
    origin: Cagliari,
    returnTo: Cagliari,
    steps: [
      move({
        mode: "car",
        from: Cagliari,
        to: Alghero,
        data: { durationMinutes: 170, distanceInKm: 251 },
      }),
      plane({
        from: Alghero,
        to: Bratislava,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 110 },
      }),
      stay({
        city: Bratislava,
        sDate: d({ year: 2026, monthIndex: 4, day: 1 }),
        eDate: d({ year: 2026, monthIndex: 4, day: 4 }),
        photoPath: "Slovakia/Bratislava/photos/tr_010526_040526",
      }),
      move({
        mode: "bus",
        from: Bratislava,
        to: Devin,
        data: {
          distanceInKm: 16.7,
          durationMinutes: 42,
          sDate: d({ year: 2026, monthIndex: 4, day: 3 }),
          eDate: d({ year: 2026, monthIndex: 4, day: 3 }),
        },
      }),
      stay({
        city: Devin,
        sDate: d({ year: 2026, monthIndex: 4, day: 3 }),
        eDate: d({ year: 2026, monthIndex: 4, day: 3 }),
        photoPath: "Slovakia/Devin/photos/tr_030526_030526",
      }),
      plane({
        from: Bratislava,
        to: Alghero,
        company: FlightCompany.RYANAIR,
        data: { durationMinutes: 110 },
      }),
      move({
        mode: "car",
        from: Alghero,
        to: Cagliari,
        data: { durationMinutes: 170, distanceInKm: 251 },
      }),
    ],
  }),
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
