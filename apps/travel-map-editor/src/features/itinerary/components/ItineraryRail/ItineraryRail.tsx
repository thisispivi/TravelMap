import "./ItineraryRail.scss";

import PositionIcon from "@app/assets/icons/Position.svg?react";
import { TransportModeIcon } from "@app/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { isActivationKey } from "@app/shared/lib/keyboard";
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
import { MouseEvent, ReactNode } from "react";

import { formatDuration } from "../../../routes/lib/legDerivation";
import { Selection } from "../../../workspace/Workspace.state";
import { dayNumber, groupByDay, ItineraryDay } from "../../lib/days";
import { Step } from "../../lib/itinerary";

/**
 * Formats a day heading, falling back to the unscheduled bucket's own label.
 * @param {string | null} date - The day key
 * @returns {string} A short weekday and date
 */
function formatDay(date: string | null): string {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        weekday: "short",
      }).format(parsed);
}

/**
 * StepRow component
 * One entry on the rail: a numbered bead for a stay, a mode icon for a leg.
 * The two kinds read differently on purpose, because the commonest authoring
 * mistake is a leg that does not connect the stays around it. Dragging is an
 * accelerator only: the same move is always available from the arrow buttons,
 * and the bead doubles as a keyboard-operable drag handle.
 * @component
 * @param {StepRowProps} props
 * @param {Map<string, CityJson>} props.cityById - Cities the trip can reference
 * @param {number} props.index - Position in the itinerary
 * @param {boolean} props.isFirst - Whether the step is first
 * @param {boolean} props.isLast - Whether the step is last
 * @param {boolean} props.isPicked - Whether the step is in the bulk selection
 * @param {boolean} props.isSelected - Whether the step is the primary selection
 * @param {Issue[]} props.issues - Issues attached to this step
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
  isLast,
  isPicked,
  isSelected,
  issues,
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
  } = useSortable({ id: index });
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

  const summary =
    step.type === "stop"
      ? name(step.cityId)
      : `${name(step.fromId)} → ${name(step.toId)}`;
  const meta =
    step.type === "stop"
      ? t(step.isLayover ? "trip.layover" : "trip.stay")
      : [
          t(`transportMode.${step.mode}`),
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
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        aria-label={t("rail.dragHandle", { position: index + 1 })}
        className="itinerary-rail__bead"
        type="button"
        {...attributes}
        {...listeners}
      >
        {step.type === "stop" ? (
          stopNumber > 0 ? (
            stopNumber
          ) : (
            <PositionIcon aria-hidden="true" />
          )
        ) : (
          <TransportModeIcon mode={step.mode} />
        )}
      </button>
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
        <button
          aria-label={t("trip.moveEarlier", { index: index + 1 })}
          className="itinerary-rail__action"
          disabled={isFirst}
          onClick={() => onMove(-1)}
          type="button"
        >
          ↑
        </button>
        <button
          aria-label={t("trip.moveLater", { index: index + 1 })}
          className="itinerary-rail__action"
          disabled={isLast}
          onClick={() => onMove(1)}
          type="button"
        >
          ↓
        </button>
        <button
          aria-label={t("trip.removeStep", { index: index + 1 })}
          className="itinerary-rail__action itinerary-rail__action--danger"
          onClick={onRemove}
          type="button"
        >
          ×
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
 * @property {boolean} isLast - Whether the step is last
 * @property {boolean} isPicked - Whether the step is in the bulk selection
 * @property {boolean} isSelected - Whether the step is the primary selection
 * @property {Issue[]} issues - Issues attached to this step
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
  isLast: boolean;
  isPicked: boolean;
  isSelected: boolean;
  issues: Issue[];
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onSelect: (event: MouseEvent) => void;
  stopNumber: number;
  step: Step;
}

/**
 * ItineraryRail component
 * The ordered truth of the trip: day headings, stays, and the legs between
 * them. Every reordering is available three ways — drag, arrow buttons, and
 * dnd-kit's keyboard sensor on the bead — because a trip that can only be
 * corrected with a mouse stays wrong on a tablet.
 * @component
 * @param {ItineraryRailProps} props
 * @param {Map<string, CityJson>} props.cityById - Cities the trip can reference
 * @param {Issue[]} props.issues - Live validation for the trip
 * @param {() => void} props.onAddStop - Opens the place search
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
  issues,
  onAddStop,
  onReorder,
  onRemove,
  onSelect,
  onTogglePicked,
  picked,
  selection,
  trip,
}: ItineraryRailProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const days = groupByDay(trip.steps);
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
        <p className="itinerary-rail__empty-title">{t("rail.emptyTitle")}</p>
        <p className="itinerary-rail__empty-hint">{t("rail.emptyHint")}</p>
        <button
          className="editor-button editor-button--primary"
          onClick={onAddStop}
          type="button"
        >
          {t("rail.addStop")}
        </button>
      </div>
    );
  return (
    <div className="itinerary-rail">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={trip.steps.map((_step, index) => index)}
          strategy={verticalListSortingStrategy}
        >
          {days.map((day: ItineraryDay) => (
            <section
              className="itinerary-rail__day"
              key={`${day.date ?? "unscheduled"}-${day.indexes[0]}`}
            >
              <h3
                className="itinerary-rail__day-heading"
                onClick={() => onSelect({ date: day.date, kind: "day" })}
                onKeyDown={(event) =>
                  isActivationKey(event) &&
                  onSelect({ date: day.date, kind: "day" })
                }
                role="button"
                tabIndex={0}
              >
                <span className="itinerary-rail__day-number">
                  {day.date
                    ? t("rail.dayNumber", { number: dayNumber(days, day) })
                    : t("rail.unscheduled")}
                </span>
                <span className="itinerary-rail__day-date">
                  {formatDay(day.date)}
                </span>
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
                      isFirst={index === 0}
                      isLast={index === trip.steps.length - 1}
                      isPicked={picked.includes(index)}
                      isSelected={isSelected}
                      issues={issuesFor(index)}
                      key={index}
                      onMove={(direction) =>
                        onReorder(index, index + direction)
                      }
                      onRemove={() => onRemove(index)}
                      onSelect={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey) {
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
          ))}
        </SortableContext>
      </DndContext>
      <button
        className="editor-button editor-button--primary itinerary-rail__add"
        onClick={onAddStop}
        type="button"
      >
        {t("rail.addStop")}
      </button>
    </div>
  );
}

/**
 * Props for ItineraryRail.
 * @property {Map<string, CityJson>} cityById - Cities the trip can reference
 * @property {Issue[]} issues - Live validation for the trip
 * @property {() => void} onAddStop - Opens the place search
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
  issues: Issue[];
  onAddStop: () => void;
  onReorder: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onSelect: (selection: Selection) => void;
  onTogglePicked: (index: number) => void;
  picked: number[];
  selection: Selection;
  trip: TripJson;
}
