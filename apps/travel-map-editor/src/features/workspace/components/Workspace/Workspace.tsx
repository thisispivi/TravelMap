import "./Workspace.scss";

import { PanelFrame } from "@app/shared/components/PanelFrame/PanelFrame";
import { Popover } from "@app/shared/components/Popover/Popover";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import {
  daysBetween,
  Issue,
  toAuthoredZoom,
  TripJson,
  tripPlaceIds,
} from "@travelmap/core";
import {
  ArrowLeft,
  Ellipsis,
  FileInput,
  Focus,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { DataFile, deleteDocument } from "../../../../data/store";
import { useConfirm } from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../../../shared/components/Toast/Toast";
import { useMapScene } from "../../../../shared/context/MapScene.context";
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
import { legMapId, stepMapId, tripScene } from "../../../map/lib/tripScene";
import { AddPlaceDialog } from "../../../places/components/AddPlaceDialog/AddPlaceDialog";
import { cityCoordinates } from "../../../places/lib/placeOptions";
import {
  TrayTab,
  ValidationTray,
} from "../../../validation/components/ValidationTray/ValidationTray";
import { Selection, useTripWorkspace } from "../../Workspace.state";

/**
 * Names the map id the current selection draws as selected.
 * @param {Selection} selection - What the itinerary is pointed at
 * @returns {string | undefined} The pin or ride id, or nothing for the whole trip
 */
function selectedMapId(selection: Selection): string | undefined {
  if (selection.kind === "trip") return undefined;
  return selection.leg === undefined
    ? stepMapId(selection.index)
    : legMapId(selection.index, selection.outing, selection.leg);
}

/**
 * Reads a map id back into the selection it stands for.
 * @param {string} id - A pin or ride id from the map
 * @returns {Selection} What to point the itinerary at
 */
function selectionOf(id: string): Selection {
  const step = /^step:(\d+)$/.exec(id);
  if (step) return { index: Number(step[1]), kind: "step" };
  const leg = /^leg:(\d+):(\d*):(\d+)$/.exec(id);
  if (!leg) return { kind: "trip" };
  return {
    index: Number(leg[1]),
    kind: "step",
    leg: Number(leg[3]),
    ...(leg[2] ? { outing: Number(leg[2]) } : {}),
  };
}

/**
 * Workspace component
 * One trip, edited in the panel beside the shared map: the itinerary in the
 * panel and the trip drawn on the map, both from one draft. Selecting a step
 * on either side points the other at it; pressing an empty spot on the map
 * adds a place there. Edits autosave and can be undone.
 * @component
 * @param {WorkspaceProps} props
 * @param {DataFile<TripJson>} props.file - The trip document being edited
 * @returns {ReactNode} The trip workspace
 */
export function Workspace({ file }: WorkspaceProps): ReactNode {
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
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const cityById = new Map(
    dataset.cities.map(({ value }) => [value.id, value] as const),
  );
  const scene = tripScene(trip, cityById);
  const selectedId = selectedMapId(workspace.selection);
  const selectedPin = scene.pins.find(({ id }) => id === selectedId);
  const selectedRoute = scene.routes.find(({ id }) => id === selectedId);
  const { readView } = useMapScene(
    {
      ...scene,
      frame: selectedPin
        ? [selectedPin.coordinates]
        : selectedRoute
          ? [selectedRoute.from, selectedRoute.to]
          : scene.frame,
      selectedId,
    },
    {
      onPick: (coordinates) => requestPlace({ kind: "travel" }, coordinates),
      onSelect: (id) => workspace.select(selectionOf(id)),
    },
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

  /**
   * Saves where the map is looking as the trip's own view, the one the site
   * opens it on.
   * @returns {void}
   */
  function captureView(): void {
    const view = readView();
    if (!view) return;
    update({
      ...trip,
      mapFocus: {
        center: [
          Number(view.center[0].toFixed(4)),
          Number(view.center[1].toFixed(4)),
        ],
        zoom: toAuthoredZoom(view.zoom),
      },
    });
  }

  return (
    <div className="workspace">
      <PanelFrame
        header={
          <header className="workspace__header">
            <Link className="workspace__back" to="/">
              <ArrowLeft aria-hidden="true" />
              {t("workspace.backToLibrary")}
            </Link>
            <div className="workspace__bar">
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
              <button
                aria-label={t("workspace.undo")}
                className="workspace__tool"
                disabled={!workspace.canUndo}
                onClick={undoEdit}
                title={t("workspace.undo")}
                type="button"
              >
                <Undo2 aria-hidden="true" />
              </button>
              <button
                aria-label={t("workspace.redo")}
                className="workspace__tool"
                disabled={!workspace.canRedo}
                onClick={redoEdit}
                title={t("workspace.redo")}
                type="button"
              >
                <Redo2 aria-hidden="true" />
              </button>
              <button
                aria-expanded={menuAnchor !== null}
                aria-haspopup="dialog"
                aria-label={t("workspace.more")}
                className="workspace__tool"
                onClick={(event) =>
                  setMenuAnchor(
                    menuAnchor
                      ? null
                      : event.currentTarget.getBoundingClientRect(),
                  )
                }
                ref={menuTriggerRef}
                title={t("workspace.more")}
                type="button"
              >
                <Ellipsis aria-hidden="true" />
              </button>
            </div>
            {workspace.recovered ? (
              <div className="workspace__recovery">
                <p role="status">
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
          </header>
        }
      >
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
      </PanelFrame>
      <Popover
        anchor={menuAnchor}
        label={t("workspace.more")}
        onClose={() => setMenuAnchor(null)}
        placement="below"
        triggerRef={menuTriggerRef}
      >
        <ul className="workspace__menu">
          <li>
            <button
              className="workspace__menu-item"
              onClick={() => {
                setMenuAnchor(null);
                setIsImporting(true);
              }}
              type="button"
            >
              <FileInput aria-hidden="true" />
              {t("import.title")}
            </button>
          </li>
          <li>
            <button
              className="workspace__menu-item"
              onClick={() => {
                setMenuAnchor(null);
                captureView();
              }}
              type="button"
            >
              <Focus aria-hidden="true" />
              {t("map.useThisView")}
            </button>
          </li>
          <li>
            <button
              className="workspace__menu-item workspace__menu-item--danger"
              onClick={() => {
                setMenuAnchor(null);
                confirm({
                  confirmLabel: t("confirm.deleteTrip.action"),
                  isDanger: true,
                  message: t("confirm.deleteTrip.message"),
                  onConfirm: handleDeleteTrip,
                  title: t("confirm.deleteTrip.title", {
                    trip: trip.title || trip.id,
                  }),
                });
              }}
              type="button"
            >
              <Trash2 aria-hidden="true" />
              {t("editorForm.delete")}
            </button>
          </li>
        </ul>
      </Popover>
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
 */
interface WorkspaceProps {
  file: DataFile<TripJson>;
}
