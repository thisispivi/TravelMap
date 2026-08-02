import "./Workspace.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { Issue, TransportMode, TripJson } from "@travelmap/core";
import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { DataFile, deleteDocument } from "../../../../data/store";
import {
  useDataset,
  useSessionChanges,
} from "../../../../shared/hooks/useDataset";
import { registerCommands } from "../../../../shared/lib/commands";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";
import { ImportDialog } from "../../../import/components/ImportDialog/ImportDialog";
import { ItineraryRail } from "../../../itinerary/components/ItineraryRail/ItineraryRail";
import {
  addStop,
  mergeWithPreviousStop,
  moveStep,
  removeStep,
  removeSteps,
  replaceStep,
  setLegMode,
  shiftStepDates,
  sortByDate,
} from "../../../itinerary/lib/itinerary";
import { EditorMap } from "../../../map/components/EditorMap/EditorMap";
import { AddPlaceDialog } from "../../../places/components/AddPlaceDialog/AddPlaceDialog";
import { cityCoordinates } from "../../../places/lib/placeOptions";
import {
  TrayTab,
  ValidationTray,
} from "../../../validation/components/ValidationTray/ValidationTray";
import { useTripWorkspace } from "../../Workspace.state";
import { BulkBar } from "../BulkBar/BulkBar";
import { Inspector } from "../Inspector/Inspector";
import { SaveChip } from "../SaveChip/SaveChip";

/**
 * Workspace component
 * The whole editing surface for one trip: the itinerary rail, the map, and the
 * inspector, all rendering from one draft so they cannot disagree. There is no
 * save button — the draft autosaves — and no navigation away from here to add
 * a place, which together are the two changes that make a trip fast to record.
 * @component
 * @param {WorkspaceProps} props
 * @param {DataFile<TripJson>} props.file - The trip document being edited
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @returns {ReactNode} The trip workspace
 */
export function Workspace({ file, isDarkTheme }: WorkspaceProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const navigate = useNavigate();
  const dataset = useDataset();
  const changes = useSessionChanges();
  const workspace = useTripWorkspace(file);
  const [tray, setTray] = useState<TrayTab>("closed");
  const [placePoint, setPlacePoint] = useState<[number, number] | undefined>();
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);

  const { redoEdit, trip, undoEdit, update } = workspace;
  const cityById = new Map(
    dataset.cities.map(({ value }) => [value.id, value] as const),
  );

  /**
   * Opens the place dialog, optionally at a point clicked on the map.
   * @param {[number, number]} [coordinates] - Longitude and latitude
   * @returns {void}
   */
  function openPlaceDialog(coordinates?: [number, number]): void {
    setPlacePoint(coordinates);
    setIsAddingPlace(true);
  }

  /**
   * Removes the trip document, after a snapshot and a confirmation, because
   * `data/` is gitignored and nothing else holds a second copy of it.
   * @returns {Promise<void>} Completion after the delete
   */
  async function handleDeleteTrip(): Promise<void> {
    await snapshotBeforeChange(`before deleting ${trip.id}`);
    await deleteDocument(file.path);
    await navigate("/");
  }

  useEffect(() => {
    /**
     * Wires the editing shortcuts that have no on-screen equivalent worth
     * reaching for mid-keystroke.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    function handleKeyDown(event: KeyboardEvent): void {
      const isTyping =
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
      if (event.key === "Escape") {
        setPicked([]);
        return;
      }
      if (!(event.ctrlKey || event.metaKey)) {
        if (event.key.toLowerCase() === "n" && !isTyping) {
          event.preventDefault();
          openPlaceDialog();
        }
        return;
      }
      if (event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redoEdit();
      else undoEdit();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redoEdit, undoEdit]);

  useEffect(
    () =>
      registerCommands("workspace", [
        {
          id: "add-place",
          label: t("rail.addStop"),
          run: () => openPlaceDialog(),
        },
        {
          id: "import",
          label: t("import.title"),
          run: () => setIsImporting(true),
        },
        {
          id: "sort-by-date",
          label: t("palette.sortByDate"),
          run: () => update(sortByDate(trip)),
        },
        { id: "undo", label: t("workspace.undo"), run: undoEdit },
        { id: "redo", label: t("workspace.redo"), run: redoEdit },
        {
          id: "validation",
          label: t("tray.validation"),
          run: () => setTray("validation"),
        },
        {
          id: "preview",
          label: t("tray.preview"),
          run: () => setTray("preview"),
        },
      ]),
    [redoEdit, t, trip, undoEdit, update],
  );

  /**
   * Adds a stay for a city, materialising the leg that reaches it.
   * @param {string} cityId - The city to visit
   * @returns {void}
   */
  function handlePlace(cityId: string): void {
    update(addStop(trip, cityId, cityCoordinates(dataset)));
  }

  /**
   * Applies a validation repair as one undoable edit.
   * @param {NonNullable<Issue["fix"]>} fix - The repair to apply
   * @returns {void}
   */
  function handleApplyFix(fix: NonNullable<Issue["fix"]>): void {
    update(fix.apply(trip));
  }

  /**
   * Adds or removes one step from the bulk selection.
   * @param {number} index - Step position
   * @returns {void}
   */
  function handleTogglePicked(index: number): void {
    setPicked((current) =>
      current.includes(index)
        ? current.filter((entry) => entry !== index)
        : [...current, index],
    );
  }

  /**
   * Applies a bulk edit and clears the selection, since the positions it named
   * no longer mean the same thing afterwards.
   * @param {TripJson} next - The edited trip
   * @returns {void}
   */
  function applyBulk(next: TripJson): void {
    update(next);
    setPicked([]);
  }
  return (
    <div className="workspace">
      <header className="workspace__header">
        <Link className="workspace__back" to="/">
          {t("workspace.backToLibrary")}
        </Link>
        <div className="workspace__identity">
          <h1 className="workspace__title">{trip.title || trip.id}</h1>
          <p className="workspace__summary">
            {t("workspace.summary", {
              cities: new Set(
                trip.steps.flatMap((step) =>
                  step.type === "stop" ? [step.cityId] : [],
                ),
              ).size,
              steps: trip.steps.length,
            })}
          </p>
        </div>
        <div className="workspace__actions">
          <button
            className="editor-button"
            onClick={() => setIsImporting(true)}
            type="button"
          >
            {t("import.title")}
          </button>
          <button
            className="editor-button"
            disabled={!workspace.canUndo}
            onClick={undoEdit}
            type="button"
          >
            {t("workspace.undo")}
          </button>
          <button
            className="editor-button"
            disabled={!workspace.canRedo}
            onClick={redoEdit}
            type="button"
          >
            {t("workspace.redo")}
          </button>
          {isConfirmingDelete ? (
            <>
              <button
                className="editor-button editor-button--danger"
                onClick={handleDeleteTrip}
                type="button"
              >
                {t("editorForm.confirmDelete")}
              </button>
              <button
                className="editor-button"
                onClick={() => setIsConfirmingDelete(false)}
                type="button"
              >
                {t("editorForm.cancel")}
              </button>
            </>
          ) : (
            <button
              className="editor-button"
              onClick={() => setIsConfirmingDelete(true)}
              type="button"
            >
              {t("editorForm.delete")}
            </button>
          )}
          <SaveChip
            error={workspace.saveError}
            onRetry={workspace.retrySave}
            savedAt={workspace.savedAt}
            state={workspace.saveState}
          />
        </div>
      </header>
      {workspace.recovered ? (
        <div className="workspace__recovery" role="alertdialog">
          <p>
            {t("workspace.recoveryFound", {
              at: new Date(workspace.recovered.savedAt).toLocaleString(),
            })}
          </p>
          <button
            className="editor-button editor-button--primary"
            onClick={workspace.restoreRecovered}
            type="button"
          >
            {t("workspace.restore")}
          </button>
          <button
            className="editor-button"
            onClick={workspace.discardRecovered}
            type="button"
          >
            {t("workspace.discard")}
          </button>
        </div>
      ) : null}
      {picked.length > 0 ? (
        <BulkBar
          count={picked.length}
          onClear={() => setPicked([])}
          onDelete={() => applyBulk(removeSteps(trip, picked))}
          onSetMode={(mode: TransportMode) =>
            applyBulk(setLegMode(trip, picked, mode))
          }
          onShift={(days) => applyBulk(shiftStepDates(trip, picked, days))}
        />
      ) : null}
      <div className="workspace__panes">
        <div className="workspace__rail">
          <ItineraryRail
            cityById={cityById}
            issues={workspace.issues}
            onAddStop={() => openPlaceDialog()}
            onRemove={(index) => update(removeStep(trip, index))}
            onReorder={(from, to) => update(moveStep(trip, from, to))}
            onSelect={workspace.select}
            onTogglePicked={handleTogglePicked}
            picked={picked}
            selection={workspace.selection}
            trip={trip}
          />
        </div>
        <div className="workspace__map">
          <EditorMap
            cityById={cityById}
            isDarkTheme={isDarkTheme}
            onAddHere={(coordinates) => openPlaceDialog(coordinates)}
            onCaptureView={(mapFocus) => update({ ...trip, mapFocus })}
            onSelect={workspace.select}
            selection={workspace.selection}
            trip={trip}
          />
        </div>
        <div
          className={classNames(
            "workspace__inspector",
            workspace.selection.kind === "step" &&
              "workspace__inspector--active",
          )}
        >
          <Inspector
            dataset={dataset}
            onChange={update}
            onChangeStep={(index, step) =>
              update(replaceStep(trip, index, step))
            }
            onMergeWithPrevious={(index) =>
              update(mergeWithPreviousStop(trip, index))
            }
            selection={workspace.selection}
            trip={trip}
          />
        </div>
      </div>
      <ValidationTray
        changes={changes}
        issues={workspace.issues}
        onApplyFix={handleApplyFix}
        onChangeTab={setTray}
        onSelect={workspace.select}
        tab={tray}
        trip={trip}
      />
      {isAddingPlace ? (
        <AddPlaceDialog
          coordinates={placePoint}
          dataset={dataset}
          onClose={() => setIsAddingPlace(false)}
          onPlace={handlePlace}
        />
      ) : null}
      {isImporting ? (
        <ImportDialog
          onClose={() => setIsImporting(false)}
          onImported={update}
          trip={trip}
        />
      ) : null}
    </div>
  );
}

/**
 * Props for Workspace.
 * @property {DataFile<TripJson>} file - The trip document being edited
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 */
interface WorkspaceProps {
  file: DataFile<TripJson>;
  isDarkTheme: boolean;
}
