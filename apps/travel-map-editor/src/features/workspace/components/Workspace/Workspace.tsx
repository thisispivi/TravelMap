import "./Workspace.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { Issue, TransportMode, TripJson } from "@travelmap/core";
import {
  ArrowLeft,
  FileInput,
  MapPinPlus,
  Redo2,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { DataFile, deleteDocument } from "../../../../data/store";
import { useToast } from "../../../../shared/components/Toast/Toast";
import {
  useDataset,
  useSessionChanges,
} from "../../../../shared/hooks/useDataset";
import { registerCommands } from "../../../../shared/lib/commands";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";
import { ImportDialog } from "../../../import/components/ImportDialog/ImportDialog";
import { ItineraryRail } from "../../../itinerary/components/ItineraryRail/ItineraryRail";
import { groupByDay } from "../../../itinerary/lib/days";
import {
  addDayTrip,
  addStop,
  addStopAfter,
  mergeWithPreviousStop,
  moveStop,
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

/**
 * Workspace component
 * The whole editing surface for one trip: the itinerary rail, the map, and the
 * inspector, all rendering from one draft. It autosaves edits and adds places
 * without leaving the current trip.
 * @component
 * @param {WorkspaceProps} props
 * @param {DataFile<TripJson>} props.file - The trip document being edited
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @returns {ReactNode} The trip workspace
 */
export function Workspace({ file, isDarkTheme }: WorkspaceProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dataset = useDataset();
  const changes = useSessionChanges();
  const workspace = useTripWorkspace(file, () =>
    showToast(t("toast.tripSaved")),
  );
  const [tray, setTray] = useState<TrayTab>("closed");
  const [placePoint, setPlacePoint] = useState<[number, number] | undefined>();
  const [dayTripBaseIndex, setDayTripBaseIndex] = useState<
    number | undefined
  >();
  const [afterStopIndex, setAfterStopIndex] = useState<number | undefined>();
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [isTripDetailOpen, setIsTripDetailOpen] = useState(false);

  const { redoEdit, selection, trip, undoEdit, update } = workspace;
  const cityById = new Map(
    dataset.cities.map(({ value }) => [value.id, value] as const),
  );
  /* One grouping for the rail, the inspector, and the map's day focus, so the
     three panes can never disagree about where a day begins. */
  const days = groupByDay(trip.steps);
  const isDetailOpen = isTripDetailOpen || selection.kind !== "trip";
  const activeIndexes =
    selection.kind === "step"
      ? [selection.index]
      : selection.kind === "day"
        ? (days.find((day) => day.date === selection.date)?.indexes ?? [])
        : [];

  /**
   * Opens the place dialog, optionally at a point clicked on the map.
   * @param {[number, number]} [coordinates] - Longitude and latitude
   * @returns {void}
   */
  function openPlaceDialog(coordinates?: [number, number]): void {
    setAfterStopIndex(undefined);
    setDayTripBaseIndex(undefined);
    setPlacePoint(coordinates);
    setIsAddingPlace(true);
  }

  /**
   * Opens place selection for an excursion inserted after the chosen base stay.
   * @param {number} baseIndex - Position of the stay the excursion returns to
   * @returns {void}
   */
  function openDayTripDialog(baseIndex: number): void {
    setAfterStopIndex(undefined);
    setDayTripBaseIndex(baseIndex);
    setPlacePoint(undefined);
    setIsAddingPlace(true);
  }

  /**
   * Opens place selection for a destination inserted after the chosen stay.
   * @param {number} stopIndex - Position of the stay to continue from
   * @returns {void}
   */
  function openNextStopDialog(stopIndex: number): void {
    setAfterStopIndex(stopIndex);
    setDayTripBaseIndex(undefined);
    setPlacePoint(undefined);
    setIsAddingPlace(true);
  }

  /**
   * Dismisses place selection and clears the insertion mode it was opened for.
   * @returns {void}
   */
  function closePlaceDialog(): void {
    setIsAddingPlace(false);
    setAfterStopIndex(undefined);
    setDayTripBaseIndex(undefined);
  }

  /**
   * Removes the trip document, after a snapshot and a confirmation, because
   * `data/` is gitignored and nothing else holds a second copy of it.
   * @returns {Promise<void>} Completion after the delete
   */
  async function handleDeleteTrip(): Promise<void> {
    try {
      await snapshotBeforeChange(`before deleting ${trip.id}`);
      await deleteDocument(file.path);
      showToast(t("toast.tripDeleted"));
      await navigate("/");
    } catch {
      setIsConfirmingDelete(false);
      showToast(t("editorForm.deleteError"), "error");
    }
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
      ]),
    [redoEdit, t, trip, undoEdit, update],
  );

  /**
   * Adds a stay for a city, materialising the leg that reaches it.
   * @param {string} cityId - The city to visit
   * @returns {void}
   */
  function handlePlace(cityId: string): void {
    const coordinates = cityCoordinates(dataset);
    if (dayTripBaseIndex !== undefined) {
      update(addDayTrip(trip, dayTripBaseIndex, cityId, coordinates));
      return;
    }
    if (afterStopIndex !== undefined) {
      update(addStopAfter(trip, afterStopIndex, cityId, coordinates));
      return;
    }
    update(addStop(trip, cityId, coordinates));
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

  /**
   * Points the inspector at the trip itself. Where the pane overlays the map it
   * also has to open it, because the trip is the one subject the rail has no
   * row for and would otherwise be unreachable on a narrow layout.
   * @returns {void}
   */
  function openTripDetail(): void {
    setIsTripDetailOpen(true);
    workspace.select({ kind: "trip" });
  }

  /**
   * Dismisses the inspector where it overlays the map, which means dropping the
   * selection that opened it.
   * @returns {void}
   */
  function closeDetail(): void {
    setIsTripDetailOpen(false);
    workspace.select({ kind: "trip" });
  }
  return (
    <div className="workspace">
      <header className="workspace__header">
        <Link className="workspace__back" to="/">
          <ArrowLeft aria-hidden="true" />
          <span className="workspace__back-label">
            {t("workspace.backToLibrary")}
          </span>
        </Link>
        <div className="workspace__identity">
          <h1>
            <button
              className="workspace__title"
              onClick={openTripDetail}
              type="button"
            >
              {trip.title || trip.id}
            </button>
          </h1>
          <p className="workspace__summary">
            {t("workspace.summary", {
              cities: new Set(
                trip.steps.flatMap((step) =>
                  step.type === "stop" ? [step.cityId] : [],
                ),
              ).size,
              days: days.filter((day) => day.date !== null).length,
              steps: trip.steps.length,
            })}
          </p>
        </div>
        <div className="workspace__actions">
          <button
            className="editor-button editor-button--primary"
            onClick={() => openPlaceDialog()}
            type="button"
          >
            <MapPinPlus aria-hidden="true" />
            {t("rail.addStop")}
          </button>
          <div className="workspace__tools">
            <button
              aria-label={t("workspace.undo")}
              className="editor-button editor-button--icon"
              disabled={!workspace.canUndo}
              onClick={undoEdit}
              title={t("workspace.undo")}
              type="button"
            >
              <Undo2 aria-hidden="true" />
            </button>
            <button
              aria-label={t("workspace.redo")}
              className="editor-button editor-button--icon"
              disabled={!workspace.canRedo}
              onClick={redoEdit}
              title={t("workspace.redo")}
              type="button"
            >
              <Redo2 aria-hidden="true" />
            </button>
            <button
              aria-label={t("import.title")}
              className="editor-button editor-button--icon"
              onClick={() => setIsImporting(true)}
              title={t("import.title")}
              type="button"
            >
              <FileInput aria-hidden="true" />
            </button>
            {isConfirmingDelete ? (
              <>
                <button
                  className="editor-button editor-button--danger"
                  onClick={handleDeleteTrip}
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                  {t("editorForm.confirmDelete")}
                </button>
                <button
                  aria-label={t("editorForm.cancel")}
                  className="editor-button editor-button--icon"
                  onClick={() => setIsConfirmingDelete(false)}
                  title={t("editorForm.cancel")}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                aria-label={t("editorForm.delete")}
                className="editor-button editor-button--icon editor-button--quiet-danger"
                onClick={() => setIsConfirmingDelete(true)}
                title={t("editorForm.delete")}
                type="button"
              >
                <Trash2 aria-hidden="true" />
              </button>
            )}
          </div>
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
          onShift={(shift) => applyBulk(shiftStepDates(trip, picked, shift))}
        />
      ) : null}
      <div className="workspace__panes">
        <div className="workspace__rail">
          <ItineraryRail
            cityById={cityById}
            days={days}
            hovered={hovered}
            issues={workspace.issues}
            onAddStop={() => openPlaceDialog()}
            onHover={setHovered}
            onRemove={(index) => update(removeStep(trip, index))}
            onReorder={(from, to) => update(moveStop(trip, from, to))}
            onSelect={workspace.select}
            onTogglePicked={handleTogglePicked}
            picked={picked}
            selection={selection}
            trip={trip}
          />
        </div>
        <div className="workspace__map">
          <EditorMap
            activeIndexes={activeIndexes}
            cityById={cityById}
            hovered={hovered}
            isDarkTheme={isDarkTheme}
            onAddHere={(coordinates) => openPlaceDialog(coordinates)}
            onCaptureView={(mapFocus) => update({ ...trip, mapFocus })}
            onClearSelection={() => workspace.select({ kind: "trip" })}
            onHover={setHovered}
            onSelect={workspace.select}
            selection={selection}
            trip={trip}
          />
        </div>
        <button
          aria-label={t("workspace.closeDetails")}
          className={classNames(
            "workspace__scrim",
            isDetailOpen && "workspace__scrim--active",
          )}
          onClick={closeDetail}
          type="button"
        />
        <div
          className={classNames(
            "workspace__inspector",
            isDetailOpen && "workspace__inspector--active",
          )}
        >
          <Inspector
            dataset={dataset}
            days={days}
            onAddDayTrip={openDayTripDialog}
            onAddNextStop={openNextStopDialog}
            onChange={update}
            onChangeStep={(index, step) =>
              update(replaceStep(trip, index, step))
            }
            onClose={closeDetail}
            onMergeWithPrevious={(index) =>
              update(mergeWithPreviousStop(trip, index))
            }
            onPickSteps={setPicked}
            onSelect={workspace.select}
            onShiftSteps={(indexes, shift) =>
              update(shiftStepDates(trip, indexes, shift))
            }
            selection={selection}
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
          onClose={closePlaceDialog}
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
