import { TripJson } from "@travelmap/core";

import { DatasetSnapshot, DocumentWrite } from "../../../data/store";
import { addStop } from "../../itinerary/lib/itinerary";
import { searchWorldCities, WorldCity } from "../../places/lib/gazetteer";
import { findNearbyCity, planPlace } from "../../places/lib/placeCreate";
import { cityCoordinates } from "../../places/lib/placeOptions";
import { ParsedRow } from "./parseInput";

/** What the editor proposes to do with one imported row. */
export type RowDisposition = "reuse" | "create" | "ambiguous" | "unmatched";

/**
 * One imported row after it has been matched against the dataset and the
 * gazetteer, with everything the author needs to approve or change it.
 * @property {ParsedRow} row - The row as parsed
 * @property {RowDisposition} disposition - What the editor proposes
 * @property {string} [cityId] - The dataset city it resolves to
 * @property {WorldCity[]} candidates - Gazetteer matches worth choosing between
 * @property {WorldCity} [chosen] - The candidate currently selected
 */
export interface MatchedRow {
  row: ParsedRow;
  disposition: RowDisposition;
  cityId?: string;
  candidates: WorldCity[];
  chosen?: WorldCity;
}

/* Enough candidates to disambiguate a common name without a wall of them. */
const CANDIDATE_LIMIT = 6;

/**
 * Folds a name for comparison so "Firenze" and "firenze " match.
 * @param {string} value - The name to fold
 * @returns {string} The folded name
 */
function fold(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

/**
 * Resolves every imported row against the dataset first and the gazetteer
 * second. Reuse always wins over creation: an import that quietly produced a
 * second Rome would be worse than one that failed outright.
 * @param {ParsedRow[]} rows - Rows to resolve
 * @param {DatasetSnapshot} dataset - The current dataset
 * @param {AbortSignal} [signal] - Cancels a superseded run
 * @returns {Promise<MatchedRow[]>} Every row with its proposed disposition
 */
export async function matchRows(
  rows: ParsedRow[],
  dataset: DatasetSnapshot,
  signal?: AbortSignal,
): Promise<MatchedRow[]> {
  const byName = new Map(
    dataset.cities.map(({ value }) => [fold(value.name), value.id] as const),
  );
  const matched: MatchedRow[] = [];

  for (const row of rows) {
    const existing = byName.get(fold(row.name));
    if (existing) {
      matched.push({
        candidates: [],
        cityId: existing,
        disposition: "reuse",
        row,
      });
      continue;
    }
    if (row.coordinates) {
      const nearby = findNearbyCity(dataset, row.coordinates);
      if (nearby) {
        matched.push({
          candidates: [],
          cityId: nearby,
          disposition: "reuse",
          row,
        });
        continue;
      }
    }

    let candidates: WorldCity[] = [];
    try {
      candidates = await searchWorldCities(row.name, CANDIDATE_LIMIT, signal);
    } catch {
      /* A gazetteer outage must leave the row reviewable, not abort the run. */
      candidates = [];
    }
    const usable = candidates.filter((candidate) => candidate.country);
    const best = usable[0];
    if (!best) {
      matched.push({ candidates: [], disposition: "unmatched", row });
      continue;
    }
    /*
     * A second candidate within an order of magnitude of the first is a real
     * ambiguity — "Springfield" — rather than a capital beating a hamlet.
     */
    const second = usable[1];
    const isAmbiguous =
      second !== undefined && second.population * 10 > best.population;
    matched.push({
      candidates: usable,
      chosen: best,
      disposition: isAmbiguous ? "ambiguous" : "create",
      row,
    });
  }
  return matched;
}

/**
 * What applying an import would do, worked out before anything is written.
 * @property {DocumentWrite[]} writes - City and country documents to create
 * @property {TripJson} trip - The trip with the imported stops added
 * @property {number} created - How many places would be created
 * @property {number} reused - How many existing places would be referenced
 * @property {number} skipped - How many rows carry no usable place
 */
export interface ImportPlan {
  writes: DocumentWrite[];
  trip: TripJson;
  created: number;
  reused: number;
  skipped: number;
}

/**
 * Works out the whole import without touching disk, so the author approves a
 * described change rather than discovering it afterwards.
 * @param {TripJson} trip - The trip being imported into
 * @param {MatchedRow[]} rows - Resolved rows
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {ImportPlan} Everything the import would do
 */
export function planImport(
  trip: TripJson,
  rows: MatchedRow[],
  dataset: DatasetSnapshot,
): ImportPlan {
  const writes: DocumentWrite[] = [];
  const coordinates = cityCoordinates(dataset);
  /*
   * Places created earlier in the run must be visible to later rows, or two
   * rows naming the same new city would each create their own copy.
   */
  const pending = new Set(dataset.cities.map(({ value }) => value.id));
  let next = trip;
  let created = 0;
  let reused = 0;
  let skipped = 0;

  for (const matched of rows) {
    if (matched.disposition === "unmatched") {
      skipped += 1;
      continue;
    }
    let cityId = matched.cityId;
    if (!cityId && matched.chosen) {
      const plan = planPlace(dataset, matched.chosen);
      if (!plan) {
        skipped += 1;
        continue;
      }
      cityId = plan.cityId;
      if (!pending.has(cityId)) {
        writes.push(...plan.writes);
        pending.add(cityId);
        for (const write of plan.writes)
          if (write.path.split("/").length === 3)
            coordinates.set(cityId, matched.chosen.coordinates);
        created += 1;
      } else reused += 1;
    } else if (cityId) reused += 1;

    if (!cityId) {
      skipped += 1;
      continue;
    }
    next = addStop(next, cityId, coordinates, matched.row.sDate);
  }
  return { created, reused, skipped, trip: next, writes };
}
