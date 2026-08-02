import { TransportModeIcon } from "@app/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { TripStopJson, TripTransportJson } from "@travelmap/core";
import { ReactNode } from "react";

import {
  companyIds,
  config,
  photoPaths,
  resolveLogoUrl,
  transportModes,
} from "../../../core/dataset";
import {
  CheckboxField,
  NumberField,
  TextField,
} from "../../atoms/Fields/Fields";
import { Combobox, ComboboxOption, MultiCombobox } from "../Combobox/Combobox";
import { DatePicker } from "../DatePicker/DatePicker";

/**
 * Lists the transport operators a fork has configured, with their logo when
 * one is set.
 * @returns {ComboboxOption[]} Company options
 */
function companyOptions(): ComboboxOption[] {
  return companyIds().map((id) => ({
    iconUrl: resolveLogoUrl(config.value.companies?.[id]?.logo),
    label: config.value.companies?.[id]?.name ?? id,
    value: id,
  }));
}

/**
 * StopFields component
 * Edits a stay in one city, including which photo manifest its gallery uses.
 * @component
 * @param {StopFieldsProps} props
 * @param {ComboboxOption[]} props.cityOptions - Selectable cities
 * @param {(step: TripStopJson) => void} props.onChange - Step update callback
 * @param {TripStopJson} props.step - Current stop
 * @returns {ReactNode} The stop fields
 */
export function StopFields({
  cityOptions,
  onChange,
  step,
}: StopFieldsProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <>
      <div className="editor-panel__row">
        <Combobox
          label={t("stepFields.city")}
          onChange={(cityId) => onChange({ ...step, cityId })}
          options={cityOptions}
          value={step.cityId}
        />
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
      <div className="editor-panel__row">
        <Combobox
          emptyLabel={t("stepFields.noPhotos")}
          label={t("stepFields.photoManifest")}
          onChange={(photoPath) =>
            onChange({ ...step, photoPath: photoPath || undefined })
          }
          options={photoPaths.map((path) => ({ label: path, value: path }))}
          value={step.photoPath ?? ""}
        />
        <CheckboxField
          label={t("stepFields.layover")}
          onChange={(isLayover) => onChange({ ...step, isLayover })}
          value={step.isLayover}
        />
      </div>
    </>
  );
}

/**
 * Props for StopFields.
 * @property {ComboboxOption[]} cityOptions - Selectable cities
 * @property {(step: TripStopJson) => void} onChange - Step update callback
 * @property {TripStopJson} step - Current stop
 */
interface StopFieldsProps {
  cityOptions: ComboboxOption[];
  onChange: (step: TripStopJson) => void;
  step: TripStopJson;
}

/**
 * TransportFields component
 * Edits a leg between two cities, revealing flight or ferry details only for
 * the modes that carry them.
 * @component
 * @param {TransportFieldsProps} props
 * @param {ComboboxOption[]} props.cityOptions - Selectable cities
 * @param {(step: TripTransportJson) => void} props.onChange - Step update callback
 * @param {TripTransportJson} props.step - Current transport step
 * @returns {ReactNode} The transport fields
 */
export function TransportFields({
  cityOptions,
  onChange,
  step,
}: TransportFieldsProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const modeOptions: ComboboxOption[] = transportModes.map((mode) => ({
    icon: <TransportModeIcon mode={mode} />,
    label: t(`transportMode.${mode}`),
    value: mode,
  }));
  return (
    <>
      <div className="editor-panel__row">
        <Combobox
          label={t("stepFields.mode")}
          onChange={(mode) =>
            onChange({ ...step, mode: mode as TripTransportJson["mode"] })
          }
          options={modeOptions}
          value={step.mode}
        />
        <Combobox
          label={t("stepFields.from")}
          onChange={(fromId) => onChange({ ...step, fromId })}
          options={cityOptions}
          value={step.fromId}
        />
        <Combobox
          label={t("stepFields.to")}
          onChange={(toId) => onChange({ ...step, toId })}
          options={cityOptions}
          value={step.toId}
        />
      </div>
      <div className="editor-panel__row">
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
      <div className="editor-panel__row">
        <MultiCombobox
          label={t("stepFields.viaCities")}
          onChange={(viaIds) =>
            onChange({
              ...step,
              viaIds: viaIds.length > 0 ? viaIds : undefined,
            })
          }
          options={cityOptions}
          value={step.viaIds ?? []}
        />
        <CheckboxField
          label={t("stepFields.roundTrip")}
          onChange={(roundTrip) => onChange({ ...step, roundTrip })}
          value={step.roundTrip}
        />
      </div>
      {step.mode === "plane" ? (
        <div className="editor-panel__row">
          <Combobox
            emptyLabel={t("stepFields.noAirline")}
            label={t("stepFields.airline")}
            onChange={(company) =>
              onChange({
                ...step,
                flight: { ...step.flight, company: company || undefined },
              })
            }
            options={companyOptions()}
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
        <div className="editor-panel__row">
          <Combobox
            emptyLabel={t("stepFields.noFerryCompany")}
            label={t("stepFields.ferryCompany")}
            onChange={(company) =>
              onChange({
                ...step,
                ferry: { ...step.ferry, company: company || undefined },
              })
            }
            options={companyOptions()}
            value={step.ferry?.company ?? ""}
          />
        </div>
      ) : null}
    </>
  );
}

/**
 * Props for TransportFields.
 * @property {ComboboxOption[]} cityOptions - Selectable cities
 * @property {(step: TripTransportJson) => void} onChange - Step update callback
 * @property {TripTransportJson} step - Current transport step
 */
interface TransportFieldsProps {
  cityOptions: ComboboxOption[];
  onChange: (step: TripTransportJson) => void;
  step: TripTransportJson;
}
