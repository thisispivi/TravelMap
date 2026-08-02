import "./BackupPanel.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { ReactNode, useEffect, useState } from "react";

import { useDataset } from "../../../../shared/hooks/useDataset";
import {
  buildBundle,
  downloadBundle,
  listSnapshots,
  readSnapshot,
  restoreSnapshot,
  takeSnapshot,
} from "../../lib/snapshots";

/**
 * Turns a snapshot file name back into something readable.
 * @param {string} name - The stored snapshot name
 * @returns {string} A local date and the reason it was taken
 */
function describeSnapshot(name: string): string {
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-\d+Z-(.*)\.json$/.exec(name);
  if (!match) return name;
  const [, date, hours, minutes, seconds, reason] = match;
  return `${date} ${hours}:${minutes}:${seconds} — ${reason?.replace(/-/g, " ")}`;
}

/**
 * BackupPanel component
 * Backup and restore for the authored dataset. This is not a convenience:
 * `data/` is gitignored, so without it nothing anywhere holds a second copy of
 * the author's content, and an accidental delete is permanent.
 * @component
 * @returns {ReactNode} The backup panel
 */
export function BackupPanel(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const [names, setNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [pendingRestore, setPendingRestore] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    void listSnapshots().then((stored) => {
      if (isActive) setNames(stored);
    });
    return () => {
      isActive = false;
    };
  }, []);

  /**
   * Writes a snapshot the author asked for and refreshes the list.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleSnapshot(): Promise<void> {
    try {
      await takeSnapshot("manual");
      setNames(await listSnapshots());
      setMessage(t("backup.snapshotTaken"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("backup.failed"));
    }
  }

  /**
   * Restores a snapshot once the author has confirmed which one.
   * @returns {Promise<void>} Completion after every write
   */
  async function handleRestore(): Promise<void> {
    if (!pendingRestore) return;
    try {
      await restoreSnapshot(await readSnapshot(pendingRestore));
      setPendingRestore(null);
      setNames(await listSnapshots());
      setMessage(t("backup.restored"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("backup.failed"));
    }
  }
  return (
    <section className="editor-panel backup-panel">
      <h2 className="editor-panel__legend">{t("backup.title")}</h2>
      <p className="editor-panel__hint">{t("backup.hint")}</p>
      <div className="backup-panel__actions">
        <button
          className="editor-button editor-button--primary"
          onClick={handleSnapshot}
          type="button"
        >
          {t("backup.takeSnapshot")}
        </button>
        <button
          className="editor-button"
          onClick={() => downloadBundle(buildBundle(dataset, "export"))}
          type="button"
        >
          {t("backup.download")}
        </button>
        <output className="editor-form__message">{message}</output>
      </div>
      {names.length === 0 ? (
        <p className="editor-panel__hint">{t("backup.none")}</p>
      ) : (
        <ul className="backup-panel__list">
          {names.map((name) => (
            <li className="backup-panel__entry" key={name}>
              <span className="backup-panel__name">
                {describeSnapshot(name)}
              </span>
              {pendingRestore === name ? (
                <>
                  <button
                    className="editor-button editor-button--danger"
                    onClick={handleRestore}
                    type="button"
                  >
                    {t("backup.confirmRestore")}
                  </button>
                  <button
                    className="editor-button"
                    onClick={() => setPendingRestore(null)}
                    type="button"
                  >
                    {t("editorForm.cancel")}
                  </button>
                </>
              ) : (
                <button
                  className="editor-button"
                  onClick={() => setPendingRestore(name)}
                  type="button"
                >
                  {t("backup.restore")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
