import { unique } from "remeda";

import { FlightCompany } from "../typings/FlightCompany";
import { City } from "./City";
import { Country } from "./Country";

export type TransportMode = "ferry" | "plane" | "car" | "train" | "bus";

export interface FlightLeg {
  company?: FlightCompany;
  number?: string;
  class?: string;
  departure?: string;
  arrival?: string;
  durationMinutes?: number;
}

export interface TripEndpoint {
  city: City;
  transport: TransportMode;
  fromCity?: City;
  flight?: FlightLeg;
}

interface TripDestination {
  city: City;
  travelIdx: number;
  arrivalTransport?: TransportMode;
  isLayover?: boolean;
  arrivalFlight?: FlightLeg;
}

interface TripData {
  id: string;
  description?: string;
  sDate: Date;
  eDate: Date;
  destinations: TripDestination[];
  route: City["name"][];
  backgroundImgSourceKey?: string;
  origin?: TripEndpoint;
  returnTo?: TripEndpoint;
}

export class Trip {
  id: string;
  sDate: Date;
  eDate: Date;
  destinations: TripDestination[];
  route: City["name"][];
  backgroundImgSource?: string;
  origin?: TripEndpoint;
  returnTo?: TripEndpoint;

  constructor(data: TripData) {
    this.id = data.id;
    this.sDate = data.sDate;
    this.eDate = data.eDate;
    this.destinations = data.destinations;
    this.route = data.route;
    this.backgroundImgSource = data.backgroundImgSourceKey
      ? `https://pivi-travel-map.b-cdn.net/TravelMap/Trips/${data.backgroundImgSourceKey}`
      : data.destinations[0]?.city.getBackgroundImgSourceByIndex(0) ||
        undefined;
    this.origin = data.origin;
    this.returnTo = data.returnTo;
  }

  getDurationInDays(): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const durationInMilliseconds = this.eDate.getTime() - this.sDate.getTime();
    return Math.ceil(durationInMilliseconds / millisecondsPerDay) + 1;
  }

  getCountriesVisited(): Country[] {
    return unique(
      this.destinations
        .filter((d) => !d.isLayover)
        .map(({ city }) => city.country),
    );
  }

  getRouteLines(): [number, number][] {
    const lines: [number, number][] = [];
    for (let i = 0; i < this.destinations.length - 1; i++) {
      const fromCity = this.destinations[i].city;
      const toCity = this.destinations[i + 1].city;
      lines.push([fromCity.coordinates[0], fromCity.coordinates[1]]);
      lines.push([toCity.coordinates[0], toCity.coordinates[1]]);
    }
    return lines;
  }
}
