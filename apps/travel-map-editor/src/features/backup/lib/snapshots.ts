import {
  applyWrites,
  DatasetSnapshot,
  DocumentWrite,
  getDataset,
} from "../../../data/store";

/**
 * A complete copy of every authored JSON document.
 * @property {string} createdAt - ISO timestamp the snapshot was taken
 * @property {string} reason - Why it was taken, shown when restoring
 * @property {DocumentWrite[]} documents - Every document, path and value
 */
export interface SnapshotBundle {
  createdAt: string;
  reason: string;
  documents: DocumentWrite[];
}

/**
 * Collects every authored document into one portable bundle.
 * @param {DatasetSnapshot} dataset - The dataset to capture
 * @param {string} reason - Why the snapshot is being taken
 * @returns {SnapshotBundle} The bundle
 */
export function buildBundle(
  dataset: DatasetSnapshot,
  reason: string,
): SnapshotBundle {
  return {
    createdAt: new Date().toISOString(),
    documents: [
      dataset.config,
      ...dataset.countries,
      ...dataset.cities,
      ...dataset.trips,
      ...dataset.photos,
    ].map(({ path, value }) => ({ path, value })),
    reason,
  };
}

/**
 * Names a snapshot so the list sorts chronologically on its own.
 * @param {string} createdAt - ISO timestamp
 * @param {string} reason - Why the snapshot was taken
 * @returns {string} The snapshot file name
 */
function snapshotName(createdAt: string, reason: string): string {
  const stamp = createdAt.replace(/[:.]/g, "-");
  const slug = reason
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 32);
  return `${stamp}-${slug || "snapshot"}.json`;
}

/**
 * Writes a snapshot of the current dataset beside the repository.
 * Failure is deliberately swallowed by the automatic callers below: a backup
 * that cannot be written must not stop the author from working, but one that
 * silently replaced their content would be worse than none.
 * @param {string} reason - Why the snapshot is being taken
 * @returns {Promise<string>} The stored snapshot name
 */
export async function takeSnapshot(reason: string): Promise<string> {
  const bundle = buildBundle(getDataset(), reason);
  const name = snapshotName(bundle.createdAt, reason);
  const response = await fetch(
    `/__snapshots?name=${encodeURIComponent(name)}`,
    {
      body: JSON.stringify(bundle),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  if (!response.ok)
    throw new Error(((await response.json()) as { error: string }).error);
  return name;
}

/**
 * Takes a snapshot before something irreversible, without letting a backup
 * failure block the action the author asked for.
 * @param {string} reason - Why the snapshot is being taken
 * @returns {Promise<void>} Completion once the attempt finishes
 */
export async function snapshotBeforeChange(reason: string): Promise<void> {
  try {
    await takeSnapshot(reason);
  } catch (error) {
    console.warn("Could not write a snapshot before this change.", error);
  }
}

/**
 * Lists stored snapshots, newest first.
 * @returns {Promise<string[]>} Snapshot names
 */
export async function listSnapshots(): Promise<string[]> {
  const response = await fetch("/__snapshots");
  if (!response.ok) return [];
  return ((await response.json()) as { snapshots: string[] }).snapshots;
}

/**
 * Reads one stored snapshot.
 * @param {string} name - Snapshot file name
 * @returns {Promise<SnapshotBundle>} The bundle
 */
export async function readSnapshot(name: string): Promise<SnapshotBundle> {
  const response = await fetch(`/__snapshots?name=${encodeURIComponent(name)}`);
  if (!response.ok)
    throw new Error(((await response.json()) as { error: string }).error);
  return (await response.json()) as SnapshotBundle;
}

/**
 * Writes every document in a bundle back to `data/`.
 * Documents added since the snapshot are left alone rather than deleted: an
 * author restoring one trip should not lose another they created afterwards.
 * @param {SnapshotBundle} bundle - The bundle to restore
 * @returns {Promise<void>} Completion once every write is acknowledged
 */
export async function restoreSnapshot(bundle: SnapshotBundle): Promise<void> {
  await snapshotBeforeChange("before restore");
  await applyWrites(bundle.documents, { isOverwrite: true });
}

/**
 * Downloads a bundle as a file, so a backup can live somewhere other than this
 * machine. `data/` is gitignored, so nothing else carries content off it.
 * @param {SnapshotBundle} bundle - The bundle to download
 * @returns {void}
 */
export function downloadBundle(bundle: SnapshotBundle): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.download = snapshotName(bundle.createdAt, bundle.reason);
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
