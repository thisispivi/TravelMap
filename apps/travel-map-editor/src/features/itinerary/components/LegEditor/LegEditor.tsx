import "./LegEditor.scss";

import { TransportModeIcon } from "@app/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { formatDuration } from "@app/shared/lib/format";
import {
  CityJson,
  resolveLegDistance,
  resolveLegDuration,
  TransportMode,
  TripLegJson,
} from "@travelmap/core";
import { ChevronDown, Trash2 } from "lucide-react";
import { ReactNode } from "react";

import { resolveLogoUrl, transportModes } from "../../../../data/dataset";
import { DatasetSnapshot } from "../../../../data/store";
import {
  Combobox,
  ComboboxOption,
  MultiCombobox,
} from "../../../../shared/components/Combobox/Combobox";
import { useConfirm } from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { DatePicker } from "../../../../shared/components/DatePicker/DatePicker";
import {
  CheckboxField,
  NumberField,
  TextField,
} from "../../../../shared/components/Fields/Fields";
import { PhotosField } from "../../../photos/components/PhotosField/PhotosField";
import { cityOptions } from "../../../places/lib/placeOptions";

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
 * Properties accepted by the ModeSelector component.
 * @property {(mode: TransportMode) => void} onChange - Selection callback
 * @property {TransportMode} value - The current mode
 */
interface ModeSelectorProps {
  onChange: (mode: TransportMode) => void;
  value: TransportMode;
}

/**
 * ModeSelector component
 * A labelled radio group over the transport modes. A radio group rather than a
 * dropdown because the mode is the one decision every ride needs, and seeing
 * all seven at once is faster than opening a menu.
 * @component
 * @param {ModeSelectorProps} props - The selector props
 * @param {(mode: TransportMode) => void} props.onChange - Selection callback
 * @param {TransportMode} props.value - The current mode
 * @returns {ReactNode} The mode radio group
 */
function ModeSelector({ onChange, value }: ModeSelectorProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <fieldset className="leg-editor__modes">
      <legend className="editor-field__label">{t("story.how")}</legend>
      <div className="leg-editor__mode-options">
        {transportModes.map((mode) => (
          <label
            className={classNames(
              "leg-editor__mode",
              mode === value && "leg-editor__mode--selected",
            )}
            key={mode}
          >
            <input
              checked={mode === value}
              className="leg-editor__mode-input"
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
 * Properties accepted by the LegEditor component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {TripLegJson} leg - The ride being edited
 * @property {string} fromId - Where the ride departs, worked out from the chain
 * @property {string} date - The day the ride happened, best known
 * @property {boolean} isDayTrip - Whether the ride belongs to a day trip
 * @property {boolean} isReturn - Whether it is a day trip's ride back, whose destination is fixed
 * @property {boolean} isOpen - Whether the full form is showing
 * @property {() => void} onToggle - Opens or closes the form
 * @property {(leg: TripLegJson) => void} onChange - Edit callback
 * @property {() => void} onRemove - Removes the ride
 */
interface LegEditorProps {
  dataset: DatasetSnapshot;
  leg: TripLegJson;
  fromId: string;
  date: string;
  isDayTrip: boolean;
  isReturn: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (leg: TripLegJson) => void;
  onRemove: () => void;
}

/**
 * LegEditor component
 * One ride as a single readable line — mode, from → to, time, distance — that
 * opens into its form. Distance and time show what the public site will show,
 * marked "about" when worked out rather than typed, so the author sees the
 * consequence of leaving a field empty.
 * @component
 * @param {LegEditorProps} props - The editor props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {TripLegJson} props.leg - The ride being edited
 * @param {string} props.fromId - Where the ride departs
 * @param {string} props.date - The day the ride happened, best known
 * @param {boolean} props.isDayTrip - Whether the ride belongs to a day trip
 * @param {boolean} props.isReturn - Whether it is a day trip's ride back
 * @param {boolean} props.isOpen - Whether the full form is showing
 * @param {() => void} props.onToggle - Opens or closes the form
 * @param {(leg: TripLegJson) => void} props.onChange - Edit callback
 * @param {() => void} props.onRemove - Removes the ride
 * @returns {ReactNode} The ride row and its form
 */
export function LegEditor({
  dataset,
  leg,
  fromId,
  date,
  isDayTrip,
  isReturn,
  isOpen,
  onToggle,
  onChange,
  onRemove,
}: LegEditorProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { confirm, confirmDialog } = useConfirm();
  const cities = new Map(
    dataset.cities.map(({ value }) => [value.id, value] as const),
  );
  const from: CityJson | undefined = cities.get(fromId);
  const to: CityJson | undefined = cities.get(leg.toId);
  const via = (leg.viaIds ?? []).flatMap((id) => cities.get(id) ?? []);
  const distance =
    from && to
      ? resolveLegDistance(
          leg,
          [from, ...via, to].map((city) => city.coordinates),
        )
      : undefined;
  const duration =
    distance && from && to
      ? resolveLegDuration(leg, distance.value, from.timeZone, to.timeZone)
      : undefined;
  const about = `${t("story.about")} `;
  const summary = [
    leg.depart?.includes("T") ? leg.depart.slice(11) : null,
    duration
      ? `${duration.estimated ? about : ""}${formatDuration(duration.value)}`
      : null,
    distance
      ? `${distance.estimated ? about : ""}${Math.round(distance.value)} km`
      : null,
  ].filter(Boolean);

  return (
    <li
      className={classNames(
        "leg-editor",
        isOpen && "leg-editor--open",
        `leg-editor--${leg.mode}`,
      )}
    >
      <button
        aria-expanded={isOpen}
        className="leg-editor__summary"
        onClick={onToggle}
        type="button"
      >
        <TransportModeIcon className="leg-editor__icon" mode={leg.mode} />
        <span className="leg-editor__route">
          {isReturn
            ? t("story.backTo", { city: to?.name ?? leg.toId })
            : `${from?.name ?? fromId} → ${to?.name ?? leg.toId}`}
          {leg.visited || (isDayTrip && !isReturn) ? (
            <span className="leg-editor__badge">{t("story.visited")}</span>
          ) : null}
        </span>
        <span className="leg-editor__meta">{summary.join(" · ")}</span>
        <ChevronDown aria-hidden="true" className="leg-editor__chevron" />
      </button>
      {confirmDialog}
      {isOpen ? (
        <div className="leg-editor__form">
          <ModeSelector
            onChange={(mode) => onChange({ ...leg, mode })}
            value={leg.mode}
          />
          {isReturn ? null : (
            <Combobox
              label={t("story.goingTo")}
              onChange={(toId) => onChange({ ...leg, toId })}
              options={cityOptions(dataset)}
              value={leg.toId}
            />
          )}
          <div className="leg-editor__row">
            <DatePicker
              hint={
                from ? t("story.localTime", { zone: from.timeZone }) : undefined
              }
              label={t("story.departs")}
              onChange={(depart) => onChange({ ...leg, depart })}
              value={leg.depart}
            />
            <DatePicker
              hint={
                to ? t("story.localTime", { zone: to.timeZone }) : undefined
              }
              label={t("story.arrives")}
              onChange={(arrive) => onChange({ ...leg, arrive })}
              value={leg.arrive}
            />
          </div>
          <div className="leg-editor__row">
            <NumberField
              hint={
                distance?.estimated
                  ? t("story.estimatedHint", { value: `${distance.value} km` })
                  : undefined
              }
              label={t("stepFields.distanceKm")}
              min={0}
              onChange={(distanceInKm) => onChange({ ...leg, distanceInKm })}
              step="any"
              value={leg.distanceInKm}
            />
            <NumberField
              hint={
                duration?.estimated
                  ? t("story.estimatedHint", {
                      value: formatDuration(duration.value),
                    })
                  : undefined
              }
              label={t("stepFields.durationMinutes")}
              min={0}
              onChange={(durationMinutes) =>
                onChange({ ...leg, durationMinutes })
              }
              value={leg.durationMinutes}
            />
          </div>
          {isDayTrip || isReturn ? null : (
            <CheckboxField
              label={t("story.visitedLabel")}
              onChange={(visited) => onChange({ ...leg, visited })}
              value={leg.visited}
            />
          )}
          {isReturn ? null : (
            <PhotosField
              dataset={dataset}
              onChange={(photoPath) => onChange({ ...leg, photoPath })}
              photoPath={leg.photoPath}
              visit={{ cityId: leg.toId, eDate: date, sDate: date }}
            />
          )}
          <MultiCombobox
            label={t("stepFields.viaCities")}
            onChange={(viaIds) =>
              onChange({
                ...leg,
                viaIds: viaIds.length > 0 ? viaIds : undefined,
              })
            }
            options={cityOptions(dataset)}
            value={leg.viaIds ?? []}
          />
          {leg.mode === "plane" ? (
            <div className="leg-editor__row">
              <Combobox
                emptyLabel={t("stepFields.noAirline")}
                label={t("stepFields.airline")}
                onChange={(company) =>
                  onChange({
                    ...leg,
                    flight: { ...leg.flight, company: company || undefined },
                  })
                }
                options={companyOptions(dataset)}
                value={leg.flight?.company ?? ""}
              />
              <TextField
                label={t("stepFields.flightNumber")}
                onChange={(number) =>
                  onChange({
                    ...leg,
                    flight: { ...leg.flight, number: number || undefined },
                  })
                }
                value={leg.flight?.number ?? ""}
              />
              <TextField
                label={t("stepFields.cabinClass")}
                onChange={(cabinClass) =>
                  onChange({
                    ...leg,
                    flight: { ...leg.flight, class: cabinClass || undefined },
                  })
                }
                value={leg.flight?.class ?? ""}
              />
            </div>
          ) : null}
          {leg.mode === "ferry" ? (
            <Combobox
              emptyLabel={t("stepFields.noFerryCompany")}
              label={t("stepFields.ferryCompany")}
              onChange={(company) =>
                onChange({
                  ...leg,
                  ferry: { ...leg.ferry, company: company || undefined },
                })
              }
              options={companyOptions(dataset)}
              value={leg.ferry?.company ?? ""}
            />
          ) : null}
          <button
            className="editor-button editor-button--danger leg-editor__remove"
            onClick={() =>
              confirm({
                confirmLabel: t("confirm.removeRide.action"),
                isDanger: true,
                message: t("confirm.removeRide.message"),
                onConfirm: onRemove,
                title: t("confirm.removeRide.title", {
                  from: from?.name ?? fromId,
                  to: to?.name ?? leg.toId,
                }),
              })
            }
            type="button"
          >
            <Trash2 aria-hidden="true" />
            {t("story.removeRide")}
          </button>
        </div>
      ) : null}
    </li>
  );
}
