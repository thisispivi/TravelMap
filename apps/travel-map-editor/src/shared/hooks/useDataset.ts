import { Issue, validateDataset } from "@travelmap/core";
import { useSyncExternalStore } from "react";

import { photoKeys } from "../../data/dataset";
import {
  DatasetSnapshot,
  getDataset,
  getSessionChanges,
  subscribeToDataset,
} from "../../data/store";

/**
 * Subscribes a component to the authored dataset. The store publishes a fresh
 * snapshot object on every write, so a created or deleted document reaches the
 * UI without the document reload the previous editor depended on.
 * @returns {DatasetSnapshot} The current dataset
 */
export function useDataset(): DatasetSnapshot {
  return useSyncExternalStore(subscribeToDataset, getDataset);
}

/**
 * Subscribes a component to what this session has written, for the changes
 * tray and the commit checklist.
 * @returns {ReturnType<typeof getSessionChanges>} Every touched path
 */
export function useSessionChanges(): ReturnType<typeof getSessionChanges> {
  return useSyncExternalStore(subscribeToDataset, getSessionChanges);
}

/**
 * Checks the whole dataset against the shared rules in `@travelmap/core`.
 * This runs on every dataset change rather than once per document load, which
 * is what makes the problem count trustworthy while editing.
 * @param {DatasetSnapshot} dataset - The dataset to check
 * @returns {Issue[]} Every problem found, most severe first
 */
export function datasetIssues(dataset: DatasetSnapshot): Issue[] {
  return validateDataset({
    cities: dataset.cities,
    countries: dataset.countries,
    futureCityIds: dataset.config.value.futureCityIds,
    homeCityId: dataset.config.value.homeCityId,
    livedCityIds: dataset.config.value.livedCityIds,
    photoKeys: photoKeys(dataset),
    trips: dataset.trips,
  });
}
