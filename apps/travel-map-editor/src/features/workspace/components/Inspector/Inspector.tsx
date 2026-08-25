import "./Inspector.scss";

import { TransportModeIcon } from "@app/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import {
  TransportMode,
  TripJson,
  TripStopJson,
  TripTransportJson,
} from "@travelmap/core";
import {
  CalendarArrowDown,
  CalendarArrowUp,
  ChevronDown,
  FilePenLine,
  Images,
  ListChecks,
  MapPinPlus,
  Route,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "react-router";

import {
  photoKeys,
  resolveLogoUrl,
  transportModes,
} from "../../../../data/dataset";
import { DatasetSnapshot } from "../../../../data/store";
import {
  Combobox,
  ComboboxOption,
  MultiCombobox,
} from "../../../../shared/components/Combobox/Combobox";
import { DatePicker } from "../../../../shared/components/DatePicker/DatePicker";
import {
  CheckboxField,
  NumberField,
  TextField,
} from "../../../../shared/components/Fields/Fields";
import { LocalizedNames } from "../../../../shared/components/LocalizedNames/LocalizedNames";
import {
  dayNumber,
  formatDayLabel,
  ItineraryDay,
} from "../../../itinerary/lib/days";
import { PhotoImportDialog } from "../../../photos/components/PhotoImportDialog/PhotoImportDialog";
import { canImportForStop } from "../../../photos/lib/photoManifest";
import { cityOptions } from "../../../places/lib/placeOptions";
import {
  formatDuration,
  suggestForLeg,
} from "../../../routes/lib/legDerivation";
import { Selection } from "../../Workspace.state";

/**
 * Lists the transport operators a fork has configured, with their logo when
 * one is set.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {ComboboxOption[]} Company options
 */
function companyOptions(dataset: DatasetSnapshot): ComboboxOption[] {
  const companies = dataset.config.value.companies ?? {};
  return Object.keys(companies)
    .sort()
    .map((id) => ({
      iconUrl: resolveLogoUrl(companies[id]?.logo),
      label: companies[id]?.name ?? id,
      value: id,
    }));
}

/**
 * Names a city for display, degrading to the raw id when the city file has
 * been deleted out from under the trip.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @param {string} cityId - The city to name
 * @returns {string} The display name
 */
function cityName(dataset: DatasetSnapshot, cityId: string): string {
  return (
    dataset.cities.find(({ value }) => value.id === cityId)?.value.name ??
    cityId
  );
}

/**
 * DerivedValue component
 * Shows a number the editor worked out beside the field it would fill, with
 * one click to accept it. Nothing derived is ever written without this click,
 * which is what makes every stored value on a leg an authored one.
 * @component
 * @param {DerivedValueProps} props
 * @param {string} props.label - What the suggestion is for
 * @param {() => void} props.onAccept - Writes the suggestion into the field
 * @param {string} props.value - The formatted suggestion
 * @returns {ReactNode} The suggestion chip
 */
function DerivedValue({
  label,
  onAccept,
  value,
}: DerivedValueProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <p className="inspector__derived">
      <span className="inspector__derived-value">
        ≈ {value} <span className="inspector__derived-label">{label}</span>
      </span>
      <button className="editor-button" onClick={onAccept} type="button">
        {t("inspector.useSuggestion")}
      </button>
    </p>
  );
}

/**
 * Props for DerivedValue.
 * @property {string} label - What the suggestion is for
 * @property {() => void} onAccept - Writes the suggestion into the field
 * @property {string} value - The formatted suggestion
 */
interface DerivedValueProps {
  label: string;
  onAccept: () => void;
  value: string;
}

/**
 * ModeSelector component
 * A labelled radio group over the seven transport modes. It is a radio group
 * rather than a dropdown because the choice is the only required decision on a
 * leg, and because arrow-key selection is faster than opening a menu.
 * @component
 * @param {ModeSelectorProps} props
 * @param {(mode: TransportMode) => void} props.onChange - Selection callback
 * @param {TransportMode} props.value - The current mode
 * @returns {ReactNode} The mode radio group
 */
function ModeSelector({ onChange, value }: ModeSelectorProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <fieldset className="inspector__modes">
      <legend className="editor-field__label">{t("stepFields.mode")}</legend>
      <div className="inspector__mode-options">
        {transportModes.map((mode) => (
          <label
            className={classNames(
              "inspector__mode",
              mode === value && "inspector__mode--selected",
            )}
            key={mode}
          >
            <input
              checked={mode === value}
              className="inspector__mode-input"
              name="transport-mode"
              onChange={() => onChange(mode)}
              type="radio"
              value={mode}
            />
            <TransportModeIcon mode={mode} />
            <span>{t(`transportMode.${mode}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Props for ModeSelector.
 * @property {(mode: TransportMode) => void} onChange - Selection callback
 * @property {TransportMode} value - The current mode
 */
interface ModeSelectorProps {
  onChange: (mode: TransportMode) => void;
  value: TransportMode;
}

/**
 * TripInspector component
 * The trip's own fields: title, translations, dates, and cover image. Origin
 * and return are shown as derived facts because the itinerary already decides
 * them.
 * @component
 * @param {TripInspectorProps} props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {(next: TripJson, isMergeable?: boolean) => void} props.onChange - Edit callback
 * @param {TripJson} props.trip - The trip being edited
 * @returns {ReactNode} The trip fields
 */
function TripInspector({
  dataset,
  onChange,
  trip,
}: TripInspectorProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const names = new Map(
    dataset.cities.map(({ value }) => [value.id, value.name] as const),
  );
  return (
    <>
      <LocalizedNames
        canonicalHint={t("trip.canonicalHint")}
        label={t("trip.titles")}
        onChange={({ name, nameByLocale }) =>
          onChange({ ...trip, title: name, titleByLocale: nameByLocale }, true)
        }
        value={{ name: trip.title, nameByLocale: trip.titleByLocale }}
      />
      <div className="inspector__row">
        <DatePicker
          label={t("trip.start")}
          onChange={(sDate) => onChange({ ...trip, sDate: sDate ?? "" })}
          value={trip.sDate}
          withTime={false}
        />
        <DatePicker
          label={t("trip.end")}
          onChange={(eDate) => onChange({ ...trip, eDate: eDate ?? "" })}
          value={trip.eDate}
          withTime={false}
        />
      </div>
      <TextField
        hint={t("trip.coverImageHint")}
        label={t("trip.coverImage")}
        onChange={(coverImage) =>
          onChange({ ...trip, coverImage: coverImage || undefined }, true)
        }
        placeholder="/Trips/my-trip-2026.jpg"
        value={trip.coverImage ?? ""}
      />
      <dl className="inspector__facts">
        <div className="inspector__fact">
          <dt>{t("trip.origin")}</dt>
          <dd>{names.get(trip.originCityId) ?? trip.originCityId}</dd>
        </div>
        <div className="inspector__fact">
          <dt>{t("trip.returnTo")}</dt>
          <dd>{names.get(trip.returnCityId) ?? trip.returnCityId}</dd>
        </div>
        <div className="inspector__fact">
          <dt>{t("inspector.mapFocus")}</dt>
          <dd>
            {trip.mapFocus
              ? `${trip.mapFocus.center[1].toFixed(2)}, ${trip.mapFocus.center[0].toFixed(2)} · ${trip.mapFocus.zoom}`
              : t("inspector.mapFocusAuto")}
          </dd>
        </div>
      </dl>
      {trip.mapFocus ? (
        <button
          className="editor-button"
          onClick={() => onChange({ ...trip, mapFocus: undefined })}
          type="button"
        >
          {t("inspector.clearMapFocus")}
        </button>
      ) : null}
    </>
  );
}

/**
 * Props for TripInspector.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {(next: TripJson, isMergeable?: boolean) => void} onChange - Edit callback
 * @property {TripJson} trip - The trip being edited
 */
interface TripInspectorProps {
  dataset: DatasetSnapshot;
  onChange: (next: TripJson, isMergeable?: boolean) => void;
  trip: TripJson;
}

/**
 * DayInspector component
 * One day of the itinerary as a unit. A day heading was already the rail's
 * organising device but selecting one used to fall through to the trip form;
 * here it becomes the place to move a whole day in time, hand its steps to the
 * bulk bar, and jump between the stops it contains.
 * @component
 * @param {DayInspectorProps} props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {ItineraryDay} props.day - The day being inspected
 * @param {(indexes: number[]) => void} props.onPickSteps - Hands steps to the bulk bar
 * @param {(index: number) => void} props.onSelectStep - Selects one step
 * @param {(indexes: number[], days: number) => void} props.onShiftSteps - Moves steps in time
 * @param {TripJson} props.trip - The trip being edited
 * @returns {ReactNode} The day fields
 */
function DayInspector({
  dataset,
  day,
  onPickSteps,
  onSelectStep,
  onShiftSteps,
  trip,
}: DayInspectorProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const stops = day.indexes.flatMap((index) => {
    const step = trip.steps[index];
    return step?.type === "stop" ? [{ index, step }] : [];
  });
  return (
    <>
      {stops.length === 0 ? (
        <p className="editor-panel__hint">{t("inspector.dayEmpty")}</p>
      ) : (
        <ol className="inspector__day-stops">
          {stops.map(({ index, step }) => (
            <li key={index}>
              <button
                className="inspector__day-stop"
                onClick={() => onSelectStep(index)}
                type="button"
              >
                <span className="inspector__day-stop-name">
                  {cityName(dataset, step.cityId)}
                </span>
                <span className="inspector__day-stop-kind">
                  {t(step.isLayover ? "trip.layover" : "trip.stay")}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="inspector__actions">
        <button
          className="editor-button"
          disabled={day.date === null}
          onClick={() => onShiftSteps(day.indexes, -1)}
          type="button"
        >
          <CalendarArrowUp aria-hidden="true" />
          {t("inspector.shiftDayEarlier")}
        </button>
        <button
          className="editor-button"
          disabled={day.date === null}
          onClick={() => onShiftSteps(day.indexes, 1)}
          type="button"
        >
          <CalendarArrowDown aria-hidden="true" />
          {t("inspector.shiftDayLater")}
        </button>
      </div>
      <button
        className="editor-button"
        onClick={() => onPickSteps(day.indexes)}
        type="button"
      >
        <ListChecks aria-hidden="true" />
        {t("inspector.selectDaySteps")}
      </button>
    </>
  );
}

/**
 * Props for DayInspector.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {ItineraryDay} day - The day being inspected
 * @property {(indexes: number[]) => void} onPickSteps - Hands steps to the bulk bar
 * @property {(index: number) => void} onSelectStep - Selects one step
 * @property {(indexes: number[], days: number) => void} onShiftSteps - Moves steps in time
 * @property {TripJson} trip - The trip being edited
 */
interface DayInspectorProps {
  dataset: DatasetSnapshot;
  day: ItineraryDay;
  onPickSteps: (indexes: number[]) => void;
  onSelectStep: (index: number) => void;
  onShiftSteps: (indexes: number[], days: number) => void;
  trip: TripJson;
}

/**
 * StopInspector component
 * One stay's fields. What the author changes on most stays — the city, the
 * dates, the photos — comes first; the two ways of continuing the itinerary
 * sit together as a pair of actions; and everything structural or
 * rendering-only stays behind a disclosure so the common case stays short.
 * @component
 * @param {StopInspectorProps} props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {boolean} props.hasPreviousStop - Whether an earlier stay exists
 * @param {() => void} props.onAddDayTrip - Opens place selection for an excursion from this stay
 * @param {() => void} props.onAddNextStop - Opens place selection after this stay
 * @param {(step: TripStopJson) => void} props.onChange - Step update callback
 * @param {() => void} props.onMergeWithPrevious - Folds this stay into the one before
 * @param {TripStopJson} props.step - The stop being edited
 * @returns {ReactNode} The stop fields
 */
function StopInspector({
  dataset,
  hasPreviousStop,
  onAddDayTrip,
  onAddNextStop,
  onChange,
  onMergeWithPrevious,
  step,
}: StopInspectorProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPhotoImportOpen, setIsPhotoImportOpen] = useState(false);
  const city = dataset.cities.find(({ value }) => value.id === step.cityId);
  return (
    <>
      <div className="inspector__city">
        <Combobox
          label={t("stepFields.city")}
          onChange={(cityId) => onChange({ ...step, cityId })}
          options={cityOptions(dataset)}
          value={step.cityId}
        />
        {city ? (
          <Link
            className="editor-inline-link inspector__city-link"
            to={`/places/cities/${city.value.id}`}
          >
            <FilePenLine aria-hidden="true" />
            {t("inspector.openCity")}
          </Link>
        ) : null}
      </div>
      <div className="inspector__row">
        <DatePicker
          label={t("stepFields.arrival")}
          onChange={(sDate) => onChange({ ...step, sDate: sDate ?? "" })}
          value={step.sDate}
        />
        <DatePicker
          label={t("stepFields.departure")}
          onChange={(eDate) => onChange({ ...step, eDate: eDate ?? "" })}
          value={step.eDate}
        />
      </div>
      <div className="inspector__photo-row">
        <Combobox
          emptyLabel={t("stepFields.noPhotos")}
          hint={t("inspector.photoManifestHint")}
          label={t("stepFields.photoManifest")}
          onChange={(photoPath) =>
            onChange({ ...step, photoPath: photoPath || undefined })
          }
          options={photoKeys(dataset).map((path) => ({
            label: path,
            value: path,
          }))}
          value={step.photoPath ?? ""}
        />
        <button
          className="editor-button inspector__photo-import"
          disabled={!canImportForStop(dataset, step)}
          onClick={() => setIsPhotoImportOpen(true)}
          type="button"
        >
          <Images aria-hidden="true" />
          {t("photoImport.open")}
        </button>
      </div>
      {isPhotoImportOpen ? (
        <PhotoImportDialog
          dataset={dataset}
          onChange={onChange}
          onClose={() => setIsPhotoImportOpen(false)}
          step={step}
        />
      ) : null}
      <CheckboxField
        label={t("stepFields.layover")}
        onChange={(isLayover) => onChange({ ...step, isLayover })}
        value={step.isLayover}
      />
      <div className="inspector__actions">
        <button
          className="editor-button editor-button--primary"
          onClick={onAddNextStop}
          type="button"
        >
          <MapPinPlus aria-hidden="true" />
          {t("inspector.addNextStop")}
        </button>
        <button className="editor-button" onClick={onAddDayTrip} type="button">
          <Route aria-hidden="true" />
          {t("inspector.addDayTrip")}
        </button>
      </div>
      <button
        aria-expanded={isExpanded}
        className="editor-button inspector__disclosure"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {t("inspector.more")}
        <ChevronDown
          aria-hidden="true"
          className={classNames(
            "inspector__disclosure-icon",
            isExpanded && "inspector__disclosure-icon--open",
          )}
        />
      </button>
      {isExpanded ? (
        <>
          {hasPreviousStop ? (
            <button
              className="editor-button"
              onClick={onMergeWithPrevious}
              type="button"
            >
              {t("inspector.mergeWithPrevious")}
            </button>
          ) : null}
          <div className="inspector__row">
            <NumberField
              hint={t("inspector.rowConstraintsHint")}
              label={t("inspector.minPhotos")}
              min={0}
              onChange={(minPhotos) =>
                onChange({
                  ...step,
                  rowConstraints: { ...step.rowConstraints, minPhotos },
                })
              }
              value={step.rowConstraints?.minPhotos}
            />
            <NumberField
              label={t("inspector.maxPhotos")}
              min={0}
              onChange={(maxPhotos) =>
                onChange({
                  ...step,
                  rowConstraints: { ...step.rowConstraints, maxPhotos },
                })
              }
              value={step.rowConstraints?.maxPhotos}
            />
            <NumberField
              label={t("inspector.targetRowHeight")}
              min={0}
              onChange={(targetRowHeight) =>
                onChange({ ...step, targetRowHeight })
              }
              value={step.targetRowHeight}
            />
          </div>
        </>
      ) : null}
    </>
  );
}

/**
 * Props for StopInspector.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {boolean} hasPreviousStop - Whether an earlier stay exists
 * @property {() => void} onAddDayTrip - Opens place selection for an excursion from this stay
 * @property {() => void} onAddNextStop - Opens place selection after this stay
 * @property {(step: TripStopJson) => void} onChange - Step update callback
 * @property {() => void} onMergeWithPrevious - Folds this stay into the one before
 * @property {TripStopJson} step - The stop being edited
 */
interface StopInspectorProps {
  dataset: DatasetSnapshot;
  hasPreviousStop: boolean;
  onAddDayTrip: () => void;
  onAddNextStop: () => void;
  onChange: (step: TripStopJson) => void;
  onMergeWithPrevious: () => void;
  step: TripStopJson;
}

/**
 * LegInspector component
 * One leg's fields. Endpoints are read-only facts derived from the stays on
 * either side; distance and duration are offered as suggestions rather than
 * prefilled, so anything stored here is something the author chose.
 * @component
 * @param {LegInspectorProps} props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {(step: TripTransportJson) => void} props.onChange - Step update callback
 * @param {TripTransportJson} props.step - The leg being edited
 * @returns {ReactNode} The leg fields
 */
function LegInspector({
  dataset,
  onChange,
  step,
}: LegInspectorProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const coordinates = new Map(
    dataset.cities.map(({ value }) => [value.id, value.coordinates] as const),
  );
  const names = new Map(
    dataset.cities.map(({ value }) => [value.id, value.name] as const),
  );
  const suggestions = suggestForLeg(step, coordinates);
  return (
    <>
      <p className="editor-panel__hint">{t("inspector.endpointsHint")}</p>
      <ModeSelector
        onChange={(mode) => onChange({ ...step, mode })}
        value={step.mode}
      />
      <div className="inspector__row">
        <DatePicker
          label={t("stepFields.departure")}
          onChange={(sDate) => onChange({ ...step, sDate })}
          value={step.sDate}
        />
        <DatePicker
          label={t("stepFields.arrival")}
          onChange={(eDate) => onChange({ ...step, eDate })}
          value={step.eDate}
        />
      </div>
      <div className="inspector__row">
        <NumberField
          label={t("stepFields.distanceKm")}
          min={0}
          onChange={(distanceInKm) => onChange({ ...step, distanceInKm })}
          step="any"
          value={step.distanceInKm}
        />
        <NumberField
          label={t("stepFields.durationMinutes")}
          min={0}
          onChange={(durationMinutes) => onChange({ ...step, durationMinutes })}
          value={step.durationMinutes}
        />
      </div>
      {suggestions.distanceInKm !== undefined &&
      step.distanceInKm === undefined ? (
        <DerivedValue
          label={t("inspector.greatCircle")}
          onAccept={() =>
            onChange({ ...step, distanceInKm: suggestions.distanceInKm })
          }
          value={`${suggestions.distanceInKm} km`}
        />
      ) : null}
      {suggestions.durationMinutes !== undefined &&
      step.durationMinutes === undefined ? (
        <DerivedValue
          label={t("inspector.forThisMode")}
          onAccept={() =>
            onChange({ ...step, durationMinutes: suggestions.durationMinutes })
          }
          value={formatDuration(suggestions.durationMinutes)}
        />
      ) : null}
      <CheckboxField
        label={t("stepFields.roundTrip")}
        onChange={(roundTrip) => onChange({ ...step, roundTrip })}
        value={step.roundTrip}
      />
      <p className="editor-panel__hint">
        {t("inspector.roundTripHint", {
          city: names.get(step.fromId) ?? step.fromId,
        })}
      </p>
      <MultiCombobox
        label={t("stepFields.viaCities")}
        onChange={(viaIds) =>
          onChange({ ...step, viaIds: viaIds.length > 0 ? viaIds : undefined })
        }
        options={cityOptions(dataset)}
        value={step.viaIds ?? []}
      />
      {step.mode === "plane" ? (
        <div className="inspector__row">
          <Combobox
            emptyLabel={t("stepFields.noAirline")}
            label={t("stepFields.airline")}
            onChange={(company) =>
              onChange({
                ...step,
                flight: { ...step.flight, company: company || undefined },
              })
            }
            options={companyOptions(dataset)}
            value={step.flight?.company ?? ""}
          />
          <TextField
            label={t("stepFields.flightNumber")}
            onChange={(number) =>
              onChange({
                ...step,
                flight: { ...step.flight, number: number || undefined },
              })
            }
            value={step.flight?.number ?? ""}
          />
          <TextField
            label={t("stepFields.cabinClass")}
            onChange={(cabinClass) =>
              onChange({
                ...step,
                flight: { ...step.flight, class: cabinClass || undefined },
              })
            }
            value={step.flight?.class ?? ""}
          />
        </div>
      ) : null}
      {step.mode === "ferry" ? (
        <Combobox
          emptyLabel={t("stepFields.noFerryCompany")}
          label={t("stepFields.ferryCompany")}
          onChange={(company) =>
            onChange({
              ...step,
              ferry: { ...step.ferry, company: company || undefined },
            })
          }
          options={companyOptions(dataset)}
          value={step.ferry?.company ?? ""}
        />
      ) : null}
    </>
  );
}

/**
 * Props for LegInspector.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {(step: TripTransportJson) => void} onChange - Step update callback
 * @property {TripTransportJson} step - The leg being edited
 */
interface LegInspectorProps {
  dataset: DatasetSnapshot;
  onChange: (step: TripTransportJson) => void;
  step: TripTransportJson;
}

/**
 * Inspector component
 * The detail pane. It renders whatever the workspace has selected and nothing
 * else, which is how the editor avoids the single long settings form the
 * previous trip screen had become. Its header names the subject rather than
 * only its kind, so the pane still answers "which stay is this" once the rail
 * has scrolled the selected row out of view.
 * @component
 * @param {InspectorProps} props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {ItineraryDay[]} props.days - The itinerary grouped into days
 * @param {(index: number) => void} props.onAddDayTrip - Opens an excursion from the selected stay
 * @param {(index: number) => void} props.onAddNextStop - Opens a destination after the selected stay
 * @param {(next: TripJson, isMergeable?: boolean) => void} props.onChange - Edit callback
 * @param {(index: number, step: TripJson["steps"][number]) => void} props.onChangeStep - Step update callback
 * @param {() => void} props.onClose - Dismisses the pane where it overlays the map
 * @param {(index: number) => void} props.onMergeWithPrevious - Folds a stay into the one before
 * @param {(indexes: number[]) => void} props.onPickSteps - Hands steps to the bulk bar
 * @param {(selection: Selection) => void} props.onSelect - Selection callback
 * @param {(indexes: number[], days: number) => void} props.onShiftSteps - Moves steps in time
 * @param {Selection} props.selection - What every pane is pointed at
 * @param {TripJson} props.trip - The trip being edited
 * @returns {ReactNode} The inspector pane
 */
export function Inspector({
  dataset,
  days,
  onAddDayTrip,
  onAddNextStop,
  onChange,
  onChangeStep,
  onClose,
  onMergeWithPrevious,
  onPickSteps,
  onSelect,
  onShiftSteps,
  selection,
  trip,
}: InspectorProps): ReactNode {
  const { currLanguage, t } = useLanguage(["editor"]);
  const stepIndex = selection.kind === "step" ? selection.index : -1;
  const step = selection.kind === "step" ? trip.steps[stepIndex] : undefined;
  const day =
    selection.kind === "day"
      ? days.find((entry) => entry.date === selection.date)
      : undefined;

  /**
   * Names the kind of thing on screen, which is what the pane used to show as
   * its only heading.
   * @returns {string} The kicker above the title
   */
  function kicker(): string {
    if (step)
      return t(step.type === "stop" ? "inspector.stop" : "inspector.leg");
    if (day)
      return day.date
        ? t("inspector.day", { number: dayNumber(days, day) })
        : t("inspector.dayUnscheduled");
    return t("inspector.trip");
  }

  /**
   * Names the specific subject on screen, so the pane is readable without the
   * rail beside it.
   * @returns {string} The pane title
   */
  function title(): string {
    if (step?.type === "stop") return cityName(dataset, step.cityId);
    if (step)
      return `${cityName(dataset, step.fromId)} ${step.roundTrip ? "↔" : "→"} ${cityName(dataset, step.toId)}`;
    if (day)
      return formatDayLabel(day.date, currLanguage) || t("rail.unscheduled");
    return trip.title || trip.id;
  }
  return (
    <aside aria-label={t("inspector.title")} className="inspector">
      <header className="inspector__header">
        <div className="inspector__identity">
          <p className="inspector__kicker">{kicker()}</p>
          <h2 className="inspector__title">{title()}</h2>
        </div>
        <button
          aria-label={t("workspace.closeDetails")}
          className="inspector__close"
          onClick={onClose}
          type="button"
        >
          <ChevronDown aria-hidden="true" />
        </button>
      </header>
      {step ? (
        step.type === "stop" ? (
          <StopInspector
            dataset={dataset}
            hasPreviousStop={trip.steps
              .slice(0, stepIndex)
              .some((candidate) => candidate.type === "stop")}
            onAddDayTrip={() => onAddDayTrip(stepIndex)}
            onAddNextStop={() => onAddNextStop(stepIndex)}
            onChange={(next) => onChangeStep(stepIndex, next)}
            onMergeWithPrevious={() => onMergeWithPrevious(stepIndex)}
            step={step}
          />
        ) : (
          <LegInspector
            dataset={dataset}
            onChange={(next) => onChangeStep(stepIndex, next)}
            step={step}
          />
        )
      ) : day ? (
        <DayInspector
          dataset={dataset}
          day={day}
          onPickSteps={onPickSteps}
          onSelectStep={(index) => onSelect({ index, kind: "step" })}
          onShiftSteps={onShiftSteps}
          trip={trip}
        />
      ) : (
        <TripInspector dataset={dataset} onChange={onChange} trip={trip} />
      )}
    </aside>
  );
}

/**
 * Props for Inspector.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {ItineraryDay[]} days - The itinerary grouped into days
 * @property {(index: number) => void} onAddDayTrip - Opens an excursion from the selected stay
 * @property {(index: number) => void} onAddNextStop - Opens a destination after the selected stay
 * @property {(next: TripJson, isMergeable?: boolean) => void} onChange - Edit callback
 * @property {(index: number, step: TripJson["steps"][number]) => void} onChangeStep - Step update callback
 * @property {() => void} onClose - Dismisses the pane where it overlays the map
 * @property {(index: number) => void} onMergeWithPrevious - Folds a stay into the one before
 * @property {(indexes: number[]) => void} onPickSteps - Hands steps to the bulk bar
 * @property {(selection: Selection) => void} onSelect - Selection callback
 * @property {(indexes: number[], days: number) => void} onShiftSteps - Moves steps in time
 * @property {Selection} selection - What every pane is pointed at
 * @property {TripJson} trip - The trip being edited
 */
interface InspectorProps {
  dataset: DatasetSnapshot;
  days: ItineraryDay[];
  onAddDayTrip: (index: number) => void;
  onAddNextStop: (index: number) => void;
  onChange: (next: TripJson, isMergeable?: boolean) => void;
  onChangeStep: (index: number, step: TripJson["steps"][number]) => void;
  onClose: () => void;
  onMergeWithPrevious: (index: number) => void;
  onPickSteps: (indexes: number[]) => void;
  onSelect: (selection: Selection) => void;
  onShiftSteps: (indexes: number[], days: number) => void;
  selection: Selection;
  trip: TripJson;
}
