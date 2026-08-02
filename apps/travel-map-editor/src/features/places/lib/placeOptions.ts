import { DatasetSnapshot } from "../../../data/store";
import { ComboboxOption } from "../../../shared/components/Combobox/Combobox";
import { findWorldCountry } from "../../../shared/lib/worldCountries";

/**
 * Builds the country choices, each carrying its flag.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {ComboboxOption[]} Country options
 */
export function countryOptions(dataset: DatasetSnapshot): ComboboxOption[] {
  return dataset.countries.map(({ value }) => ({
    iconUrl: findWorldCountry(value.id)?.flagUrl,
    label: value.name,
    value: value.id,
  }));
}

/**
 * Builds the city choices, each hinted with its country and flag.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {ComboboxOption[]} City options
 */
export function cityOptions(dataset: DatasetSnapshot): ComboboxOption[] {
  return dataset.cities.map(({ value }) => ({
    hint: value.countryId,
    iconUrl: findWorldCountry(value.countryId)?.flagUrl,
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

/**
 * Names cities by id for summaries, degrading to the raw id when a city has
 * been deleted out from under a trip that still references it.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {Map<string, string>} Display names keyed by city id
 */
export function cityNames(dataset: DatasetSnapshot): Map<string, string> {
  return new Map(
    dataset.cities.map(({ value }) => [value.id, value.name] as const),
  );
}
