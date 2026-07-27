import "./TripScreen.scss";

import PositionIcon from "@app/assets/icons/Position.svg?react";
import { TransportModeIcon } from "@app/components/atoms/TransportModeIcon/TransportModeIcon";
import { classNames } from "@app/utils/className";
import { TripJson } from "@travelmap/core";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useState } from "react";

import {
  cities,
  DataFile,
  deleteData,
  reloadAt,
  tripDateErrors,
  tripPath,
  writeData,
} from "../../../dataset";
import { findWorldCountry } from "../../../world";
import { Combobox, ComboboxOption } from "../../Combobox/Combobox";
import { DatePicker } from "../../DatePicker/DatePicker";
import { EditorForm } from "../../EditorForm/EditorForm";
import { TextField } from "../../Fields/Fields";
import { LocalizedNames } from "../../LocalizedNames/LocalizedNames";
import { StopFields, TransportFields } from "../../StepFields/StepFields";

/**
 * One ordered itinerary entry, either a stay or a leg between two cities.
 */
type Step = TripJson["steps"][number];

const cityNames = new Map(
  cities.map(({ value }) => [value.id, value.name] as const),
);

/**
 * Names a city for the itinerary summary, falling back to the raw id when the
 * city has been deleted out from under the trip.
 * @param {string} id - The city id
 * @returns {string} The display name
 */
function cityName(id: string): string {
  return cityNames.get(id) ?? (id || "—");
}

/**
 * Renders a step's date range compactly for the collapsed summary.
 * @param {string} [sDate] - Start date
 * @param {string} [eDate] - End date
 * @returns {string} The formatted range, empty when undated
 */
function dateRange(sDate?: string, eDate?: string): string {
  /**
   * Formats one authored date as a short day and month, dropping any time.
   * @param {string} [value] - The authored date
   * @returns {string} The formatted date, empty when absent or unparseable
   */
  function format(value?: string): string {
    if (!value) return "";
    const date = new Date(`${value.split("T")[0]}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? ""
      : new Intl.DateTimeFormat(undefined, {
          day: "numeric",
          month: "short",
        }).format(date);
  }

  const start = format(sDate);
  const end = format(eDate);
  if (!start) return end;
  if (!end || end === start) return start;
  return `${start} – ${end}`;
}

/**
 * StepRow component
 * One itinerary entry, collapsed to a readable summary until it is opened.
 * A trip can hold dozens of steps, so showing every field at once turns the
 * screen into an unreadable wall; only the open step expands.
 * @component
 * @param {StepRowProps} props
 * @param {ComboboxOption[]} props.cityOptions - Selectable cities
 * @param {number} props.index - Position in the itinerary
 * @param {boolean} props.isFirst - Whether the step is first
 * @param {boolean} props.isLast - Whether the step is last
 * @param {boolean} props.isOpen - Whether the step is expanded
 * @param {(step: Step) => void} props.onChange - Step update callback
 * @param {(direction: -1 | 1) => void} props.onMove - Reorder callback
 * @param {() => void} props.onRemove - Removal callback
 * @param {() => void} props.onToggle - Expand or collapse callback
 * @param {Step} props.step - The step to render
 * @returns {ReactNode} The itinerary row
 */
function StepRow({
  cityOptions,
  index,
  isFirst,
  isLast,
  isOpen,
  onChange,
  onMove,
  onRemove,
  onToggle,
  step,
}: StepRowProps): ReactNode {
  const summary =
    step.type === "stop"
      ? cityName(step.cityId)
      : `${cityName(step.fromId)} → ${cityName(step.toId)}`;
  const range =
    step.type === "stop"
      ? dateRange(step.sDate, step.eDate)
      : dateRange(step.sDate, step.eDate);
  return (
    <li
      className={classNames(
        "trip-step",
        isOpen && "trip-step--open",
        step.type === "stop" ? "trip-step--stop" : "trip-step--transport",
      )}
    >
      <div className="trip-step__row">
        <button
          aria-expanded={isOpen}
          className="trip-step__summary"
          onClick={onToggle}
          type="button"
        >
          <span className="trip-step__index">{index + 1}</span>
          <span className="trip-step__icon">
            {step.type === "stop" ? (
              <PositionIcon aria-hidden="true" />
            ) : (
              <TransportModeIcon mode={step.mode} />
            )}
          </span>
          <span className="trip-step__title">{summary}</span>
          <span className="trip-step__kind">
            {step.type === "stop"
              ? step.isLayover
                ? "layover"
                : "stay"
              : step.mode}
          </span>
          <span className="trip-step__dates">{range}</span>
          <span
            className={classNames(
              "trip-step__caret",
              isOpen && "trip-step__caret--open",
            )}
          />
        </button>
        <div className="trip-step__actions">
          <button
            aria-label={`Move step ${index + 1} earlier`}
            className="trip-step__action"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            type="button"
          >
            ↑
          </button>
          <button
            aria-label={`Move step ${index + 1} later`}
            className="trip-step__action"
            disabled={isLast}
            onClick={() => onMove(1)}
            type="button"
          >
            ↓
          </button>
          <button
            aria-label={`Remove step ${index + 1}`}
            className="trip-step__action trip-step__action--danger"
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
              className="trip-step__body"
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="trip-step__fields">
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
 * Props for StepRow.
 * @property {ComboboxOption[]} cityOptions - Selectable cities
 * @property {number} index - Position in the itinerary
 * @property {boolean} isFirst - Whether the step is first
 * @property {boolean} isLast - Whether the step is last
 * @property {boolean} isOpen - Whether the step is expanded
 * @property {(step: Step) => void} onChange - Step update callback
 * @property {(direction: -1 | 1) => void} onMove - Reorder callback
 * @property {() => void} onRemove - Removal callback
 * @property {() => void} onToggle - Expand or collapse callback
 * @property {Step} step - The step to render
 */
interface StepRowProps {
  cityOptions: ComboboxOption[];
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isOpen: boolean;
  onChange: (step: Step) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onToggle: () => void;
  step: Step;
}

/**
 * TripScreen component
 * Edits one trip and its ordered itinerary. Dates are validated before a save
 * because an unparseable date stops the public app from loading at all.
 * @component
 * @param {TripScreenProps} props
 * @param {DataFile<TripJson>} props.file - Trip source file
 * @returns {ReactNode} The trip editor screen
 */
export function TripScreen({ file }: TripScreenProps): ReactNode {
  const [value, setValue] = useState(file.value);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const cityOptions: ComboboxOption[] = cities.map(({ value: city }) => ({
    hint: city.countryId,
    iconUrl: findWorldCountry(city.countryId)?.flagUrl,
    label: city.name,
    value: city.id,
  }));
  const firstCityId = cities[0]?.value.id ?? "";
  const problems = [
    ...(value.title.trim() ? [] : ["A title is required."]),
    ...tripDateErrors(value),
    ...(cities.length === 0
      ? ["Add at least one city before authoring an itinerary."]
      : []),
  ];

  /**
   * Appends a step and opens it for editing.
   * @param {Step} step - Step to append
   * @returns {void}
   */
  function addStep(step: Step): void {
    setValue((current) => ({ ...current, steps: [...current.steps, step] }));
    setOpenStep(value.steps.length);
  }

  /**
   * Replaces one step without mutating the current itinerary.
   * @param {number} index - Step position
   * @param {Step} step - Replacement step
   * @returns {void}
   */
  function replaceStep(index: number, step: Step): void {
    setValue((current) => ({
      ...current,
      steps: current.steps.map((existing, currentIndex) =>
        currentIndex === index ? step : existing,
      ),
    }));
  }

  /**
   * Moves a step one position within the itinerary, keeping it open.
   * @param {number} index - Current position
   * @param {-1 | 1} direction - Move direction
   * @returns {void}
   */
  function moveStep(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= value.steps.length) return;
    setValue((current) => {
      const steps = [...current.steps];
      [steps[index], steps[target]] = [steps[target]!, steps[index]!];
      return { ...current, steps };
    });
    if (openStep === index) setOpenStep(target);
  }

  /**
   * Removes a step from the itinerary.
   * @param {number} index - Step position
   * @returns {void}
   */
  function removeStep(index: number): void {
    setValue((current) => ({
      ...current,
      steps: current.steps.filter(
        (_unused, currentIndex) => currentIndex !== index,
      ),
    }));
    setOpenStep(null);
  }

  /**
   * Removes the trip document and returns to the overview.
   * @returns {Promise<void>} Completion after the delete
   */
  async function handleDelete(): Promise<void> {
    await deleteData(file.path);
    reloadAt("/");
  }
  return (
    <EditorForm
      eyebrow="Trip"
      isDirty={isDirty}
      onDelete={handleDelete}
      onSave={() => writeData(tripPath(value.id), value)}
      path={file.path}
      problems={problems}
      title={file.value.title}
    >
      <LocalizedNames
        canonicalHint="Shown on trip cards and the trip page."
        label="Titles"
        onChange={({ name, nameByLocale }) =>
          setValue({ ...value, title: name, titleByLocale: nameByLocale })
        }
        value={{ name: value.title, nameByLocale: value.titleByLocale }}
      />
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Trip details</h2>
        <div className="editor-panel__row">
          <DatePicker
            label="Start"
            onChange={(sDate) => setValue({ ...value, sDate: sDate ?? "" })}
            value={value.sDate}
            withTime={false}
          />
          <DatePicker
            label="End"
            onChange={(eDate) => setValue({ ...value, eDate: eDate ?? "" })}
            value={value.eDate}
            withTime={false}
          />
        </div>
        <div className="editor-panel__row">
          <Combobox
            label="Origin"
            onChange={(originCityId) => setValue({ ...value, originCityId })}
            options={cityOptions}
            value={value.originCityId}
          />
          <Combobox
            label="Return to"
            onChange={(returnCityId) => setValue({ ...value, returnCityId })}
            options={cityOptions}
            value={value.returnCityId}
          />
        </div>
        <TextField
          hint="Relative to the CDN base URL."
          label="Cover image"
          onChange={(coverImage) =>
            setValue({ ...value, coverImage: coverImage || undefined })
          }
          placeholder="/Trips/my-trip-2026.jpg"
          value={value.coverImage ?? ""}
        />
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          Itinerary
          <span className="editor__badge">{value.steps.length}</span>
        </h2>
        {value.steps.length > 0 ? (
          <ol className="trip-screen__steps">
            {value.steps.map((step, index) => (
              <StepRow
                cityOptions={cityOptions}
                index={index}
                isFirst={index === 0}
                isLast={index === value.steps.length - 1}
                isOpen={openStep === index}
                key={`${step.type}-${index}`}
                onChange={(next) => replaceStep(index, next)}
                onMove={(direction) => moveStep(index, direction)}
                onRemove={() => removeStep(index)}
                onToggle={() => setOpenStep(openStep === index ? null : index)}
                step={step}
              />
            ))}
          </ol>
        ) : (
          <p className="editor-panel__hint">
            No steps yet. Add a stop for each place you stayed, and a transport
            step for each leg between them.
          </p>
        )}
        <div className="trip-screen__add">
          <button
            className="editor-button"
            onClick={() =>
              addStep({
                type: "stop",
                cityId: firstCityId,
                eDate: value.eDate,
                sDate: value.sDate,
              })
            }
            type="button"
          >
            + Stop
          </button>
          <button
            className="editor-button"
            onClick={() =>
              addStep({
                type: "transport",
                fromId: firstCityId,
                mode: "train",
                toId: firstCityId,
              })
            }
            type="button"
          >
            + Transport
          </button>
        </div>
      </section>
    </EditorForm>
  );
}

/**
 * Props for TripScreen.
 * @property {DataFile<TripJson>} file - Trip source file
 */
interface TripScreenProps {
  file: DataFile<TripJson>;
}
