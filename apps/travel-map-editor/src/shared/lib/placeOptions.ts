import { COUNTRIES } from "@travelmap/core";
import { flagUrl } from "@travelmap/ui/lib/flags";

import { DatasetSnapshot } from "@/data/store";

import { ComboboxOption } from "../components/Combobox/Combobox";

/**
 * Builds the country choices from the catalogue, by name, each carrying its flag.
 * @returns {ComboboxOption[]} Country options
 */
export function countryOptions(): ComboboxOption[] {
  return [...COUNTRIES.values()]
    .map((country) => ({
      iconUrl: flagUrl(country.id),
      label: country.name,
      value: country.id,
    }))
    .toSorted((first, second) => first.label.localeCompare(second.label));
}

/**
 * Builds the city choices, each hinted with its country and flag.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {ComboboxOption[]} City options
 */
export function cityOptions(dataset: DatasetSnapshot): ComboboxOption[] {
  return dataset.cities.map(({ value }) => ({
    hint: value.countryId,
    iconUrl: flagUrl(value.countryId),
    label: value.name,
    value: value.id,
  }));
}

/**
 * Lists the IANA timezones as searchable options.
 * @returns {ComboboxOption[]} Timezone options
 */
export function timeZoneOptions(): ComboboxOption[] {
  return Intl.supportedValuesOf("timeZone").map((timeZone) => ({
    label: timeZone,
    value: timeZone,
  }));
}

/**
 * Indexes city coordinates by id, so leg derivation can look them up without
 * scanning the dataset for every step.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {Map<string, [number, number]>} Coordinates keyed by city id
 */
export function cityCoordinates(
  dataset: DatasetSnapshot,
): Map<string, [number, number]> {
  return new Map(
    dataset.cities.map(({ value }) => [value.id, value.coordinates] as const),
  );
}
