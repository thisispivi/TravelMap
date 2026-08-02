import "./TripScreen.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
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
} from "../../../core/dataset";
import { findWorldCountry } from "../../../core/world";
import { TextField } from "../../atoms/Fields/Fields";
import { Combobox, ComboboxOption } from "../../molecules/Combobox/Combobox";
import { DatePicker } from "../../molecules/DatePicker/DatePicker";
import { ItineraryRow, Step } from "../../molecules/ItineraryRow/ItineraryRow";
import { LocalizedNames } from "../../molecules/LocalizedNames/LocalizedNames";
import { EditorForm } from "../../organisms/EditorForm/EditorForm";

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
 * TripScreen component
 * Edits one trip and its ordered itinerary. Dates are validated before a save
 * because an unparseable date stops the public app from loading at all.
 * @component
 * @param {TripScreenProps} props
 * @param {DataFile<TripJson>} props.file - Trip source file
 * @returns {ReactNode} The trip editor screen
 */
export function TripScreen({ file }: TripScreenProps): ReactNode {
  const { t } = useLanguage(["editor"]);
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
    ...(value.title.trim() ? [] : [t("trip.titleRequired")]),
    ...tripDateErrors(value),
    ...(cities.length === 0 ? [t("trip.needsCity")] : []),
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
      eyebrow={t("trip.eyebrow")}
      isDirty={isDirty}
      onDelete={handleDelete}
      onSave={() => writeData(tripPath(value.id), value)}
      path={file.path}
      problems={problems}
      title={file.value.title}
    >
      <LocalizedNames
        canonicalHint={t("trip.canonicalHint")}
        label={t("trip.titles")}
        onChange={({ name, nameByLocale }) =>
          setValue({ ...value, title: name, titleByLocale: nameByLocale })
        }
        value={{ name: value.title, nameByLocale: value.titleByLocale }}
      />
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("trip.details")}</h2>
        <div className="editor-panel__row">
          <DatePicker
            label={t("trip.start")}
            onChange={(sDate) => setValue({ ...value, sDate: sDate ?? "" })}
            value={value.sDate}
            withTime={false}
          />
          <DatePicker
            label={t("trip.end")}
            onChange={(eDate) => setValue({ ...value, eDate: eDate ?? "" })}
            value={value.eDate}
            withTime={false}
          />
        </div>
        <div className="editor-panel__row">
          <Combobox
            label={t("trip.origin")}
            onChange={(originCityId) => setValue({ ...value, originCityId })}
            options={cityOptions}
            value={value.originCityId}
          />
          <Combobox
            label={t("trip.returnTo")}
            onChange={(returnCityId) => setValue({ ...value, returnCityId })}
            options={cityOptions}
            value={value.returnCityId}
          />
        </div>
        <TextField
          hint={t("trip.coverImageHint")}
          label={t("trip.coverImage")}
          onChange={(coverImage) =>
            setValue({ ...value, coverImage: coverImage || undefined })
          }
          placeholder="/Trips/my-trip-2026.jpg"
          value={value.coverImage ?? ""}
        />
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("trip.itinerary")}
          <span className="editor__badge">{value.steps.length}</span>
        </h2>
        {value.steps.length > 0 ? (
          <ol className="trip-screen__steps">
            {value.steps.map((step, index) => (
              <ItineraryRow
                cityOptions={cityOptions}
                index={index}
                isFirst={index === 0}
                isLast={index === value.steps.length - 1}
                isOpen={openStep === index}
                key={`${step.type}-${index}`}
                kind={
                  step.type === "stop"
                    ? t(step.isLayover ? "trip.layover" : "trip.stay")
                    : t(`transportMode.${step.mode}`)
                }
                onChange={(next) => replaceStep(index, next)}
                onMove={(direction) => moveStep(index, direction)}
                onRemove={() => removeStep(index)}
                onToggle={() => setOpenStep(openStep === index ? null : index)}
                range={dateRange(step.sDate, step.eDate)}
                step={step}
                summary={
                  step.type === "stop"
                    ? cityName(step.cityId)
                    : `${cityName(step.fromId)} → ${cityName(step.toId)}`
                }
              />
            ))}
          </ol>
        ) : (
          <p className="editor-panel__hint">{t("trip.noSteps")}</p>
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
            {t("trip.addStop")}
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
            {t("trip.addTransport")}
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
