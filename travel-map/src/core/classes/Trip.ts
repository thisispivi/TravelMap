import { unique } from "remeda";

import { FerryCompany } from "../typings/FerryCompany";
import { FlightCompany } from "../typings/FlightCompany";
import { Image } from "../typings/Image";
import { City } from "./City";
import { Country } from "./Country";
import { Ferry } from "./Ferry";
import { Flight } from "./Flight";
import { Travel } from "./Travel";

/** All supported transport modes for route steps. */
export type TransportMode =
  "ferry" | "plane" | "car" | "train" | "bus" | "taxi" | "walk";

interface FlightLeg {
  company?: FlightCompany;
  number?: string;
  class?: string;
  departure?: string;
  arrival?: string;
  durationMinutes?: number;
  distanceInKm?: number;
}

interface FerryLeg {
  company?: FerryCompany;
  durationMinutes?: number;
  distanceInKm?: number;
  via?: City[];
}

/** Origin or return city of a trip (e.g. home city). */
export interface TripEndpoint {
  city: City;
}

/** A city visit within a trip, with date range, optional photos and layover flag. */
export interface TripStop {
  city: City;
  sDate: Date;
  eDate: Date;
  photos?: Image[];
  imgSource?: string;
  isLayover?: boolean;
  rowConstraints?: { minPhotos?: number; maxPhotos?: number };
  targetRowHeight?: number;
}

/** A transport step (flight, ferry, drive, etc.) between two cities in a trip. */
export interface TripTransportStep {
  type: "transport";
  mode: TransportMode;
  from: City;
  to: City;
  sDate?: Date;
  eDate?: Date;
  distanceInKm?: number;
  durationMinutes?: number;
  via?: City[];
  flight?: FlightLeg;
  ferry?: FerryLeg;
  roundTrip?: boolean;
}

/** A stop step (city visit) within a trip's route steps array. */
export interface TripStopStep extends TripStop {
  type: "stop";
}

/** Union of a stop step and a transport step — one element in a trip's route. */
export type TripRouteStep = TripStopStep | TripTransportStep;

/** A resolved city visit derived from route steps, enriched with visit index and arrival mode. */
export interface TripDestination extends TripStop {
  travelIdx: number;
  arrivalTransport?: TransportMode;
}

interface TripData {
  id: string;
  description?: string;
  sDate: Date;
  eDate: Date;
  steps: TripRouteStep[];
  backgroundImgSourceKey?: string;
  origin: TripEndpoint;
  returnTo: TripEndpoint;
  mapFocus?: { center: [number, number]; zoom: number };
}

/**
 * Represents a single travel trip — its origin, itinerary steps, date range,
 * and derived destination list. Provides helpers to extract flights, ferries,
 * visited countries, and map route coordinates.
 */
export class Trip {
  id: string;
  sDate: Date;
  eDate: Date;
  steps: TripRouteStep[];
  destinations: TripDestination[];
  route: City["name"][];
  backgroundImgSource?: string;
  origin: TripEndpoint;
  returnTo: TripEndpoint;
  mapFocus?: { center: [number, number]; zoom: number };

  constructor(data: TripData) {
    this.id = data.id;
    this.sDate = data.sDate;
    this.eDate = data.eDate;
    this.steps = data.steps;
    this.origin = data.origin;
    this.returnTo = data.returnTo;
    this.mapFocus = data.mapFocus;
    this.destinations = this.getDestinationsFromSteps();
    this.route = this.destinations.flatMap((destination) =>
      destination.isLayover ? [] : [destination.city.name],
    );
    this.backgroundImgSource = data.backgroundImgSourceKey
      ? `https://pivi-travel-map.b-cdn.net/TravelMap/Trips/${data.backgroundImgSourceKey}`
      : this.destinations[0]?.city.getBackgroundImgSourceByIndex(0) ||
        undefined;
  }

  getDurationInDays(): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const durationInMilliseconds = this.eDate.getTime() - this.sDate.getTime();
    return Math.ceil(durationInMilliseconds / millisecondsPerDay) + 1;
  }

  getCountriesVisited(): Country[] {
    return unique(
      this.destinations.flatMap((destination) =>
        destination.isLayover ? [] : [destination.city.country],
      ),
    );
  }

  getCityTravels(city: City): Travel[] {
    return this.destinations.flatMap((destination) =>
      destination.city.name === city.name
        ? [
            new Travel({
              sDate: destination.sDate,
              eDate: destination.eDate,
              photos: destination.photos,
              isFuture: false,
              rowConstraints: destination.rowConstraints,
              targetRowHeight: destination.targetRowHeight,
            }),
          ]
        : [],
    );
  }

  getFlights(): Flight[] {
    return this.steps.flatMap((step) =>
      step.type === "transport" && step.mode === "plane"
        ? [
            new Flight({
              sCity: step.from,
              eCity: step.to,
              company: step.flight?.company,
              sDate: step.sDate,
              eDate: step.eDate,
              distanceInKm: step.flight?.distanceInKm ?? step.distanceInKm,
              durationMinutes:
                step.flight?.durationMinutes ?? step.durationMinutes,
              number: step.flight?.number,
              class: step.flight?.class,
            }),
          ]
        : [],
    );
  }

  getFerries(): Ferry[] {
    return this.steps.flatMap((step) =>
      step.type === "transport" && step.mode === "ferry"
        ? [
            new Ferry({
              sCity: step.from,
              eCity: step.to,
              company: step.ferry?.company,
              sDate: step.sDate,
              eDate: step.eDate,
              via: step.ferry?.via ?? step.via,
              distanceInKm: step.ferry?.distanceInKm ?? step.distanceInKm,
              durationMinutes:
                step.ferry?.durationMinutes ?? step.durationMinutes,
            }),
          ]
        : [],
    );
  }

  getRouteSegments(): TripTransportStep[] {
    return this.steps.filter(
      (step): step is TripTransportStep => step.type === "transport",
    );
  }

  getRouteLines(): [number, number][] {
    return this.getRouteSegments().flatMap((step) => {
      const cities = [
        step.from,
        ...(step.via ?? step.ferry?.via ?? []),
        step.to,
      ];
      return cities
        .slice(0, -1)
        .flatMap((city, index) => [
          [city.coordinates[0], city.coordinates[1]] as [number, number],
          [
            cities[index + 1].coordinates[0],
            cities[index + 1].coordinates[1],
          ] as [number, number],
        ]);
    });
  }

  private getDestinationsFromSteps(): TripDestination[] {
    const cityIndexes = new Map<string, number>();
    let arrivalTransport: TransportMode | undefined;

    return this.steps.flatMap((step) => {
      if (step.type === "transport") {
        arrivalTransport = step.mode;
        return [];
      }

      const travelIdx = cityIndexes.get(step.city.name) ?? 0;
      cityIndexes.set(step.city.name, travelIdx + 1);
      const destination: TripDestination = {
        ...step,
        travelIdx,
        arrivalTransport,
      };
      arrivalTransport = undefined;
      return [destination];
    });
  }
}
