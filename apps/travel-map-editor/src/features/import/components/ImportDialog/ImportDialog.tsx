import "./ImportDialog.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { TripJson } from "@travelmap/core";
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";

import { applyWrites } from "../../../../data/store";
import { useDataset } from "../../../../shared/hooks/useDataset";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";
import { WorldCity } from "../../../places/lib/gazetteer";
import {
  ImportPlan,
  MatchedRow,
  matchRows,
  planImport,
} from "../../lib/matchRows";
import { ParsedInput, parseImport } from "../../lib/parseInput";

/** Which stage of the import the author is looking at. */
type Stage = "input" | "matching" | "review" | "done";

/**
 * ImportDialog component
 * Reads pasted or dropped input, resolves every place, and shows exactly what
 * will be written before it writes anything. Rows that cannot be resolved are
 * reported rather than dropped, and applying is one undoable step.
 * @component
 * @param {ImportDialogProps} props
 * @param {() => void} props.onClose - Dismisses the dialog
 * @param {(trip: TripJson) => void} props.onImported - Receives the extended trip
 * @param {TripJson} props.trip - The trip being imported into
 * @returns {ReactNode} The import dialog
 */
export function ImportDialog({
  onClose,
  onImported,
  trip,
}: ImportDialogProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedInput | null>(null);
  const [rows, setRows] = useState<MatchedRow[]>([]);
  const [stage, setStage] = useState<Stage>("input");
  const [message, setMessage] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const plan: ImportPlan | null =
    stage === "review" ? planImport(trip, rows, dataset) : null;

  /**
   * Parses the input and resolves every place it names.
   * @returns {Promise<void>} Completion once matching finishes
   */
  async function handleParse(): Promise<void> {
    const result = parseImport(text);
    setParsed(result);
    if (result.trip) {
      setStage("review");
      setRows([]);
      return;
    }
    if (result.rows.length === 0) {
      setMessage(t("import.nothingFound"));
      return;
    }
    setStage("matching");
    setRows(await matchRows(result.rows, dataset));
    setStage("review");
  }

  /**
   * Reads a dropped or chosen file into the input area.
   * @param {ChangeEvent<HTMLInputElement>} event - The file input change
   * @returns {Promise<void>} Completion once the file is read
   */
  async function handleFile(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;
    setText(await file.text());
  }

  /**
   * Chooses which gazetteer candidate an ambiguous row should use.
   * @param {number} index - Row position
   * @param {WorldCity} candidate - The chosen candidate
   * @returns {void}
   */
  function chooseCandidate(index: number, candidate: WorldCity): void {
    setRows((current) =>
      current.map((matched, position) =>
        position === index
          ? { ...matched, chosen: candidate, disposition: "create" }
          : matched,
      ),
    );
  }

  /**
   * Writes every new place, then hands the extended trip back. A snapshot is
   * taken first because an import touches more files than any other action.
   * @returns {Promise<void>} Completion once the import is applied
   */
  async function handleApply(): Promise<void> {
    try {
      await snapshotBeforeChange("before import");
      if (parsed?.trip) {
        onImported(parsed.trip);
        onClose();
        return;
      }
      if (!plan) return;
      await applyWrites(plan.writes);
      onImported(plan.trip);
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("import.failed"));
    }
  }
  return (
    <dialog
      aria-label={t("import.title")}
      className="import-dialog"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <h2 className="import-dialog__title">{t("import.title")}</h2>
      {stage === "input" || stage === "matching" ? (
        <>
          <p className="editor-panel__hint">{t("import.hint")}</p>
          <label className="editor-field">
            <span className="editor-field__label">{t("import.paste")}</span>
            <textarea
              className="editor-field__control editor-field__control--area"
              onChange={(event) => setText(event.target.value)}
              rows={10}
              value={text}
            />
          </label>
          <div className="import-dialog__actions">
            <button
              className="editor-button"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              {t("import.chooseFile")}
            </button>
            <input
              accept=".json,.csv,.tsv,.txt,.gpx,.kml,.geojson"
              className="import-dialog__file"
              onChange={handleFile}
              ref={fileRef}
              type="file"
            />
            <button
              className="editor-button editor-button--primary"
              disabled={!text.trim() || stage === "matching"}
              onClick={handleParse}
              type="button"
            >
              {stage === "matching" ? t("import.matching") : t("import.read")}
            </button>
            <output className="editor-form__message">{message}</output>
          </div>
        </>
      ) : null}
      {stage === "review" ? (
        <>
          <p className="import-dialog__summary">
            {parsed?.trip
              ? t("import.replaceSummary", { id: parsed.trip.id })
              : t("import.summary", {
                  created: plan?.created ?? 0,
                  reused: plan?.reused ?? 0,
                  skipped: plan?.skipped ?? 0,
                })}
          </p>
          {parsed && parsed.problems.length > 0 ? (
            <ul className="editor-notice editor-notice--warning">
              {parsed.problems.map((problem) => (
                <li className="editor-notice__item" key={problem}>
                  {problem}
                </li>
              ))}
            </ul>
          ) : null}
          {rows.length > 0 ? (
            <div className="import-dialog__table-scroll">
              <table className="import-dialog__table">
                <thead>
                  <tr>
                    <th scope="col">{t("import.column.row")}</th>
                    <th scope="col">{t("import.column.parsed")}</th>
                    <th scope="col">{t("import.column.match")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((matched, index) => (
                    <tr key={`${matched.row.line}-${matched.row.name}`}>
                      <td>{matched.row.line}</td>
                      <td>{matched.row.name}</td>
                      <td>
                        {matched.disposition === "reuse" ? (
                          t("import.reuse", { city: matched.cityId })
                        ) : matched.disposition === "unmatched" ? (
                          <span className="import-dialog__unmatched">
                            {t("import.unmatched")}
                          </span>
                        ) : matched.disposition === "ambiguous" ? (
                          <span className="import-dialog__candidates">
                            {matched.candidates.map((candidate) => (
                              <button
                                className="editor-button"
                                key={candidate.key}
                                onClick={() =>
                                  chooseCandidate(index, candidate)
                                }
                                type="button"
                              >
                                {candidate.name} · {candidate.country?.name}
                              </button>
                            ))}
                          </span>
                        ) : (
                          t("import.create", {
                            city: matched.chosen?.name,
                            country: matched.chosen?.country?.name,
                          })
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <div className="import-dialog__actions">
            <button
              className="editor-button editor-button--primary"
              onClick={handleApply}
              type="button"
            >
              {t("import.apply")}
            </button>
            <button
              className="editor-button"
              onClick={() => setStage("input")}
              type="button"
            >
              {t("import.back")}
            </button>
            <output className="editor-form__message">{message}</output>
          </div>
        </>
      ) : null}
      <footer className="import-dialog__actions">
        <button className="editor-button" onClick={onClose} type="button">
          {t("editorForm.cancel")}
        </button>
      </footer>
    </dialog>
  );
}

/**
 * Props for ImportDialog.
 * @property {() => void} onClose - Dismisses the dialog
 * @property {(trip: TripJson) => void} onImported - Receives the extended trip
 * @property {TripJson} trip - The trip being imported into
 */
interface ImportDialogProps {
  onClose: () => void;
  onImported: (trip: TripJson) => void;
  trip: TripJson;
}
