import { CityJson, CountryJson, Image, TripJson } from "@travelmap/core";

import { DEFAULT_CONFIG, SiteConfig } from "./siteConfig";

/**
 * A dataset file loaded by Vite and saved through the localhost middleware.
 * @property {string} path - Dataset-relative JSON path
 * @property {T} value - Parsed JSON value
 */
export interface DataFile<T> {
  path: string;
  value: T;
}

/**
 * Every authored document, as one immutable value.
 * A new object is produced on every mutation so `useSyncExternalStore` can
 * compare snapshots by identity instead of walking the dataset.
 * @property {DataFile<CityJson>[]} cities - City documents, sorted by path
 * @property {DataFile<SiteConfig>} config - The site configuration
 * @property {DataFile<CountryJson>[]} countries - Country documents
 * @property {DataFile<Image[]>[]} photos - Gallery manifests
 * @property {DataFile<TripJson>[]} trips - Trip documents
 */
export interface DatasetSnapshot {
  cities: DataFile<CityJson>[];
  config: DataFile<SiteConfig>;
  countries: DataFile<CountryJson>[];
  photos: DataFile<Image[]>[];
  trips: DataFile<TripJson>[];
}

/**
 * One document to persist as part of a batch.
 * @property {string} path - Dataset-relative JSON path
 * @property {unknown} value - Serializable JSON value
 */
export interface DocumentWrite {
  path: string;
  value: unknown;
}

/**
 * What happened to a document during this editing session.
 * @property {string} path - Dataset-relative JSON path
 * @property {"created" | "updated" | "deleted"} change - What was done to it
 */
export interface DocumentChange {
  path: string;
  change: "created" | "updated" | "deleted";
}

const DATA_PREFIX = "../../../../data/";
const CONFIG_PATH = "site.config.json";

/**
 * Converts Vite's eager JSON modules into stable, editable data files.
 * @param {Record<string, { default: T }>} modules - Eager JSON modules
 * @returns {DataFile<T>[]} Files sorted by dataset path
 */
function files<T>(modules: Record<string, { default: T }>): DataFile<T>[] {
  return Object.entries(modules)
    .map(([path, { default: value }]) => ({
      path: path.replace(DATA_PREFIX, ""),
      value,
    }))
    .sort((first, second) => first.path.localeCompare(second.path));
}

/*
 * The eager globs are read exactly once, to seed the store. Everything after
 * that flows through the mutations below, which is what lets a created or
 * deleted document appear without reloading the document the way the previous
 * editor had to.
 */
const seededConfig = files<SiteConfig>(
  import.meta.glob("../../../../data/site.config.json", { eager: true }),
)[0];

let snapshot: DatasetSnapshot = {
  cities: files<CityJson>(
    import.meta.glob("../../../../data/*/*/*.json", { eager: true }),
  ),
  config: seededConfig ?? { path: CONFIG_PATH, value: DEFAULT_CONFIG },
  countries: files<CountryJson>(
    import.meta.glob(
      ["../../../../data/*/*.json", "!../../../../data/trips/*.json"],
      { eager: true },
    ),
  ),
  photos: files<Image[]>(
    import.meta.glob("../../../../data/photos/**/*.json", { eager: true }),
  ),
  trips: files<TripJson>(
    import.meta.glob("../../../../data/trips/*.json", { eager: true }),
  ),
};

const listeners = new Set<() => void>();
/*
 * What the editor last saw on disk for each document, sent with every write so
 * the middleware can refuse one that would overwrite a change made outside this
 * tab. Without it a tab left open on a stale draft silently clobbers the file,
 * and with `data/` gitignored there is nothing to restore from.
 */
const baselines = new Map<string, unknown>(
  [
    ...snapshot.cities,
    ...snapshot.countries,
    ...snapshot.trips,
    ...snapshot.photos,
    snapshot.config,
  ].map(({ path, value }) => [path, value] as const),
);
const changeLog = new Map<string, DocumentChange["change"]>();
/*
 * Cached because `useSyncExternalStore` compares snapshots by identity: a
 * freshly built array on every read would re-render forever.
 */
let changes: DocumentChange[] = [];

/**
 * Records what happened to a document and republishes the change list.
 * @param {string} path - Dataset-relative JSON path
 * @param {DocumentChange["change"]} change - What was done to it
 * @returns {void}
 */
function logChange(path: string, change: DocumentChange["change"]): void {
  /* A document created and then edited in one session is still just created. */
  const existing = changeLog.get(path);
  changeLog.set(
    path,
    existing === "created" && change === "updated" ? "created" : change,
  );
  changes = Array.from(changeLog, ([entryPath, entryChange]) => ({
    change: entryChange,
    path: entryPath,
  })).sort((first, second) => first.path.localeCompare(second.path));
  for (const listener of listeners) listener();
}

/**
 * Publishes a new snapshot to every subscriber.
 * @param {DatasetSnapshot} next - The replacement snapshot
 * @returns {void}
 */
function publish(next: DatasetSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

/**
 * Decides which collection a dataset path belongs to from its shape alone,
 * because the layout encodes the kind: `<Country>/<Country>.json` is a country
 * and `<Country>/<City>/<City>.json` is a city.
 * @param {string} path - Dataset-relative JSON path
 * @returns {keyof DatasetSnapshot} The collection the path belongs to
 */
function collectionFor(path: string): keyof DatasetSnapshot {
  if (path === CONFIG_PATH) return "config";
  if (path.startsWith("trips/")) return "trips";
  if (path.startsWith("photos/")) return "photos";
  return path.split("/").length >= 3 ? "cities" : "countries";
}

/**
 * Inserts or replaces one document in a collection, keeping path order.
 * @param {DataFile<T>[]} collection - The current collection
 * @param {string} path - Dataset-relative JSON path
 * @param {T} value - Parsed JSON value
 * @returns {DataFile<T>[]} A new collection carrying the document
 */
function upsert<T>(
  collection: DataFile<T>[],
  path: string,
  value: T,
): DataFile<T>[] {
  const existing = collection.some((file) => file.path === path);
  if (existing)
    return collection.map((file) =>
      file.path === path ? { path, value } : file,
    );
  return [...collection, { path, value }].sort((first, second) =>
    first.path.localeCompare(second.path),
  );
}

/**
 * Reads the current dataset. The returned object is stable until something
 * changes, so it is safe as a `useSyncExternalStore` snapshot.
 * @returns {DatasetSnapshot} The current dataset
 */
export function getDataset(): DatasetSnapshot {
  return snapshot;
}

/**
 * Subscribes to dataset changes.
 * @param {() => void} listener - Called after every mutation
 * @returns {() => void} Unsubscribes the listener
 */
export function subscribeToDataset(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Lists what this session has written, for the changes tray.
 * @returns {DocumentChange[]} Every touched path, sorted
 */
export function getSessionChanges(): DocumentChange[] {
  return changes;
}

/**
 * Reads one document's current value, whatever kind it is.
 * @param {string} path - Dataset-relative JSON path
 * @returns {unknown} The stored value, or undefined when absent
 */
export function readDocument(path: string): unknown {
  if (path === CONFIG_PATH) return snapshot.config.value;
  const collection = snapshot[collectionFor(path)] as DataFile<unknown>[];
  return collection.find((file) => file.path === path)?.value;
}

/**
 * Applies a write to the in-memory dataset without touching disk.
 * @param {string} path - Dataset-relative JSON path
 * @param {unknown} value - Parsed JSON value
 * @returns {void}
 */
function putDocument(path: string, value: unknown): void {
  const collection = collectionFor(path);
  if (collection === "config") {
    publish({ ...snapshot, config: { path, value: value as SiteConfig } });
    return;
  }
  publish({
    ...snapshot,
    [collection]: upsert(
      snapshot[collection] as DataFile<unknown>[],
      path,
      value,
    ),
  });
}

/**
 * Removes a document from the in-memory dataset without touching disk.
 * @param {string} path - Dataset-relative JSON path
 * @returns {void}
 */
function dropDocument(path: string): void {
  const collection = collectionFor(path);
  if (collection === "config") return;
  publish({
    ...snapshot,
    [collection]: (snapshot[collection] as DataFile<unknown>[]).filter(
      (file) => file.path !== path,
    ),
  });
}

/**
 * Sends one JSON body to the local-only writer middleware.
 * @param {string} endpoint - Writer endpoint, `write` or `delete`
 * @param {object} body - Request payload
 * @returns {Promise<void>} Completion once the write is acknowledged
 */
async function callWriter(endpoint: string, body: object): Promise<void> {
  const response = await fetch(`/__data/${endpoint}`, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok)
    throw new Error(((await response.json()) as { error: string }).error);
}

/**
 * How a write should treat what is already on disk.
 * @property {boolean} [isOverwrite] - Skip the stale-write check, for a restore
 */
export interface WriteOptions {
  isOverwrite?: boolean;
}

/**
 * Persists one document and reflects it in the dataset immediately.
 * The in-memory update happens first so the editor stays responsive; a failed
 * write raises rather than reverting, because silently discarding what the
 * author just typed is worse than showing a retry.
 * @param {string} path - Dataset-relative JSON path
 * @param {unknown} value - Serializable JSON value
 * @param {WriteOptions} [options] - How to treat what is already on disk
 * @returns {Promise<void>} Completion once the write is acknowledged
 */
export async function saveDocument(
  path: string,
  value: unknown,
  options: WriteOptions = {},
): Promise<void> {
  const base = options.isOverwrite ? undefined : baselines.get(path);
  const isNew = readDocument(path) === undefined;
  putDocument(path, value);
  await callWriter("write", { base, path, value });
  baselines.set(path, value);
  logChange(path, isNew ? "created" : "updated");
}

/**
 * Removes one document from disk and from the dataset.
 * @param {string} path - Dataset-relative JSON path
 * @returns {Promise<void>} Completion once the delete is acknowledged
 */
export async function deleteDocument(path: string): Promise<void> {
  dropDocument(path);
  await callWriter("delete", { path });
  baselines.delete(path);
  logChange(path, "deleted");
}

/**
 * Moves a document, which is what changing a city's country amounts to because
 * the owning country is part of the dataset path.
 * @param {string} fromPath - Current dataset-relative path
 * @param {string} toPath - Destination dataset-relative path
 * @param {unknown} value - Serializable JSON value
 * @returns {Promise<void>} Completion once both operations are acknowledged
 */
export async function moveDocument(
  fromPath: string,
  toPath: string,
  value: unknown,
): Promise<void> {
  await saveDocument(toPath, value);
  if (fromPath !== toPath) await deleteDocument(fromPath);
}

/**
 * Persists several documents as one unit, restoring every prior body when any
 * of them fails. An import that half-succeeded is worse than one that did not
 * run, because the author cannot tell which half landed.
 * @param {DocumentWrite[]} writes - Documents to persist, in order
 * @param {WriteOptions} [options] - How to treat what is already on disk
 * @returns {Promise<void>} Completion once every write is acknowledged
 */
export async function applyWrites(
  writes: DocumentWrite[],
  options: WriteOptions = {},
): Promise<void> {
  const previous = writes.map(({ path }) => ({
    path,
    value: readDocument(path),
  }));
  const done: string[] = [];

  try {
    for (const { path, value } of writes) {
      await saveDocument(path, value, options);
      done.push(path);
    }
  } catch (error) {
    for (const path of done.toReversed()) {
      const restored = previous.find((entry) => entry.path === path);
      if (restored?.value === undefined) await deleteDocument(path);
      else await saveDocument(path, restored.value, { isOverwrite: true });
    }
    throw error;
  }
}
