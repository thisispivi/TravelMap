import "./TripScreen.scss";

import PositionIcon from "@app/assets/icons/Position.svg?react";
import { TransportModeIcon } from "@app/components/atoms/TransportModeIcon/TransportModeIcon";
import { TripJson } from "@travelmap/core";
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
import { EditorForm } from "../../EditorForm/EditorForm";
import { DateField, Option, SelectField, TextField } from "../../Fields/Fields";
import { LocalizedNames } from "../../LocalizedNames/LocalizedNames";
import { StopFields, TransportFields } from "../../StepFields/StepFields";

/**
 * One ordered itinerary entry, either a stay or a leg between two cities.
 */
type Step = TripJson["steps"][number];

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
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const cityOptions: Option[] = cities.map(({ value: city }) => ({
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
   * Appends a step to the end of the itinerary.
   * @param {Step} step - Step to append
   * @returns {void}
   */
  function addStep(step: Step): void {
    setValue((current) => ({ ...current, steps: [...current.steps, step] }));
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
   * Moves a step one position within the itinerary.
   * @param {number} index - Current position
   * @param {-1 | 1} direction - Move direction
   * @returns {void}
   */
  function moveStep(index: number, direction: -1 | 1): void {
    setValue((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.steps.length) return current;
      const steps = [...current.steps];
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...current, steps };
    });
  }

  /**
   * Removes a step from the itinerary.
   * @param {number} index - Step position
   * @returns {void}
   */
  function removeStep(index: number): void {
    setValue((current) => ({
      ...current,
      steps: current.steps.filter((_, currentIndex) => currentIndex !== index),
    }));
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
          <DateField
            label="Start"
            onChange={(sDate) => setValue({ ...value, sDate: sDate ?? "" })}
            value={value.sDate}
          />
          <DateField
            label="End"
            onChange={(eDate) => setValue({ ...value, eDate: eDate ?? "" })}
            value={value.eDate}
          />
        </div>
        <div className="editor-panel__row">
          <SelectField
            label="Origin"
            onChange={(originCityId) => setValue({ ...value, originCityId })}
            options={cityOptions}
            value={value.originCityId}
          />
          <SelectField
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
        <ol className="trip-screen__steps">
          {value.steps.map((step, index) => (
            <li className="trip-screen__step" key={`${step.type}-${index}`}>
              <header className="trip-screen__step-header">
                <span className="trip-screen__step-icon">
                  {step.type === "stop" ? (
                    <PositionIcon aria-hidden="true" />
                  ) : (
                    <TransportModeIcon mode={step.mode} />
                  )}
                </span>
                <span className="trip-screen__step-title">
                  {index + 1}. {step.type === "stop" ? "Stop" : step.mode}
                </span>
                <button
                  aria-label={`Move step ${index + 1} earlier`}
                  className="editor-button trip-screen__step-action"
                  disabled={index === 0}
                  onClick={() => moveStep(index, -1)}
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label={`Move step ${index + 1} later`}
                  className="editor-button trip-screen__step-action"
                  disabled={index === value.steps.length - 1}
                  onClick={() => moveStep(index, 1)}
                  type="button"
                >
                  ↓
                </button>
                <button
                  aria-label={`Remove step ${index + 1}`}
                  className="editor-button trip-screen__step-action"
                  onClick={() => removeStep(index)}
                  type="button"
                >
                  Remove
                </button>
              </header>
              {step.type === "stop" ? (
                <StopFields
                  cityOptions={cityOptions}
                  onChange={(next) => replaceStep(index, next)}
                  step={step}
                />
              ) : (
                <TransportFields
                  cityOptions={cityOptions}
                  onChange={(next) => replaceStep(index, next)}
                  step={step}
                />
              )}
            </li>
          ))}
        </ol>
        {value.steps.length === 0 ? (
          <p className="editor-panel__hint">
            No steps yet. Add a stop for each place you stayed, and a transport
            step for each leg between them.
          </p>
        ) : null}
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
            Add stop
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
            Add transport
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
