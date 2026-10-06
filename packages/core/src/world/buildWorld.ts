import { City } from "../classes/City";
import { Country } from "../classes/Country";
import { countNights, Trip, TripLeg, TripStep } from "../classes/Trip";
import {
  hasSource,
  Image,
  PublishedImage,
  TripJson,
  TripLegJson,
  WorldSourcesSchema,
} from "../schema";
import { parseLocalDate } from "./date";
import { resolveLegDistance, resolveLegDuration } from "./derive";

/**
 * Resolved domain data shared by the public app and local editor.
 * @property {Map<string, Country>} countriesById - Countries keyed by stable id
 * @property {Map<string, City>} citiesById - Cities keyed by stable id
 * @property {Trip[]} trips - Trips sorted by start date then id
 * @property {City[]} livedCities - Resolved former-home cities
 * @property {City[]} futureCities - Resolved planned cities
 * @property {City | null} homeCity - Resolved home city
 */
export interface World {
  countriesById: Map<string, Country>;
  citiesById: Map<string, City>;
  trips: Trip[];
  livedCities: City[];
  futureCities: City[];
  homeCity: City | null;
}

/**
 * Resolves a reference or throws close to the malformed JSON that introduced it.
 * @param {Map<string, T>} values - Entities keyed by id
 * @param {string} id - Referenced id
 * @param {string} source - JSON source being resolved
 * @returns {T} The resolved entity
 */
function requireReference<T>(
  values: Map<string, T>,
  id: string,
  source: string,
): T {
  const value = values.get(id);
  if (!value) throw new Error(`${source} references unknown id "${id}"`);
  return value;
}

/* Enough detail to find the offending document without a wall of output. */
const REPORTED_ISSUE_LIMIT = 5;

/**
 * Keeps only the gallery items a visitor could actually open. A video whose
 * YouTube id has not been pasted in yet is valid to store — the editor lists it
 * for the author to finish — but publishing it would render an empty embed, so
 * it stays out of the site until it has a source.
 * @param {Image[]} [images] - The manifest the stop names
 * @returns {PublishedImage[]} The publishable items, in authored order
 */
function publishableImages(images: Image[] = []): PublishedImage[] {
  return images.filter(hasSource);
}

/**
 * Builds one shared graph so all trip references retain object identity.
 * This is the dataset's single trust boundary: callers hand over the raw JSON
 * their bundler loaded and it is validated here, so `sources` is deliberately
 * `unknown` rather than a shape the caller could assert its way into.
 * @param {unknown} sources - Raw JSON modules loaded by an app
 * @returns {World} The resolved world
 */
export function buildWorld(sources: unknown): World {
  const parsed = WorldSourcesSchema.safeParse(sources);
  if (!parsed.success) {
    const { issues } = parsed.error;
    const reported = issues
      .slice(0, REPORTED_ISSUE_LIMIT)
      .map((issue) => `${issue.path.join(".") || "document"}: ${issue.message}`)
      .join("; ");
    const hidden = issues.length - REPORTED_ISSUE_LIMIT;
    throw new Error(
      `Malformed dataset: ${reported}${hidden > 0 ? ` (and ${hidden} more)` : ""}`,
    );
  }

  for (const kind of ["countries", "cities", "trips"] as const) {
    const seen = new Set<string>();
    for (const { id } of parsed.data[kind]) {
      if (seen.has(id)) throw new Error(`Duplicate id "${id}" in ${kind}.`);
      seen.add(id);
    }
  }

  const countriesById = new Map(
    parsed.data.countries.map((data) => [data.id, new Country(data)]),
  );
  const citiesById = new Map(
    parsed.data.cities.map((data) => [
      data.id,
      new City({
        ...data,
        country: requireReference(
          countriesById,
          data.countryId,
          `city ${data.id}`,
        ),
        backgroundImgSources: data.backgroundImages,
      }),
    ]),
  );
  const trips = parsed.data.trips
    .map((data) =>
      resolveTrip(data, citiesById, (path) =>
        path ? publishableImages(parsed.data.photos[path]) : undefined,
      ),
    )
    .sort(
      (a, b) =>
        a.sDate.getTime() - b.sDate.getTime() || a.id.localeCompare(b.id),
    );

  /**
   * Resolves configured city references against the shared city registry.
   * @param {string[]} [ids] - City ids listed in the site configuration
   * @returns {City[]} The resolved cities
   */
  const resolveCities = (ids: string[] = []): City[] =>
    ids.map((id) => requireReference(citiesById, id, "config"));
  const livedCities = Array.from(
    new Map(
      [
        ...Array.from(citiesById.values()).filter((city) => city.isLived),
        ...resolveCities(parsed.data.livedCityIds),
      ].map((city) => [city.id, city]),
    ).values(),
  );

  return {
    countriesById,
    citiesById,
    trips,
    livedCities,
    futureCities: resolveCities(parsed.data.futureCityIds),
    homeCity: parsed.data.homeCityId
      ? requireReference(citiesById, parsed.data.homeCityId, "config")
      : null,
  };
}

/**
 * Resolves one authored leg against the city registry, deciding its distance
 * and duration once so every consumer reads the same numbers.
 * @param {TripLegJson} leg - The authored leg
 * @param {City} from - Where the traveller stood when it began
 * @param {"move" | "outing"} context - What the leg belongs to
 * @param {string} date - The calendar day it happened, best known
 * @param {(id: string) => City} city - Resolves a city id or throws
 * @param {(path?: string) => PublishedImage[] | undefined} photos - Resolves a gallery
 * @returns {TripLeg} The resolved leg
 */
function resolveLeg(
  leg: TripLegJson,
  from: City,
  context: "move" | "outing",
  date: string,
  city: (id: string) => City,
  photos: (path?: string) => PublishedImage[] | undefined,
): TripLeg {
  const to = city(leg.toId);
  const via = (leg.viaIds ?? leg.ferry?.viaIds ?? []).map(city);
  const distance = resolveLegDistance(
    leg,
    [from, ...via, to].map((stop) => stop.coordinates),
  );
  const day = (leg.arrive ?? leg.depart ?? date).slice(0, 10);
  return {
    arrive: leg.arrive,
    arrivedAt: parseLocalDate(leg.arrive ?? day),
    context,
    date: day,
    depart: leg.depart,
    distance,
    duration: resolveLegDuration(
      leg,
      distance.value,
      from.timeZone,
      to.timeZone,
    ),
    ferryCompany: leg.ferry?.company,
    flight: leg.flight,
    from,
    mode: leg.mode,
    photos: photos(leg.photoPath),
    rowConstraints: leg.rowConstraints,
    targetRowHeight: leg.targetRowHeight,
    to,
    via,
    visited: context === "outing" || leg.visited === true,
  };
}

/**
 * Walks a trip's itinerary, tracking where the traveller stands and the latest
 * known date, so every leg learns its departure city and day from the chain.
 * @param {TripJson} data - The authored trip
 * @param {Map<string, City>} citiesById - The city registry
 * @param {(path?: string) => PublishedImage[] | undefined} photos - Resolves a gallery
 * @returns {Trip} The resolved trip
 */
function resolveTrip(
  data: TripJson,
  citiesById: Map<string, City>,
  photos: (path?: string) => PublishedImage[] | undefined,
): Trip {
  /**
   * Resolves a city id against the registry, naming this trip on failure.
   * @param {string} id - The referenced city id
   * @returns {City} The resolved city
   */
  const city = (id: string): City =>
    requireReference(citiesById, id, `trip ${data.id}`);
  const origin = city(data.originCityId);
  let here = origin;
  let day = data.sDate.slice(0, 10);

  /**
   * Resolves a chain of legs from where the traveller currently stands.
   * @param {TripLegJson[]} legs - The authored chain
   * @param {"move" | "outing"} context - What the chain belongs to
   * @param {City} start - Where the chain begins
   * @param {string} [outingDate] - A day trip's date, which every leg shares
   * @returns {TripLeg[]} The resolved chain
   */
  const chain = (
    legs: TripLegJson[],
    context: "move" | "outing",
    start: City,
    outingDate?: string,
  ): TripLeg[] => {
    let from = start;
    return legs.map((leg) => {
      const resolved = resolveLeg(
        leg,
        from,
        context,
        outingDate ?? day,
        city,
        photos,
      );
      from = resolved.to;
      if (context === "move") day = resolved.date;
      return resolved;
    });
  };

  const steps = data.steps.map((step): TripStep => {
    if (step.type === "move") {
      const from = here;
      const legs = chain(step.legs, "move", from);
      here = legs.at(-1)!.to;
      return { from, legs, to: here, type: "move" };
    }

    const stayCity = city(step.cityId);
    here = stayCity;
    day = step.checkOut;
    return {
      checkIn: step.checkIn,
      checkOut: step.checkOut,
      city: stayCity,
      nights: countNights(step.checkIn, step.checkOut),
      outings: (step.outings ?? []).map((outing) => ({
        date: outing.date,
        legs: chain(outing.legs, "outing", stayCity, outing.date),
      })),
      photos: photos(step.photoPath),
      rowConstraints: step.rowConstraints,
      targetRowHeight: step.targetRowHeight,
      type: "stay",
    };
  });

  return new Trip({
    coverImage: data.coverImage,
    eDate: parseLocalDate(data.eDate),
    id: data.id,
    mapFocus: data.mapFocus,
    origin,
    sDate: parseLocalDate(data.sDate),
    steps,
    title: data.title,
    titleByLocale: data.titleByLocale,
  });
}
