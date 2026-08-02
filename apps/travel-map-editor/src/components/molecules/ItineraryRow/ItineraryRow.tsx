import "./ItineraryRow.scss";

import PositionIcon from "@app/assets/icons/Position.svg?react";
import { TransportModeIcon } from "@app/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { TripJson } from "@travelmap/core";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode } from "react";

import { ComboboxOption } from "../Combobox/Combobox";
import { StopFields, TransportFields } from "../StepFields/StepFields";

/**
 * One ordered itinerary entry, either a stay or a leg between two cities.
 */
export type Step = TripJson["steps"][number];

/**
 * ItineraryRow component
 * One itinerary entry, collapsed to a readable summary until it is opened. A
 * trip can hold dozens of steps, so showing every field at once turns the
 * screen into an unreadable wall; only the open step expands. Rows are drawn
 * as beads on a connecting rail (see ItineraryRow.scss), reading as one
 * ordered route rather than a plain list.
 * @component
 * @param {ItineraryRowProps} props
 * @param {ComboboxOption[]} props.cityOptions - Selectable cities
 * @param {number} props.index - Position in the itinerary
 * @param {boolean} props.isFirst - Whether the step is first
 * @param {boolean} props.isLast - Whether the step is last
 * @param {boolean} props.isOpen - Whether the step is expanded
 * @param {string} props.kind - The step's short kind label (e.g. "stay", "plane")
 * @param {(step: Step) => void} props.onChange - Step update callback
 * @param {(direction: -1 | 1) => void} props.onMove - Reorder callback
 * @param {() => void} props.onRemove - Removal callback
 * @param {() => void} props.onToggle - Expand or collapse callback
 * @param {string} props.range - The formatted date range shown in the summary
 * @param {Step} props.step - The step to render
 * @param {string} props.summary - The step's summary title
 * @returns {ReactNode} The itinerary row
 */
export function ItineraryRow({
  cityOptions,
  index,
  isFirst,
  isLast,
  isOpen,
  kind,
  onChange,
  onMove,
  onRemove,
  onToggle,
  range,
  step,
  summary,
}: ItineraryRowProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <li
      className={classNames(
        "itinerary-row",
        isOpen && "itinerary-row--open",
        step.type === "stop"
          ? "itinerary-row--stop"
          : "itinerary-row--transport",
      )}
    >
      <div className="itinerary-row__row">
        <span className="itinerary-row__badge">
          {step.type === "stop" ? (
            <PositionIcon aria-hidden="true" />
          ) : (
            <TransportModeIcon mode={step.mode} />
          )}
        </span>
        <button
          aria-expanded={isOpen}
          className="itinerary-row__summary"
          onClick={onToggle}
          type="button"
        >
          <span className="itinerary-row__index">{index + 1}</span>
          <span className="itinerary-row__text">
            <span className="itinerary-row__title">{summary}</span>
            <span className="itinerary-row__meta">
              <span className="itinerary-row__kind">{kind}</span>
              {range ? (
                <span className="itinerary-row__dates">{range}</span>
              ) : null}
            </span>
          </span>
          <span
            className={classNames(
              "itinerary-row__caret",
              isOpen && "itinerary-row__caret--open",
            )}
          />
        </button>
        <div className="itinerary-row__actions">
          <button
            aria-label={t("trip.moveEarlier", { index: index + 1 })}
            className="itinerary-row__action"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            type="button"
          >
            ↑
          </button>
          <button
            aria-label={t("trip.moveLater", { index: index + 1 })}
            className="itinerary-row__action"
            disabled={isLast}
            onClick={() => onMove(1)}
            type="button"
          >
            ↓
          </button>
          <button
            aria-label={t("trip.removeStep", { index: index + 1 })}
            className="itinerary-row__action itinerary-row__action--danger"
            onClick={onRemove}
            type="button"
          >
            ×
          </button>
        </div>
      </div>
      <LazyMotion features={domAnimation}>
        <AnimatePresence initial={false}>
          {isOpen ? (
            <m.div
              animate={{ height: "auto", opacity: 1 }}
              className="itinerary-row__body"
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="itinerary-row__fields">
                {step.type === "stop" ? (
                  <StopFields
                    cityOptions={cityOptions}
                    onChange={onChange}
                    step={step}
                  />
                ) : (
                  <TransportFields
                    cityOptions={cityOptions}
                    onChange={onChange}
                    step={step}
                  />
                )}
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </LazyMotion>
    </li>
  );
}

/**
 * Props for ItineraryRow.
 * @property {ComboboxOption[]} cityOptions - Selectable cities
 * @property {number} index - Position in the itinerary
 * @property {boolean} isFirst - Whether the step is first
 * @property {boolean} isLast - Whether the step is last
 * @property {boolean} isOpen - Whether the step is expanded
 * @property {string} kind - The step's short kind label (e.g. "stay", "plane")
 * @property {(step: Step) => void} onChange - Step update callback
 * @property {(direction: -1 | 1) => void} onMove - Reorder callback
 * @property {() => void} onRemove - Removal callback
 * @property {() => void} onToggle - Expand or collapse callback
 * @property {string} range - The formatted date range shown in the summary
 * @property {Step} step - The step to render
 * @property {string} summary - The step's summary title
 */
interface ItineraryRowProps {
  cityOptions: ComboboxOption[];
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isOpen: boolean;
  kind: string;
  onChange: (step: Step) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onToggle: () => void;
  range: string;
  step: Step;
  summary: string;
}
