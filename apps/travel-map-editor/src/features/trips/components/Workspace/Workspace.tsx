import "./Workspace.scss";

import {
  daysBetween,
  Issue,
  toAuthoredZoom,
  TripJson,
  tripPlaceIds,
  worstSeverity,
} from "@travelmap/core";
import { Button } from "@travelmap/ui/components/Button/Button";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { Popover } from "@travelmap/ui/components/Popover/Popover";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import {
  ArrowLeft,
  CircleCheck,
  Ellipsis,
  FileInput,
  Focus,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { snapshotBeforeChange } from "@/data/snapshots";
import { DataFile, deleteDocument } from "@/data/store";
import { AddPlaceDialog } from "@/shared/components/AddPlaceDialog/AddPlaceDialog";
import { useConfirm } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/shared/components/Toast/Toast";
import { useMapScene } from "@/shared/context/MapScene.context";
import { useDataset } from "@/shared/hooks/useDataset";
import { registerCommands } from "@/shared/lib/commands";
import { cityCoordinates } from "@/shared/lib/placeOptions";
import { legMapId, stepMapId, tripScene } from "@/shared/lib/tripScene";

import { describeIssue } from "../../lib/issues";
import { applyPlace, PlaceRequest, returnHome } from "../../lib/itinerary";
import { ImportDialog } from "../ImportDialog/ImportDialog";
import { SeverityIcon } from "../IssueList/IssueList";
import { TripStory } from "../TripStory/TripStory";
import { Selection, useTripWorkspace } from "./Workspace.state";

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
 * Reads the step an issue is about as the selection that opens it.
 * @param {Issue} issue - The problem
 * @returns {Selection} The step, or the whole trip
 */
function issueSelection(issue: Issue): Selection {
  const { subject } = issue;
  if (subject.kind !== "step") return { kind: "trip" };
  return {
    index: subject.index,
    kind: "step",
    ...(subject.leg === undefined ? {} : { leg: subject.leg }),
    ...(subject.outing === undefined ? {} : { outing: subject.outing }),
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
  const workspace = useTripWorkspace(file, () =>
    showToast(t("toast.tripSaved")),
  );
  const [nextIssue, setNextIssue] = useState(0);
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
  const tripCityIds = new Set(tripPlaceIds(trip).concat(trip.originCityId));
  /* Every other known place is a dot to tap: the trip is drawn by tapping where it goes next. */
  const candidates = dataset.cities
    .filter(({ value }) => !tripCityIds.has(value.id))
    .map(({ value }) => ({
      coordinates: value.coordinates,
      id: `city:${value.id}`,
      label: t("map.travelTo", { city: value.name }),
      tone: "candidate" as const,
    }));
  const severity = worstSeverity(workspace.issues);
  const upcoming = workspace.issues.at(nextIssue % workspace.issues.length);
  const selectedId = selectedMapId(workspace.selection);
  const selectedPin = scene.pins.find(({ id }) => id === selectedId);
  const selectedRoute = scene.routes.find(({ id }) => id === selectedId);
  const { readView } = useMapScene(
    {
      ...scene,
      pins: [...candidates, ...scene.pins],
      frame: selectedPin
        ? [selectedPin.coordinates]
        : selectedRoute
          ? [selectedRoute.from, selectedRoute.to]
          : scene.frame,
      selectedId,
    },
    {
      onPick: (coordinates) => requestPlace({ kind: "travel" }, coordinates),
      onSelect: (id) =>
        id.startsWith("city:")
          ? update(
              applyPlace(
                trip,
                { kind: "travel" },
                id.slice("city:".length),
                cityCoordinates(dataset),
              ),
            )
          : workspace.select(selectionOf(id)),
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
   * Opens the next problem's step, which the itinerary then scrolls to,
   * cycling back to the first after the last so the counter walks through
   * every problem.
   * @returns {void}
   */
  function showNextIssue(): void {
    if (!upcoming) return;
    workspace.select(issueSelection(upcoming));
    setNextIssue(nextIssue + 1);
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
              {severity && upcoming ? (
                <button
                  className={classNames(
                    "workspace__issues",
                    `workspace__issues--${severity}`,
                  )}
                  onClick={showNextIssue}
                  title={describeIssue(
                    upcoming,
                    /* i18next's overloads are too narrow to pass as a plain function. */
                    t as (key: string, options: object) => string,
                  )}
                  type="button"
                >
                  <SeverityIcon severity={severity} />
                  {t("workspace.issueCount", {
                    count: workspace.issues.length,
                  })}
                </button>
              ) : (
                <span className="workspace__issues workspace__issues--clean">
                  <CircleCheck aria-hidden="true" />
                  {t("workspace.noIssues")}
                </span>
              )}
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
                <Button onClick={workspace.restoreRecovered} variant="primary">
                  {t("workspace.restore")}
                </Button>
                <Button onClick={workspace.discardRecovered}>
                  {t("workspace.discard")}
                </Button>
              </div>
            ) : null}
          </header>
        }
      >
        <div className="workspace__story">
          <TripStory
            dataset={dataset}
            issues={workspace.issues}
            onApplyFix={handleApplyFix}
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
