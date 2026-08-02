import type { CityJson, CountryJson, TripJson } from "../schema";
import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import type { Issue, IssueSeverity } from "./issues";
import { validateTrip } from "./validateTrip";

/**
 * One dataset file paired with the path it is stored at.
 * @property {string} path - Dataset-relative JSON path
 * @property {T} value - Parsed JSON value
 */
export interface DatasetDocument<T> {
  path: string;
  value: T;
}

/**
 * The whole authored dataset, as loaded by either app.
 * @property {DatasetDocument<CountryJson>[]} countries - Country documents
 * @property {DatasetDocument<CityJson>[]} cities - City documents
 * @property {DatasetDocument<TripJson>[]} trips - Trip documents
 * @property {string[]} photoKeys - Gallery manifest keys present on disk
 * @property {string | null} [homeCityId] - Configured home city
 * @property {string[]} [livedCityIds] - Configured former-home cities
 * @property {string[]} [futureCityIds] - Configured planned cities
 */
export interface DatasetSources {
  countries: DatasetDocument<CountryJson>[];
  cities: DatasetDocument<CityJson>[];
  trips: DatasetDocument<TripJson>[];
  photoKeys: string[];
  homeCityId?: string | null;
  livedCityIds?: string[];
  futureCityIds?: string[];
}

const CONFIG_PATH = "site.config.json";
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

/**
 * Checks every document in the dataset and returns one flat list of problems.
 * Cross-document rules live here; anything checkable from a single trip lives
 * in `validateTrip` so an editor can re-run it on every keystroke cheaply.
 * @param {DatasetSources} sources - The whole authored dataset
 * @returns {Issue[]} Every problem found across the dataset
 */
export function validateDataset(sources: DatasetSources): Issue[] {
  const issues: Issue[] = [];
  const cities = new Map(
    sources.cities.map(({ value }) => [value.id, value] as const),
  );
  const countryIds = new Set(sources.countries.map(({ value }) => value.id));
  const photoKeys = new Set(sources.photoKeys);
  const continents = new Set<string>(Object.values(Continent));
  const currencies = new Set<string>(Object.values(Currency));

  /**
   * Records one dataset-level problem.
   * @param {Issue} issue - The fully-formed issue
   * @returns {void}
   */
  function report(issue: Issue): void {
    issues.push(issue);
  }

  /**
   * Flags any identifier used by more than one document of the same kind,
   * which would silently shadow one file with another on load.
   * @param {DatasetDocument<{ id: string }>[] } documents - Documents to scan
   * @param {"city" | "country" | "trip"} kind - What is being scanned
   * @returns {void}
   */
  function reportDuplicateIds(
    documents: DatasetDocument<{ id: string }>[],
    kind: "city" | "country" | "trip",
  ): void {
    const seen = new Set<string>();
    for (const { path, value } of documents) {
      if (seen.has(value.id))
        report({
          code: "dataset.duplicateId",
          message: `More than one ${kind} uses the id "${value.id}".`,
          params: { id: value.id, kind },
          path,
          severity: "blocking",
          subject:
            kind === "trip"
              ? { kind: "trip", tripId: value.id }
              : kind === "city"
                ? { cityId: value.id, kind: "city" }
                : { countryId: value.id, kind: "country" },
        });
      seen.add(value.id);
    }
  }

  reportDuplicateIds(sources.countries, "country");
  reportDuplicateIds(sources.cities, "city");
  reportDuplicateIds(sources.trips, "trip");

  for (const { path, value } of sources.countries) {
    if (!value.name.trim())
      report({
        code: "country.nameRequired",
        message: `Country "${value.id}" has no name.`,
        params: { id: value.id },
        path,
        severity: "blocking",
        subject: { countryId: value.id, kind: "country" },
      });
    if (!continents.has(value.continent))
      report({
        code: "country.unknownContinent",
        message: `Country "${value.id}" has an unrecognised continent.`,
        params: { id: value.id },
        path,
        severity: "blocking",
        subject: { countryId: value.id, kind: "country" },
      });
    if (!currencies.has(value.currency))
      report({
        code: "country.unknownCurrency",
        message: `Country "${value.id}" has an unrecognised currency.`,
        params: { id: value.id },
        path,
        severity: "blocking",
        subject: { countryId: value.id, kind: "country" },
      });
  }

  for (const { path, value } of sources.cities) {
    if (!countryIds.has(value.countryId))
      report({
        code: "city.unknownCountry",
        message: `City "${value.id}" belongs to the unknown country "${value.countryId}".`,
        params: { countryId: value.countryId, id: value.id },
        path,
        severity: "blocking",
        subject: { cityId: value.id, kind: "city" },
      });
    if (!value.timeZone.trim())
      report({
        code: "city.timeZoneRequired",
        message: `City "${value.id}" has no timezone.`,
        params: { id: value.id },
        path,
        severity: "blocking",
        subject: { cityId: value.id, kind: "city" },
      });

    const [longitude, latitude] = value.coordinates;
    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      Math.abs(longitude) > MAX_LONGITUDE ||
      Math.abs(latitude) > MAX_LATITUDE
    )
      report({
        code: "city.invalidCoordinates",
        message: `City "${value.id}" has coordinates outside the world.`,
        params: { id: value.id },
        path,
        severity: "blocking",
        subject: { cityId: value.id, kind: "city" },
      });
    else if (longitude === 0 && latitude === 0)
      report({
        code: "city.nullIsland",
        message: `City "${value.id}" sits at 0,0, which usually means its position was never set.`,
        params: { id: value.id },
        path,
        severity: "warning",
        subject: { cityId: value.id, kind: "city" },
      });
  }

  for (const { path, value } of sources.trips)
    issues.push(...validateTrip(value, { cities, photoKeys }, path));

  const usedCityIds = new Set(
    sources.trips.flatMap(({ value }) =>
      value.steps.flatMap((step) =>
        step.type === "stop"
          ? [step.cityId]
          : [step.fromId, step.toId, ...(step.viaIds ?? [])],
      ),
    ),
  );
  const configuredCityIds = new Set([
    ...(sources.livedCityIds ?? []),
    ...(sources.futureCityIds ?? []),
    ...(sources.homeCityId ? [sources.homeCityId] : []),
  ]);

  /* A planned or former-home city legitimately has no trip yet. */
  for (const { path, value } of sources.cities)
    if (
      !usedCityIds.has(value.id) &&
      !configuredCityIds.has(value.id) &&
      !value.isLived
    )
      report({
        code: "city.unused",
        message: `City "${value.id}" is not used by any trip.`,
        params: { id: value.id },
        path,
        severity: "suggestion",
        subject: { cityId: value.id, kind: "city" },
      });

  for (const [id, field] of [
    ...(sources.homeCityId
      ? [[sources.homeCityId, "homeCityId"] as const]
      : []),
    ...(sources.livedCityIds ?? []).map(
      (cityId) => [cityId, "livedCityIds"] as const,
    ),
    ...(sources.futureCityIds ?? []).map(
      (cityId) => [cityId, "futureCityIds"] as const,
    ),
  ])
    if (!cities.has(id))
      report({
        code: "config.unknownCity",
        message: `The site configuration's ${field} references the unknown city "${id}".`,
        params: { field, id },
        path: CONFIG_PATH,
        severity: "blocking",
        subject: { kind: "config" },
      });

  const order: Record<IssueSeverity, number> = {
    blocking: 0,
    suggestion: 2,
    warning: 1,
  };
  return issues.toSorted(
    (first, second) =>
      order[first.severity] - order[second.severity] ||
      first.path.localeCompare(second.path),
  );
}
