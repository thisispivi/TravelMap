import { unique } from "remeda";

import { CompanyId, PublishedImage, TransportMode } from "../schema";
import { localize } from "../typings/Localized";
import { daysBetween, formatLocalDate, parseLocalDate } from "../world/date";
import { Measured } from "../world/derive";
import { mediaUrl } from "../world/media";
import { City } from "./City";
import { Country } from "./Country";
import { Ferry } from "./Ferry";
import { Flight } from "./Flight";
import { Travel } from "./Travel";

/**
 * Airline details recorded on a plane leg.
 * @property {CompanyId} [company] - The airline id
 * @property {string} [number] - The flight number
 * @property {string} [class] - The cabin class
 */
interface FlightDetails {
  company?: CompanyId;
  number?: string;
  class?: string;
}

/**
 * Gallery layout overrides for a visit's photos.
 * @property {number} [minPhotos] - Fewest photos per gallery row
 * @property {number} [maxPhotos] - Most photos per gallery row
 */
interface RowConstraints {
  minPhotos?: number;
  maxPhotos?: number;
}

/**
 * One resolved ride. `depart` and `arrive` keep the authored wall-clock strings
 * because each is local to a different city; reading them as one `Date` would
 * silently apply the browser's zone to both.
 * @property {"move" | "outing"} context - Whether it relocates or is part of a day trip
 * @property {TransportMode} mode - How the traveller moved
 * @property {City} from - Where the ride started
 * @property {City} to - Where the ride ended
 * @property {City[]} via - Cities passed through without stopping
 * @property {string} [depart] - Departure, local to `from`
 * @property {string} [arrive] - Arrival, local to `to`
 * @property {string} date - The calendar day the ride arrived, best known
 * @property {Date} arrivedAt - When `to` was reached, the identity its gallery is found by
 * @property {Measured} distance - Kilometres, flagged when estimated
 * @property {Measured} duration - Minutes, flagged when estimated
 * @property {boolean} visited - Whether `to` was a place seen rather than passed through
 * @property {PublishedImage[]} [photos] - Photos taken at `to`
 * @property {RowConstraints} [rowConstraints] - Gallery row overrides
 * @property {number} [targetRowHeight] - Gallery row height override
 * @property {FlightDetails} [flight] - Airline details
 * @property {CompanyId} [ferryCompany] - The ferry operator
 */
export interface TripLeg {
  context: "move" | "outing";
  mode: TransportMode;
  from: City;
  to: City;
  via: City[];
  depart?: string;
  arrive?: string;
  date: string;
  arrivedAt: Date;
  distance: Measured;
  duration: Measured;
  visited: boolean;
  photos?: PublishedImage[];
  rowConstraints?: RowConstraints;
  targetRowHeight?: number;
  flight?: FlightDetails;
  ferryCompany?: CompanyId;
}

/**
 * A day trip: leaves a stay, sees one or more places, and returns.
 * @property {string} date - The calendar day of the outing
 * @property {TripLeg[]} legs - Rides in order, the last one back to the stay
 */
export interface TripOuting {
  date: string;
  legs: TripLeg[];
}

/**
 * A place the traveller slept.
 * @property {"stay"} type - The step discriminator
 * @property {City} city - Where they slept
 * @property {string} checkIn - The first night's date
 * @property {string} checkOut - The morning they left
 * @property {number} nights - Nights slept here
 * @property {PublishedImage[]} [photos] - Photos of the stay
 * @property {RowConstraints} [rowConstraints] - Gallery row overrides
 * @property {number} [targetRowHeight] - Gallery row height override
 * @property {TripOuting[]} outings - Day trips taken from here
 */
export interface TripStay {
  type: "stay";
  city: City;
  checkIn: string;
  checkOut: string;
  nights: number;
  photos?: PublishedImage[];
  rowConstraints?: RowConstraints;
  targetRowHeight?: number;
  outings: TripOuting[];
}

/**
 * Getting from one stay (or the trip's origin) to the next.
 * @property {"move"} type - The step discriminator
 * @property {City} from - Where the move started
 * @property {City} to - Where it ended
 * @property {TripLeg[]} legs - Rides in order
 */
export interface TripMove {
  type: "move";
  from: City;
  to: City;
  legs: TripLeg[];
}

/** One element of a resolved itinerary. */
export type TripStep = TripStay | TripMove;

/** Whether a destination was slept in, seen, or only passed through. */
export type DestinationKind = "stay" | "visit" | "stopover";

/**
 * Every place the trip touched, in order, in the shape galleries and city
 * statistics read.
 * @property {City} city - The place
 * @property {DestinationKind} kind - Slept in, seen, or passed through
 * @property {Date} sDate - Arrival
 * @property {Date} eDate - Departure
 * @property {PublishedImage[]} [photos] - Photos taken there
 * @property {RowConstraints} [rowConstraints] - Gallery row overrides
 * @property {number} [targetRowHeight] - Gallery row height override
 * @property {number} travelIdx - How many earlier destinations in this trip were the same city
 * @property {TransportMode} [arrivalTransport] - How the traveller arrived
 */
export interface TripDestination {
  city: City;
  kind: DestinationKind;
  sDate: Date;
  eDate: Date;
  photos?: PublishedImage[];
  rowConstraints?: RowConstraints;
  targetRowHeight?: number;
  travelIdx: number;
  arrivalTransport?: TransportMode;
}

/**
 * Totals for one transport mode.
 * @property {number} count - Rides taken
 * @property {number} km - Kilometres covered
 * @property {number} minutes - Minutes spent
 */
export interface ModeTotal {
  count: number;
  km: number;
  minutes: number;
}

/**
 * Data used to construct a trip.
 * @property {string} id - The id
 * @property {string} [title] - The canonical trip title
 * @property {Record<string, string>} [titleByLocale] - Locale-specific trip titles
 * @property {Date} sDate - The trip start date
 * @property {Date} eDate - The trip end date
 * @property {City} origin - Where the trip started
 * @property {TripStep[]} steps - The resolved itinerary
 * @property {string} [coverImage] - A CDN-relative cover image path
 * @property {{ center: [number, number]; zoom: number }} [mapFocus] - The map focus
 */
interface TripData {
  id: string;
  title?: string;
  titleByLocale?: Record<string, string>;
  sDate: Date;
  eDate: Date;
  origin: City;
  steps: TripStep[];
  coverImage?: string;
  mapFocus?: { center: [number, number]; zoom: number };
}

/**
 * A journey as an alternation of stays and moves, with day trips hanging off
 * the stays. Everything a reader asks — where they slept, how they moved, how
 * far — is answered from that structure rather than guessed from dates.
 * @class
 * @param {TripData} data - The trip data
 * @param {string} data.id - The trip identifier
 * @param {string} [data.title] - The canonical trip title
 * @param {Record<string, string>} [data.titleByLocale] - Locale-specific trip titles
 * @param {Date} data.sDate - The trip start date
 * @param {Date} data.eDate - The trip end date
 * @param {City} data.origin - Where the trip started
 * @param {TripStep[]} data.steps - The resolved itinerary
 * @param {string} [data.coverImage] - The CDN-relative cover image path
 * @param {{ center: [number, number]; zoom: number }} [data.mapFocus] - The authored map viewport
 */
export class Trip {
  id: string;
  title: string;
  titleByLocale?: Record<string, string>;
  sDate: Date;
  eDate: Date;
  origin: City;
  returnTo: City;
  steps: TripStep[];
  stays: TripStay[];
  moves: TripMove[];
  destinations: TripDestination[];
  route: City["id"][];
  backgroundImgSource?: string;
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
    this.origin = data.origin;
    this.steps = data.steps;
    this.mapFocus = data.mapFocus;
    this.stays = data.steps.filter((step) => step.type === "stay");
    this.moves = data.steps.filter((step) => step.type === "move");
    this.returnTo = this.getLegs().at(-1)?.to ?? data.origin;
    this.destinations = this.getDestinationsFromSteps();
    this.route = this.destinations.flatMap((destination) =>
      destination.kind === "stopover" ? [] : [destination.city.id],
    );
    this.backgroundImgSource = data.coverImage
      ? mediaUrl(data.coverImage)
      : this.stays[0]?.city.getBackgroundImgSourceByIndex(0) || undefined;
  }

  /**
   * Reports whether the trip has not started yet. Planned travel is kept out of
   * the historical record — trip lists, statistics, and visited places — while
   * still surfacing its cities as planned, so the numbers only ever describe
   * journeys that actually happened.
   * @param {Date} [reference=new Date()] - The moment to compare against
   * @returns {boolean} Whether the trip starts after the reference day
   */
  isFuture(reference: Date = new Date()): boolean {
    const startOfReferenceDay = new Date(reference);
    startOfReferenceDay.setHours(0, 0, 0, 0);
    return this.sDate.getTime() > startOfReferenceDay.getTime();
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
   * Counts the nights slept in a stay. A night spent on a plane or train is not
   * one of them, and neither is a layover.
   * @returns {number} Nights slept in a bed somewhere
   */
  getNights(): number {
    return this.stays.reduce((sum, stay) => sum + stay.nights, 0);
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
   * Lists every ride in travel order: each move's legs, and each stay's day
   * trips right after the stay they leave from.
   * @returns {TripLeg[]} The trip's legs
   */
  getLegs(): TripLeg[] {
    return this.steps.flatMap((step) =>
      step.type === "move"
        ? step.legs
        : step.outings.flatMap((outing) => outing.legs),
    );
  }

  /**
   * Adds up rides, distance, and time for every mode used.
   * @returns {Partial<Record<TransportMode, ModeTotal>>} Totals keyed by mode
   */
  getModeTotals(): Partial<Record<TransportMode, ModeTotal>> {
    const totals: Partial<Record<TransportMode, ModeTotal>> = {};
    for (const leg of this.getLegs()) {
      const total = (totals[leg.mode] ??= { count: 0, km: 0, minutes: 0 });
      total.count += 1;
      total.km += leg.distance.value;
      total.minutes += leg.duration.value;
    }
    return totals;
  }

  /**
   * Lists the cities touched only in passing: airports, changes, and the
   * cities a ferry or bus called at, so the map can mark them quietly.
   * @returns {City[]} Unique pass-through cities
   */
  getPassThroughCities(): City[] {
    const seen = new Set(this.route);
    return unique([
      this.origin,
      ...this.destinations.flatMap((destination) =>
        destination.kind === "stopover" ? [destination.city] : [],
      ),
      ...this.getLegs().flatMap((leg) => leg.via),
    ]).filter((city) => !seen.has(city.id));
  }

  /**
   * Returns the unique countries visited outside layover stops.
   * @returns {Country[]} The countries visited during the trip
   */
  getCountriesVisited(): Country[] {
    return unique(
      this.destinations.flatMap((destination) =>
        destination.kind === "stopover" ? [] : [destination.city.country],
      ),
    );
  }

  /**
   * Builds travel records for every visit to a specific city.
   * @param {City} city - The city whose visits should be returned
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
   * Builds flight records from the trip's plane legs.
   * @returns {Flight[]} The flights taken during the trip
   */
  getFlights(): Flight[] {
    return this.getLegs().flatMap((leg) =>
      leg.mode === "plane"
        ? [
            new Flight({
              sCity: leg.from,
              eCity: leg.to,
              company: leg.flight?.company,
              sDate: leg.depart ? parseLocalDate(leg.depart) : undefined,
              eDate: leg.arrive ? parseLocalDate(leg.arrive) : undefined,
              distanceInKm: leg.distance.value,
              durationMinutes: leg.duration.value,
              number: leg.flight?.number,
              class: leg.flight?.class,
            }),
          ]
        : [],
    );
  }

  /**
   * Builds ferry records from the trip's ferry legs.
   * @returns {Ferry[]} The ferries taken during the trip
   */
  getFerries(): Ferry[] {
    return this.getLegs().flatMap((leg) =>
      leg.mode === "ferry"
        ? [
            new Ferry({
              sCity: leg.from,
              eCity: leg.to,
              company: leg.ferryCompany,
              sDate: leg.depart ? parseLocalDate(leg.depart) : undefined,
              eDate: leg.arrive ? parseLocalDate(leg.arrive) : undefined,
              via: leg.via,
              distanceInKm: leg.distance.value,
              durationMinutes: leg.duration.value,
            }),
          ]
        : [],
    );
  }

  /**
   * Flattens legs into origin-destination coordinate pairs.
   * @returns {[number, number][]} Coordinates consumed in pairs by the route overlay
   */
  getRouteLines(): [number, number][] {
    return this.getLegs().flatMap((leg) => {
      const cities = [leg.from, ...leg.via, leg.to];
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
   * Lists every place in travel order: the origin, each stay, each place seen
   * on a day trip or along a move, and every stopover in between.
   * @returns {TripDestination[]} The trip's destinations
   */
  private getDestinationsFromSteps(): TripDestination[] {
    const cityIndexes = new Map<string, number>();
    const startDay = parseLocalDate(formatLocalDate(this.sDate).slice(0, 10));

    /**
     * Numbers a city's repeat visits within this trip.
     * @param {Omit<TripDestination, "travelIdx">} destination - The place without its index
     * @returns {TripDestination} The place with its index
     */
    const indexed = (
      destination: Omit<TripDestination, "travelIdx">,
    ): TripDestination => {
      const travelIdx = cityIndexes.get(destination.city.id) ?? 0;
      cityIndexes.set(destination.city.id, travelIdx + 1);
      return { ...destination, travelIdx };
    };

    /**
     * Turns a leg's arrival into the place it reached.
     * @param {TripLeg} leg - The leg
     * @param {DestinationKind} kind - What the arrival was
     * @returns {TripDestination} The place
     */
    const arrivalOf = (
      leg: TripLeg,
      kind: DestinationKind,
    ): TripDestination => {
      return indexed({
        city: leg.to,
        kind,
        sDate: leg.arrivedAt,
        eDate: leg.arrivedAt,
        photos: leg.photos,
        rowConstraints: leg.rowConstraints,
        targetRowHeight: leg.targetRowHeight,
        arrivalTransport: leg.mode,
      });
    };

    const destinations: TripDestination[] = [
      indexed({
        city: this.origin,
        kind: "stopover",
        sDate: startDay,
        eDate: startDay,
      }),
    ];

    this.steps.forEach((step, index) => {
      const previous = this.steps[index - 1];
      if (step.type === "stay") {
        destinations.push(
          indexed({
            city: step.city,
            kind: "stay",
            sDate: parseLocalDate(step.checkIn),
            eDate: parseLocalDate(step.checkOut),
            photos: step.photos,
            rowConstraints: step.rowConstraints,
            targetRowHeight: step.targetRowHeight,
            arrivalTransport:
              previous?.type === "move"
                ? previous.legs.at(-1)?.mode
                : undefined,
          }),
        );
        for (const outing of step.outings)
          for (const leg of outing.legs.slice(0, -1))
            destinations.push(arrivalOf(leg, "visit"));
        return;
      }

      const endsAtStay = this.steps[index + 1]?.type === "stay";
      const passedThrough = endsAtStay ? step.legs.slice(0, -1) : step.legs;
      for (const leg of passedThrough)
        destinations.push(arrivalOf(leg, leg.visited ? "visit" : "stopover"));
    });

    return destinations;
  }
}

/**
 * Counts the nights between two calendar dates.
 * @param {string} checkIn - The first night
 * @param {string} checkOut - The morning of departure
 * @returns {number} Nights, never negative
 */
export function countNights(checkIn: string, checkOut: string): number {
  return Math.max(0, daysBetween(checkIn, checkOut));
}
