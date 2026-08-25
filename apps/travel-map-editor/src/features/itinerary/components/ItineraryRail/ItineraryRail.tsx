import "./ItineraryRail.scss";

import PositionIcon from "@app/assets/icons/Position.svg?react";
import { TransportModeIcon } from "@app/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CityJson, Issue, TripJson } from "@travelmap/core";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  MapPinPlus,
  Route,
  Trash2,
} from "lucide-react";
import { MouseEvent, ReactNode } from "react";

import { formatDuration } from "../../../routes/lib/legDerivation";
import { Selection } from "../../../workspace/Workspace.state";
import { dayNumber, formatDayLabel, ItineraryDay } from "../../lib/days";
import { Step } from "../../lib/itinerary";

const MS_PER_DAY = 86_400_000;

/**
 * Counts the nights a stay covers, so the rail can answer how long the author
 * was somewhere without them opening the inspector for every stop.
 * @param {string} sDate - Arrival date
 * @param {string} eDate - Departure date
 * @returns {number} Whole nights, zero when the dates are same-day or unusable
 */
function nightsBetween(sDate: string, eDate: string): number {
  const from = new Date(`${sDate.slice(0, 10)}T00:00:00`).getTime();
  const to = new Date(`${eDate.slice(0, 10)}T00:00:00`).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / MS_PER_DAY));
}

/**
 * StepRow component
 * One entry on the rail: a numbered bead for a stay, a mode icon threaded onto
 * the connector for a leg. The two kinds read differently on purpose, because
 * the commonest authoring mistake is a leg that does not connect the stays
 * around it. Row controls stay hidden until the row is hovered or focused, so
 * a forty-step itinerary reads as places rather than as buttons. Dragging is an
 * accelerator only: the same move is always available from the arrow buttons,
 * and the bead doubles as a keyboard-operable drag handle.
 * @component
 * @param {StepRowProps} props
 * @param {Map<string, CityJson>} props.cityById - Cities the trip can reference
 * @param {number} props.index - Position in the itinerary
 * @param {boolean} props.isFirst - Whether the step is first
 * @param {boolean} props.isHovered - Whether another pane is pointing here
 * @param {boolean} props.isLast - Whether the step is last
 * @param {boolean} props.isPicked - Whether the step is in the bulk selection
 * @param {boolean} props.isSelected - Whether the step is the primary selection
 * @param {Issue[]} props.issues - Issues attached to this step
 * @param {(index: number | null) => void} props.onHover - Hover callback
 * @param {(direction: -1 | 1) => void} props.onMove - Reorder callback
 * @param {() => void} props.onRemove - Removal callback
 * @param {(event: MouseEvent) => void} props.onSelect - Selection callback
 * @param {number} props.stopNumber - The stay's number, zero for a leg
 * @param {Step} props.step - The step to render
 * @returns {ReactNode} The rail row
 */
function StepRow({
  cityById,
  index,
  isFirst,
  isHovered,
  isLast,
  isPicked,
  isSelected,
  issues,
  onHover,
  onMove,
  onRemove,
  onSelect,
  stopNumber,
  step,
}: StepRowProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ disabled: step.type === "transport", id: index });
  const blocking = issues.filter((issue) => issue.severity === "blocking");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  /**
   * Names a referenced city, degrading to the raw id when it has been deleted
   * out from under the trip.
   * @param {string} id - The city id
   * @returns {string} The display name
   */
  function name(id: string): string {
    return cityById.get(id)?.name ?? (id || "—");
  }

  const nights =
    step.type === "stop" ? nightsBetween(step.sDate, step.eDate) : 0;
  const summary =
    step.type === "stop"
      ? name(step.cityId)
      : `${name(step.fromId)} ${step.roundTrip ? "↔" : "→"} ${name(step.toId)}`;
  const meta =
    step.type === "stop"
      ? [
          t(step.isLayover ? "trip.layover" : "trip.stay"),
          nights > 0 ? t("rail.nights", { count: nights }) : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : [
          t(`transportMode.${step.mode}`),
          step.roundTrip ? t("trip.dayTrip") : "",
          step.distanceInKm ? `${step.distanceInKm} km` : "",
          step.durationMinutes ? formatDuration(step.durationMinutes) : "",
        ]
          .filter(Boolean)
          .join(" · ");
  return (
    <li
      className={classNames(
        "itinerary-rail__row",
        isSelected && "itinerary-rail__row--selected",
        isHovered && "itinerary-rail__row--hovered",
        isPicked && "itinerary-rail__row--picked",
        isDragging && "itinerary-rail__row--dragging",
        step.type === "stop"
          ? "itinerary-rail__row--stop"
          : "itinerary-rail__row--leg",
        blocking.length > 0 && "itinerary-rail__row--blocking",
        blocking.length === 0 &&
          warnings.length > 0 &&
          "itinerary-rail__row--warning",
      )}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {step.type === "stop" ? (
        <button
          aria-label={t("rail.dragHandle", { position: index + 1 })}
          className="itinerary-rail__drag-handle"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" />
        </button>
      ) : (
        <span className="itinerary-rail__drag-spacer" />
      )}
      <span aria-hidden="true" className="itinerary-rail__bead">
        {step.type === "stop" ? (
          stopNumber > 0 ? (
            stopNumber
          ) : (
            <PositionIcon aria-hidden="true" />
          )
        ) : (
          <TransportModeIcon mode={step.mode} />
        )}
      </span>
      <button
        aria-current={isSelected ? "true" : undefined}
        className="itinerary-rail__summary"
        onClick={onSelect}
        type="button"
      >
        <span className="itinerary-rail__title">{summary}</span>
        <span className="itinerary-rail__meta">{meta}</span>
        {issues.length > 0 ? (
          <span className="itinerary-rail__issues">
            {blocking.length > 0
              ? t("rail.blockingCount", { count: blocking.length })
              : t("rail.warningCount", { count: warnings.length })}
          </span>
        ) : null}
      </button>
      <span className="itinerary-rail__actions">
        {step.type === "stop" ? (
          <>
            <button
              aria-label={t("trip.moveEarlier", { index: index + 1 })}
              className="itinerary-rail__action"
              disabled={isFirst}
              onClick={() => onMove(-1)}
              type="button"
            >
              <ChevronUp aria-hidden="true" />
            </button>
            <button
              aria-label={t("trip.moveLater", { index: index + 1 })}
              className="itinerary-rail__action"
              disabled={isLast}
              onClick={() => onMove(1)}
              type="button"
            >
              <ChevronDown aria-hidden="true" />
            </button>
          </>
        ) : null}
        <button
          aria-label={t("trip.removeStep", { index: index + 1 })}
          className="itinerary-rail__action itinerary-rail__action--danger"
          onClick={onRemove}
          type="button"
        >
          <Trash2 aria-hidden="true" />
        </button>
      </span>
    </li>
  );
}

/**
 * Props for StepRow.
 * @property {Map<string, CityJson>} cityById - Cities the trip can reference
 * @property {number} index - Position in the itinerary
 * @property {boolean} isFirst - Whether the step is first
 * @property {boolean} isHovered - Whether another pane is pointing here
 * @property {boolean} isLast - Whether the step is last
 * @property {boolean} isPicked - Whether the step is in the bulk selection
 * @property {boolean} isSelected - Whether the step is the primary selection
 * @property {Issue[]} issues - Issues attached to this step
 * @property {(index: number | null) => void} onHover - Hover callback
 * @property {(direction: -1 | 1) => void} onMove - Reorder callback
 * @property {() => void} onRemove - Removal callback
 * @property {(event: MouseEvent) => void} onSelect - Selection callback
 * @property {number} stopNumber - The stay's number, zero for a leg
 * @property {Step} step - The step to render
 */
interface StepRowProps {
  cityById: Map<string, CityJson>;
  index: number;
  isFirst: boolean;
  isHovered: boolean;
  isLast: boolean;
  isPicked: boolean;
  isSelected: boolean;
  issues: Issue[];
  onHover: (index: number | null) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onSelect: (event: MouseEvent) => void;
  stopNumber: number;
  step: Step;
}

/**
 * ItineraryRail component
 * The ordered truth of the trip: day headings, stays, and the legs between
 * them. Headings stick to the top of the pane while their own day scrolls,
 * because on a three-week itinerary the answer to which day is on screen has
 * otherwise scrolled away. Stops can be reordered by dragging, with arrow
 * buttons, or with dnd-kit's keyboard sensor on the drag handle.
 * @component
 * @param {ItineraryRailProps} props
 * @param {Map<string, CityJson>} props.cityById - Cities the trip can reference
 * @param {ItineraryDay[]} props.days - The itinerary grouped into days
 * @param {number | null} props.hovered - The step another pane is pointing at
 * @param {Issue[]} props.issues - Live validation for the trip
 * @param {() => void} props.onAddStop - Opens the place search
 * @param {(index: number | null) => void} props.onHover - Hover callback
 * @param {(from: number, to: number) => void} props.onReorder - Reorder callback
 * @param {(index: number) => void} props.onRemove - Removal callback
 * @param {(selection: Selection) => void} props.onSelect - Selection callback
 * @param {(index: number) => void} props.onTogglePicked - Bulk selection callback
 * @param {number[]} props.picked - Steps in the bulk selection
 * @param {Selection} props.selection - What every pane is pointed at
 * @param {TripJson} props.trip - The trip being edited
 * @returns {ReactNode} The itinerary pane
 */
export function ItineraryRail({
  cityById,
  days,
  hovered,
  issues,
  onAddStop,
  onHover,
  onReorder,
  onRemove,
  onSelect,
  onTogglePicked,
  picked,
  selection,
  trip,
}: ItineraryRailProps): ReactNode {
  const { currLanguage, t } = useLanguage(["editor"]);
  const stopOrder = trip.steps.flatMap((step, index) =>
    step.type === "stop" ? [index] : [],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   * Collects the issues attached to one step.
   * @param {number} index - Position of the step
   * @returns {Issue[]} Issues about that step
   */
  function issuesFor(index: number): Issue[] {
    return issues.filter(
      (issue) => issue.subject.kind === "step" && issue.subject.index === index,
    );
  }

  /**
   * Applies a completed drag to the itinerary.
   * @param {DragEndEvent} event - The finished drag
   * @returns {void}
   */
  function handleDragEnd(event: DragEndEvent): void {
    const from = Number(event.active.id);
    const to = Number(event.over?.id ?? from);
    if (Number.isFinite(from) && Number.isFinite(to) && from !== to)
      onReorder(from, to);
  }

  if (trip.steps.length === 0)
    return (
      <div className="itinerary-rail itinerary-rail--empty">
        <span aria-hidden="true" className="itinerary-rail__empty-icon">
          <Route />
        </span>
        <p className="itinerary-rail__empty-title">{t("rail.emptyTitle")}</p>
        <p className="itinerary-rail__empty-hint">{t("rail.emptyHint")}</p>
        <button
          className="editor-button editor-button--primary"
          onClick={onAddStop}
          type="button"
        >
          <MapPinPlus aria-hidden="true" />
          {t("rail.addStop")}
        </button>
      </div>
    );
  return (
    <div className="itinerary-rail">
      <DndContext
        accessibility={{
          screenReaderInstructions: {
            draggable: t("rail.dragInstructions"),
          },
        }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={stopOrder}
          strategy={verticalListSortingStrategy}
        >
          {days.map((day: ItineraryDay) => {
            const isDaySelected =
              selection.kind === "day" && selection.date === day.date;
            const stops = day.indexes.filter(
              (index) => trip.steps[index]?.type === "stop",
            ).length;
            return (
              <section
                className="itinerary-rail__day"
                key={`${day.date ?? "unscheduled"}-${day.indexes[0]}`}
              >
                <h3 className="itinerary-rail__day-heading">
                  <button
                    aria-current={isDaySelected ? "true" : undefined}
                    className={classNames(
                      "itinerary-rail__day-button",
                      isDaySelected && "itinerary-rail__day-button--selected",
                    )}
                    onClick={() => onSelect({ date: day.date, kind: "day" })}
                    type="button"
                  >
                    <span className="itinerary-rail__day-number">
                      {day.date
                        ? t("rail.dayNumber", { number: dayNumber(days, day) })
                        : t("rail.unscheduled")}
                    </span>
                    <span className="itinerary-rail__day-date">
                      {formatDayLabel(day.date, currLanguage)}
                    </span>
                    {stops > 0 ? (
                      <span className="itinerary-rail__day-count">
                        {t("rail.dayStops", { count: stops })}
                      </span>
                    ) : null}
                  </button>
                </h3>
                <ol className="itinerary-rail__rows">
                  {day.indexes.map((index) => {
                    const step = trip.steps[index];
                    if (!step) return null;
                    const isSelected =
                      selection.kind === "step" && selection.index === index;
                    return (
                      <StepRow
                        cityById={cityById}
                        index={index}
                        isFirst={stopOrder.indexOf(index) === 0}
                        isHovered={hovered === index}
                        isLast={
                          stopOrder.indexOf(index) === stopOrder.length - 1
                        }
                        isPicked={picked.includes(index)}
                        isSelected={isSelected}
                        issues={issuesFor(index)}
                        key={index}
                        onHover={onHover}
                        onMove={(direction) => {
                          const position = stopOrder.indexOf(index);
                          const target = stopOrder[position + direction];
                          if (target !== undefined) onReorder(index, target);
                        }}
                        onRemove={() => onRemove(index)}
                        onSelect={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey
                          ) {
                            onTogglePicked(index);
                            return;
                          }
                          onSelect({ index, kind: "step" });
                        }}
                        step={step}
                        stopNumber={stopOrder.indexOf(index) + 1}
                      />
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </SortableContext>
      </DndContext>
      <button
        className="itinerary-rail__append"
        onClick={onAddStop}
        type="button"
      >
        <span aria-hidden="true" className="itinerary-rail__append-bead">
          <MapPinPlus />
        </span>
        <span className="itinerary-rail__append-label">{t("rail.append")}</span>
      </button>
    </div>
  );
}

/**
 * Props for ItineraryRail.
 * @property {Map<string, CityJson>} cityById - Cities the trip can reference
 * @property {ItineraryDay[]} days - The itinerary grouped into days
 * @property {number | null} hovered - The step another pane is pointing at
 * @property {Issue[]} issues - Live validation for the trip
 * @property {() => void} onAddStop - Opens the place search
 * @property {(index: number | null) => void} onHover - Hover callback
 * @property {(from: number, to: number) => void} onReorder - Reorder callback
 * @property {(index: number) => void} onRemove - Removal callback
 * @property {(selection: Selection) => void} onSelect - Selection callback
 * @property {(index: number) => void} onTogglePicked - Bulk selection callback
 * @property {number[]} picked - Steps in the bulk selection
 * @property {Selection} selection - What every pane is pointed at
 * @property {TripJson} trip - The trip being edited
 */
interface ItineraryRailProps {
  cityById: Map<string, CityJson>;
  days: ItineraryDay[];
  hovered: number | null;
  issues: Issue[];
  onAddStop: () => void;
  onHover: (index: number | null) => void;
  onReorder: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onSelect: (selection: Selection) => void;
  onTogglePicked: (index: number) => void;
  picked: number[];
  selection: Selection;
  trip: TripJson;
}
