import { unique } from "remeda";
import { City } from "./City";
import { Country } from "./Country";

interface TripData {
  id: string;
  name: string;
  description?: string;
  sDate: Date;
  eDate: Date;
  destinations: { city: City; travelIdx: number }[];
  route: City["name"][];
}

export class Trip {
  id: string;
  name: string;
  sDate: Date;
  eDate: Date;
  destinations: { city: City; travelIdx: number }[];
  route: City["name"][];

  constructor(data: TripData) {
    this.id = data.id;
    this.name = data.name;
    this.sDate = data.sDate;
    this.eDate = data.eDate;
    this.destinations = data.destinations;
    this.route = data.route;
  }

  getDurationInDays(): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const durationInMilliseconds = this.eDate.getTime() - this.sDate.getTime();
    return Math.ceil(durationInMilliseconds / millisecondsPerDay);
  }

  getCountriesVisited(): Country[] {
    return unique(this.destinations.map(({ city }) => city.country));
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
