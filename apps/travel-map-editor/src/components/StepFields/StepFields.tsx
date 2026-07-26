import { TripStopJson, TripTransportJson } from "@travelmap/core";
import { ReactNode } from "react";

import { companyIds, config, photoPaths, transportModes } from "../../dataset";
import {
  CheckboxField,
  DateField,
  MultiSelectField,
  NumberField,
  Option,
  SelectField,
  TextField,
} from "../Fields/Fields";

/**
 * Lists the transport operators a fork has configured.
 * @returns {Option[]} Company options
 */
function companyOptions(): Option[] {
  return companyIds().map((id) => ({
    label: config.value.companies?.[id]?.name ?? id,
    value: id,
  }));
}

/**
 * StopFields component
 * Edits a stay in one city, including which photo manifest its gallery uses.
 * @component
 * @param {StopFieldsProps} props
 * @param {Option[]} props.cityOptions - Selectable cities
 * @param {(step: TripStopJson) => void} props.onChange - Step update callback
 * @param {TripStopJson} props.step - Current stop
 * @returns {ReactNode} The stop fields
 */
export function StopFields({
  cityOptions,
  onChange,
  step,
}: StopFieldsProps): ReactNode {
  return (
    <>
      <div className="editor-panel__row">
        <SelectField
          label="City"
          onChange={(cityId) => onChange({ ...step, cityId })}
          options={cityOptions}
          value={step.cityId}
        />
        <DateField
          label="Arrival"
          onChange={(sDate) => onChange({ ...step, sDate: sDate ?? "" })}
          value={step.sDate}
        />
        <DateField
          label="Departure"
          onChange={(eDate) => onChange({ ...step, eDate: eDate ?? "" })}
          value={step.eDate}
        />
      </div>
      <div className="editor-panel__row">
        <SelectField
          emptyLabel="No photos"
          label="Photo manifest"
          onChange={(photoPath) =>
            onChange({ ...step, photoPath: photoPath || undefined })
          }
          options={photoPaths.map((path) => ({ label: path, value: path }))}
          value={step.photoPath ?? ""}
        />
        <CheckboxField
          label="Layover"
          onChange={(isLayover) => onChange({ ...step, isLayover })}
          value={step.isLayover}
        />
      </div>
    </>
  );
}

/**
 * Props for StopFields.
 * @property {Option[]} cityOptions - Selectable cities
 * @property {(step: TripStopJson) => void} onChange - Step update callback
 * @property {TripStopJson} step - Current stop
 */
interface StopFieldsProps {
  cityOptions: Option[];
  onChange: (step: TripStopJson) => void;
  step: TripStopJson;
}

/**
 * TransportFields component
 * Edits a leg between two cities, revealing flight or ferry details only for
 * the modes that carry them.
 * @component
 * @param {TransportFieldsProps} props
 * @param {Option[]} props.cityOptions - Selectable cities
 * @param {(step: TripTransportJson) => void} props.onChange - Step update callback
 * @param {TripTransportJson} props.step - Current transport step
 * @returns {ReactNode} The transport fields
 */
export function TransportFields({
  cityOptions,
  onChange,
  step,
}: TransportFieldsProps): ReactNode {
  return (
    <>
      <div className="editor-panel__row">
        <SelectField
          label="Mode"
          onChange={(mode) =>
            onChange({ ...step, mode: mode as TripTransportJson["mode"] })
          }
          options={transportModes.map((mode) => ({ label: mode, value: mode }))}
          value={step.mode}
        />
        <SelectField
          label="From"
          onChange={(fromId) => onChange({ ...step, fromId })}
          options={cityOptions}
          value={step.fromId}
        />
        <SelectField
          label="To"
          onChange={(toId) => onChange({ ...step, toId })}
          options={cityOptions}
          value={step.toId}
        />
      </div>
      <div className="editor-panel__row">
        <DateField
          label="Departure"
          onChange={(sDate) => onChange({ ...step, sDate })}
          value={step.sDate}
        />
        <DateField
          label="Arrival"
          onChange={(eDate) => onChange({ ...step, eDate })}
          value={step.eDate}
        />
        <NumberField
          label="Distance km"
          min={0}
          onChange={(distanceInKm) => onChange({ ...step, distanceInKm })}
          step="any"
          value={step.distanceInKm}
        />
        <NumberField
          label="Duration minutes"
          min={0}
          onChange={(durationMinutes) => onChange({ ...step, durationMinutes })}
          value={step.durationMinutes}
        />
      </div>
      <div className="editor-panel__row">
        <MultiSelectField
          label="Via cities"
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
          label="Round trip"
          onChange={(roundTrip) => onChange({ ...step, roundTrip })}
          value={step.roundTrip}
        />
      </div>
      {step.mode === "plane" ? (
        <div className="editor-panel__row">
          <SelectField
            emptyLabel="No airline"
            label="Airline"
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
            label="Flight number"
            onChange={(number) =>
              onChange({
                ...step,
                flight: { ...step.flight, number: number || undefined },
              })
            }
            value={step.flight?.number ?? ""}
          />
          <TextField
            label="Cabin class"
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
          <SelectField
            emptyLabel="No ferry company"
            label="Ferry company"
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
 * @property {Option[]} cityOptions - Selectable cities
 * @property {(step: TripTransportJson) => void} onChange - Step update callback
 * @property {TripTransportJson} step - Current transport step
 */
interface TransportFieldsProps {
  cityOptions: Option[];
  onChange: (step: TripTransportJson) => void;
  step: TripTransportJson;
}
