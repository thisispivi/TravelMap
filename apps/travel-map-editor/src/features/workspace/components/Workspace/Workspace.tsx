import "./Workspace.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { daysBetween, Issue, TripJson, tripPlaceIds } from "@travelmap/core";
import { ArrowLeft, FileInput, Redo2, Trash2, Undo2 } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { DataFile, deleteDocument } from "../../../../data/store";
import { useConfirm } from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../../../shared/components/Toast/Toast";
import {
  useDataset,
  useSessionChanges,
} from "../../../../shared/hooks/useDataset";
import { registerCommands } from "../../../../shared/lib/commands";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";
import { ImportDialog } from "../../../import/components/ImportDialog/ImportDialog";
import { TripStory } from "../../../itinerary/components/TripStory/TripStory";
import {
  applyPlace,
  PlaceRequest,
  returnHome,
} from "../../../itinerary/lib/itinerary";
import { EditorMap } from "../../../map/components/EditorMap/EditorMap";
import { AddPlaceDialog } from "../../../places/components/AddPlaceDialog/AddPlaceDialog";
import { cityCoordinates } from "../../../places/lib/placeOptions";
import {
  TrayTab,
  ValidationTray,
} from "../../../validation/components/ValidationTray/ValidationTray";
import { useTripWorkspace } from "../../Workspace.state";

/**
 * Workspace component
 * The whole editing surface for one trip: the trip story on the left and the
 * map on the right, both rendering from one draft. It autosaves edits and adds
 * places without leaving the current trip.
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
  const [placeRequest, setPlaceRequest] = useState<PlaceRequest | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { confirm, confirmDialog } = useConfirm();

  const { redoEdit, trip, undoEdit, update } = workspace;
  const cityById = new Map(
    dataset.cities.map(({ value }) => [value.id, value] as const),
  );

  /**
   * Asks the author for a place, optionally starting from a point clicked on
   * the map, and remembers what the place is for.
   * @param {PlaceRequest} request - What the place is for
   * @param {[number, number]} [coordinates] - Longitude and latitude
   * @returns {void}
   */
  function requestPlace(
    request: PlaceRequest,
    coordinates?: [number, number],
  ): void {
    setPlacePoint(coordinates);
    setPlaceRequest(request);
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
      if (!(event.ctrlKey || event.metaKey)) {
        if (event.key.toLowerCase() === "n" && !isTyping) {
          event.preventDefault();
          requestPlace({ kind: "travel" });
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
          label: t("story.travelTo", { city: "" }),
          run: () => requestPlace({ kind: "travel" }),
        },
        {
          id: "import",
          label: t("import.title"),
          run: () => setIsImporting(true),
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
   * Applies the picked place to whatever asked for it.
   * @param {string} cityId - The picked city
   * @returns {void}
   */
  function handlePlace(cityId: string): void {
    if (!placeRequest) return;
    update(applyPlace(trip, placeRequest, cityId, cityCoordinates(dataset)));
  }

  /**
   * Applies a validation repair as one undoable edit.
   * @param {NonNullable<Issue["fix"]>} fix - The repair to apply
   * @returns {void}
   */
  function handleApplyFix(fix: NonNullable<Issue["fix"]>): void {
    update(fix.apply(trip));
  }

  return (
    <div className="workspace">
      <header className="workspace__header">
        <Link className="editor-button workspace__back" to="/">
          <ArrowLeft aria-hidden="true" />
          {t("workspace.backToLibrary")}
        </Link>
        <div className="workspace__identity">
          <h1 className="workspace__title">{trip.title || trip.id}</h1>
          <p className="workspace__summary">
            {t("workspace.summary", {
              nights: trip.steps.reduce(
                (sum, step) =>
                  step.type === "stay"
                    ? sum + daysBetween(step.checkIn, step.checkOut)
                    : sum,
                0,
              ),
              places: new Set(tripPlaceIds(trip)).size,
            })}
          </p>
        </div>
        <div className="workspace__actions">
          <button
            className="editor-button"
            onClick={() => setIsImporting(true)}
            type="button"
          >
            <FileInput aria-hidden="true" />
            {t("import.title")}
          </button>
          <button
            className="editor-button"
            disabled={!workspace.canUndo}
            onClick={undoEdit}
            type="button"
          >
            <Undo2 aria-hidden="true" />
            {t("workspace.undo")}
          </button>
          <button
            className="editor-button"
            disabled={!workspace.canRedo}
            onClick={redoEdit}
            type="button"
          >
            <Redo2 aria-hidden="true" />
            {t("workspace.redo")}
          </button>
          <button
            className="editor-button"
            onClick={() =>
              confirm({
                confirmLabel: t("confirm.deleteTrip.action"),
                isDanger: true,
                message: t("confirm.deleteTrip.message"),
                onConfirm: handleDeleteTrip,
                title: t("confirm.deleteTrip.title", {
                  trip: trip.title || trip.id,
                }),
              })
            }
            type="button"
          >
            <Trash2 aria-hidden="true" />
            {t("editorForm.delete")}
          </button>
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
      <div className="workspace__panes">
        <div className="workspace__story">
          <TripStory
            dataset={dataset}
            onChange={update}
            onRequestPlace={requestPlace}
            onReturnHome={() =>
              update(returnHome(trip, cityCoordinates(dataset)))
            }
            onSelect={workspace.select}
            selection={workspace.selection}
            trip={trip}
          />
        </div>
        <div className="workspace__map">
          <EditorMap
            cityById={cityById}
            isDarkTheme={isDarkTheme}
            onAddHere={(coordinates) =>
              requestPlace({ kind: "travel" }, coordinates)
            }
            onCaptureView={(mapFocus) => update({ ...trip, mapFocus })}
            onSelect={workspace.select}
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
      {confirmDialog}
      {placeRequest ? (
        <AddPlaceDialog
          coordinates={placePoint}
          dataset={dataset}
          onClose={() => setPlaceRequest(null)}
          onPlace={handlePlace}
          title={t(`story.placeFor.${placeRequest.kind}`)}
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
