import { unique } from "remeda";

import { Image } from "../typings/Image";
import { localize } from "../typings/Localized";
import { City } from "./City";
import { Country } from "./Country";
import { Ferry } from "./Ferry";
import { Flight } from "./Flight";
import { Travel } from "./Travel";

/**
 * All supported transport modes for route steps.
 */
export type TransportMode =
  "ferry" | "plane" | "car" | "train" | "bus" | "taxi" | "walk";

/**
 * Data represented by the flight leg interface.
 * @property {FlightCompany} [company] - The company
 * @property {string} [number] - The number
 * @property {string} [class] - The class
 * @property {string} [departure] - The departure
 * @property {string} [arrival] - The arrival
 * @property {number} [durationMinutes] - The duration minutes
 * @property {number} [distanceInKm] - The distance in km
 */
interface FlightLeg {
  company?: FlightCompany;
  number?: string;
  class?: string;
  departure?: string;
  arrival?: string;
  durationMinutes?: number;
  distanceInKm?: number;
}

/**
 * Data represented by the ferry leg interface.
 * @property {FerryCompany} [company] - The company
 * @property {number} [durationMinutes] - The duration minutes
 * @property {number} [distanceInKm] - The distance in km
 * @property {City[]} [via] - The via
 */
interface FerryLeg {
  company?: FerryCompany;
  durationMinutes?: number;
  distanceInKm?: number;
  via?: City[];
}

/**
 * Origin or return city of a trip (e.g. home city).
 * @property {City} city - The endpoint city
 */
export interface TripEndpoint {
  city: City;
}

/**
 * A city visit within a trip, with date range, optional photos and layover flag.
 * @property {City} city - The visited city
 * @property {Date} sDate - The visit start date
 * @property {Date} eDate - The visit end date
 * @property {Image[]} [photos] - The visit photos
 * @property {string} [imgSource] - The visit image source
 * @property {boolean} [isLayover] - Whether the visit is a layover
 * @property {{ minPhotos?: number; maxPhotos?: number }} [rowConstraints] - Gallery row constraints
 * @property {number} [targetRowHeight] - Gallery target row height
 */
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

/**
 * A transport step (flight, ferry, drive, etc.) between two cities in a trip.
 * @property {"transport"} type - The route step discriminator
 * @property {TransportMode} mode - The transport mode
 * @property {City} from - The origin city
 * @property {City} to - The destination city
 * @property {Date} [sDate] - The departure date
 * @property {Date} [eDate] - The arrival date
 * @property {number} [distanceInKm] - The distance in kilometers
 * @property {number} [durationMinutes] - The duration in minutes
 * @property {City[]} [via] - Intermediate cities
 * @property {FlightLeg} [flight] - Flight-specific metadata
 * @property {FerryLeg} [ferry] - Ferry-specific metadata
 * @property {boolean} [roundTrip] - Whether the step is a round trip
 */
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

/**
 * A stop step (city visit) within a trip's route steps array.
 * @property {"stop"} type - The route step discriminator
 */
export interface TripStopStep extends TripStop {
  type: "stop";
}

/**
 * Union of a stop step and a transport step — one element in a trip's route.
 */
export type TripRouteStep = TripStopStep | TripTransportStep;

/**
 * A resolved city visit derived from route steps, enriched with visit index and arrival mode.
 * @property {number} travelIdx - The city's travel index
 * @property {TransportMode} [arrivalTransport] - The transport mode used to arrive
 */
export interface TripDestination extends TripStop {
  travelIdx: number;
  arrivalTransport?: TransportMode;
}

/**
 * Data represented by the trip data interface.
 * @property {string} id - The id
 * @property {string} [title] - The canonical trip title
 * @property {Record<string, string>} [titleByLocale] - Locale-specific trip titles
 * @property {string} [description] - The description
 * @property {Date} sDate - The trip start date
 * @property {Date} eDate - The trip end date
 * @property {TripRouteStep[]} steps - The steps
 * @property {string} [backgroundImgSourceKey] - The background img source key
 * @property {string} [coverImage] - A CDN-relative cover image path
 * @property {TripEndpoint} origin - The origin
 * @property {TripEndpoint} returnTo - The return to
 * @property {{ center: [number, number]; zoom: number }} [mapFocus] - The map focus
 */
interface TripData {
  id: string;
  title?: string;
  titleByLocale?: Record<string, string>;
  description?: string;
  sDate: Date;
  eDate: Date;
  steps: TripRouteStep[];
  backgroundImgSourceKey?: string;
  coverImage?: string;
  origin: TripEndpoint;
  returnTo: TripEndpoint;
  mapFocus?: { center: [number, number]; zoom: number };
}

/**
 * Represents a single travel trip — its origin, itinerary steps, date range,
 * and derived destination list. Provides helpers to extract flights, ferries,
 * visited countries, and map route coordinates.
 * @class
 * @param {TripData} data - The trip data
 * @param {string} data.id - The trip identifier
 * @param {string} [data.title] - The canonical trip title
 * @param {Record<string, string>} [data.titleByLocale] - Locale-specific trip titles
 * @param {string} [data.description] - The optional trip description
 * @param {Date} data.sDate - The trip start date
 * @param {Date} data.eDate - The trip end date
 * @param {TripRouteStep[]} data.steps - The ordered route steps
 * @param {string} [data.backgroundImgSourceKey] - The background image key
 * @param {string} [data.coverImage] - The CDN-relative cover image path
 * @param {TripEndpoint} data.origin - The trip origin
 * @param {TripEndpoint} data.returnTo - The trip return endpoint
 * @param {{ center: [number, number]; zoom: number }} [data.mapFocus] - The authored map viewport
 */
export class Trip {
  id: string;
  title: string;
  titleByLocale?: Record<string, string>;
  sDate: Date;
  eDate: Date;
  steps: TripRouteStep[];
  destinations: TripDestination[];
  route: City["id"][];
  backgroundImgSource?: string;
  origin: TripEndpoint;
  returnTo: TripEndpoint;
  mapFocus?: { center: [number, number]; zoom: number };

  /**
   * Creates a trip instance.
   * @param {TripData} data - The data
   */
  constructor(data: TripData) {
    this.id = data.id;
    this.title = data.title ?? data.id;
    this.titleByLocale = data.titleByLocale;
    this.sDate = data.sDate;
    this.eDate = data.eDate;
    this.steps = data.steps;
    this.origin = data.origin;
    this.returnTo = data.returnTo;
    this.mapFocus = data.mapFocus;
    this.destinations = this.getDestinationsFromSteps();
    this.route = this.destinations.flatMap((destination) =>
      destination.isLayover ? [] : [destination.city.id],
    );
    this.backgroundImgSource = data.coverImage
      ? `${import.meta.env.VITE_CDN_PATH}${data.coverImage}`
      : data.backgroundImgSourceKey
        ? `https://pivi-travel-map.b-cdn.net/TravelMap/Trips/${data.backgroundImgSourceKey}`
        : this.destinations[0]?.city.getBackgroundImgSourceByIndex(0) ||
          undefined;
  }

  /**
   * Calculates the inclusive duration of the trip in calendar days.
   * @returns {number} The inclusive trip duration
   */
  getDurationInDays(): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const durationInMilliseconds = this.eDate.getTime() - this.sDate.getTime();
    return Math.ceil(durationInMilliseconds / millisecondsPerDay) + 1;
  }

  /**
   * Resolves the trip title for a locale.
   * @param {string} locale - The active locale
   * @returns {string} The localized or canonical trip title
   */
  getLocalizedTitle(locale: string): string {
    return localize(
      { name: this.title, nameByLocale: this.titleByLocale },
      locale,
    );
  }

  /**
   * Returns the unique countries visited outside layover stops.
   * @returns {Country[]} The countries visited during the trip
   */
  getCountriesVisited(): Country[] {
    return unique(
      this.destinations.flatMap((destination) =>
        destination.isLayover ? [] : [destination.city.country],
      ),
    );
  }

  /**
   * Builds travel records for every stay in a specific city.
   * @param {City} city - The city whose stays should be returned
   * @returns {Travel[]} The city's travel records
   */
  getCityTravels(city: City): Travel[] {
    return this.destinations.flatMap((destination) =>
      destination.city.id === city.id
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

  /**
   * Builds flight records from the trip's plane transport steps.
   * @returns {Flight[]} The flights taken during the trip
   */
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

  /**
   * Builds ferry records from the trip's ferry transport steps.
   * @returns {Ferry[]} The ferries taken during the trip
   */
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

  /**
   * Returns the transport steps that connect trip destinations.
   * @returns {TripTransportStep[]} The trip's transport segments
   */
  getRouteSegments(): TripTransportStep[] {
    return this.steps.filter(
      (step): step is TripTransportStep => step.type === "transport",
    );
  }

  /**
   * Flattens transport steps into origin-destination coordinate pairs.
   * @returns {[number, number][]} Coordinates consumed in pairs by the route overlay
   */
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

  /**
   * Derives destination records and arrival modes from ordered trip steps.
   * @returns {TripDestination[]} The normalized trip destinations
   */
  private getDestinationsFromSteps(): TripDestination[] {
    const cityIndexes = new Map<string, number>();
    let arrivalTransport: TransportMode | undefined;

    return this.steps.flatMap((step) => {
      if (step.type === "transport") {
        arrivalTransport = step.mode;
        return [];
      }

      const travelIdx = cityIndexes.get(step.city.id) ?? 0;
      cityIndexes.set(step.city.id, travelIdx + 1);
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
import { FerryCompany } from "../typings/FerryCompany";
import { FlightCompany } from "../typings/FlightCompany";
