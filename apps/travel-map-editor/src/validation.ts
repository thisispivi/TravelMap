import { buildWorld, Image } from "@travelmap/core";

import { cities, config, countries, photos, trips } from "./dataset";

/**
 * The outcome of checking the dataset for authoring mistakes.
 * @property {string[]} errors - Problems that break the public app
 * @property {string[]} warnings - Situations worth reviewing but still valid
 */
export interface DatasetReport {
  errors: string[];
  warnings: string[];
}

/**
 * Checks dataset references and separates fatal problems from advisories.
 * @returns {DatasetReport} Errors and warnings for the overview screen
 */
export function reviewDataset(): DatasetReport {
  const photoIndex: Record<string, Image[]> = Object.fromEntries(
    photos.map(({ path, value }) => [
      path.replace(/^photos\//, "").replace(/\.json$/, ""),
      value,
    ]),
  );
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    buildWorld({
      cities: cities.map(({ value }) => value),
      countries: countries.map(({ value }) => value),
      futureCityIds: config.value.futureCityIds,
      homeCityId: config.value.homeCityId,
      livedCityIds: config.value.livedCityIds,
      photos: photoIndex,
      trips: trips.map(({ value }) => value),
    });
  } catch (error) {
    errors.push(
      error instanceof Error
        ? error.message
        : "The dataset could not be built.",
    );
  }

  // A stop whose manifest is absent renders an empty gallery rather than
  // failing, which matches how the public app resolves photos.
  trips.forEach(({ value }) =>
    value.steps.forEach((step, index) => {
      if (step.type !== "stop" || !step.photoPath) return;
      if (!(step.photoPath in photoIndex))
        warnings.push(
          `Trip ${value.id} step ${index + 1} references a missing photo manifest "${step.photoPath}".`,
        );
    }),
  );

  const usedCities = new Set(
    trips.flatMap(({ value }) =>
      value.steps.flatMap((step) =>
        step.type === "stop"
          ? [step.cityId]
          : [step.fromId, step.toId, ...(step.viaIds ?? [])],
      ),
    ),
  );
  // Planned and former-home cities legitimately have no trip yet, so an unused
  // city is only worth mentioning.
  cities
    .filter(({ value }) => !usedCities.has(value.id))
    .forEach(({ value }) =>
      warnings.push(`City ${value.id} is not used by any trip.`),
    );
  trips
    .filter(({ value }) => value.steps.length === 0)
    .forEach(({ value }) => warnings.push(`Trip ${value.id} has no steps.`));

  return { errors, warnings };
}
