import "./Fields.scss";

import { ReactNode } from "react";

/**
 * A selectable option shared by every dropdown in the editor.
 * @property {string} label - Display text
 * @property {string} value - Underlying identifier
 */
export interface Option {
  label: string;
  value: string;
}

/**
 * FieldShell component
 * Wraps a control with its label and optional hint so every field lines up.
 * @component
 * @param {FieldShellProps} props
 * @param {ReactNode} props.children - The control itself
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @returns {ReactNode} The labelled field
 */
function FieldShell({ children, hint, label }: FieldShellProps): ReactNode {
  return (
    <label className="editor-field">
      <span className="editor-field__label">{label}</span>
      {children}
      {hint ? <span className="editor-field__hint">{hint}</span> : null}
    </label>
  );
}

/**
 * Props for FieldShell.
 * @property {ReactNode} children - The control itself
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 */
interface FieldShellProps {
  children: ReactNode;
  hint?: string;
  label: string;
}

/**
 * TextField component
 * A labelled single-line text input.
 * @component
 * @param {TextFieldProps} props
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} [props.list] - Id of a datalist offering suggestions
 * @param {string} props.label - Field label
 * @param {(value: string) => void} props.onChange - Value change callback
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} props.value - Current value
 * @returns {ReactNode} The labelled input
 */
export function TextField({
  hint,
  list,
  label,
  onChange,
  placeholder,
  value,
}: TextFieldProps): ReactNode {
  return (
    <FieldShell hint={hint} label={label}>
      <input
        className="editor-field__control"
        list={list}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </FieldShell>
  );
}

/**
 * Props for TextField.
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} [list] - Id of a datalist offering suggestions
 * @property {string} label - Field label
 * @property {(value: string) => void} onChange - Value change callback
 * @property {string} [placeholder] - Placeholder text
 * @property {string} value - Current value
 */
interface TextFieldProps {
  hint?: string;
  list?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

/**
 * NumberField component
 * A labelled numeric input that reports an absent value as undefined.
 * @component
 * @param {NumberFieldProps} props
 * @param {string} props.label - Field label
 * @param {number} [props.min] - Minimum accepted value
 * @param {(value: number | undefined) => void} props.onChange - Value change callback
 * @param {string} [props.step] - Input step attribute
 * @param {number} [props.value] - Current value
 * @returns {ReactNode} The labelled input
 */
export function NumberField({
  label,
  min,
  onChange,
  step,
  value,
}: NumberFieldProps): ReactNode {
  return (
    <FieldShell label={label}>
      <input
        className="editor-field__control"
        min={min}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : undefined)
        }
        step={step}
        type="number"
        value={value ?? ""}
      />
    </FieldShell>
  );
}

/**
 * Props for NumberField.
 * @property {string} label - Field label
 * @property {number} [min] - Minimum accepted value
 * @property {(value: number | undefined) => void} onChange - Value change callback
 * @property {string} [step] - Input step attribute
 * @property {number} [value] - Current value
 */
interface NumberFieldProps {
  label: string;
  min?: number;
  onChange: (value: number | undefined) => void;
  step?: string;
  value?: number;
}

/**
 * SelectField component
 * A labelled dropdown with an optional empty choice.
 * @component
 * @param {SelectFieldProps} props
 * @param {string} [props.emptyLabel] - Label for the empty choice, omitted when absent
 * @param {string} props.label - Field label
 * @param {(value: string) => void} props.onChange - Value change callback
 * @param {Option[]} props.options - Selectable options
 * @param {string} props.value - Current value
 * @returns {ReactNode} The labelled dropdown
 */
export function SelectField({
  emptyLabel,
  label,
  onChange,
  options,
  value,
}: SelectFieldProps): ReactNode {
  return (
    <FieldShell label={label}>
      <select
        className="editor-field__control"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {emptyLabel === undefined ? null : (
          <option value="">{emptyLabel}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/**
 * Props for SelectField.
 * @property {string} [emptyLabel] - Label for the empty choice, omitted when absent
 * @property {string} label - Field label
 * @property {(value: string) => void} onChange - Value change callback
 * @property {Option[]} options - Selectable options
 * @property {string} value - Current value
 */
interface SelectFieldProps {
  emptyLabel?: string;
  label: string;
  onChange: (value: string) => void;
  options: Option[];
  value: string;
}

/**
 * MultiSelectField component
 * A labelled multiple-choice list backed by an array value.
 * @component
 * @param {MultiSelectFieldProps} props
 * @param {string} props.label - Field label
 * @param {(value: string[]) => void} props.onChange - Value change callback
 * @param {Option[]} props.options - Selectable options
 * @param {string[]} props.value - Currently selected values
 * @returns {ReactNode} The labelled list
 */
export function MultiSelectField({
  label,
  onChange,
  options,
  value,
}: MultiSelectFieldProps): ReactNode {
  return (
    <FieldShell hint="Hold Ctrl or Cmd to select several." label={label}>
      <select
        className="editor-field__control editor-field__control--list"
        multiple
        onChange={(event) =>
          onChange(
            Array.from(event.target.selectedOptions, (option) => option.value),
          )
        }
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/**
 * Props for MultiSelectField.
 * @property {string} label - Field label
 * @property {(value: string[]) => void} onChange - Value change callback
 * @property {Option[]} options - Selectable options
 * @property {string[]} value - Currently selected values
 */
interface MultiSelectFieldProps {
  label: string;
  onChange: (value: string[]) => void;
  options: Option[];
  value: string[];
}

/**
 * CheckboxField component
 * A labelled switch that clears to undefined so absent stays absent in JSON.
 * @component
 * @param {CheckboxFieldProps} props
 * @param {string} props.label - Field label
 * @param {(value: true | undefined) => void} props.onChange - Value change callback
 * @param {boolean} [props.value] - Current value
 * @returns {ReactNode} The labelled checkbox
 */
export function CheckboxField({
  label,
  onChange,
  value,
}: CheckboxFieldProps): ReactNode {
  return (
    <label className="editor-field editor-field--checkbox">
      <input
        checked={value ?? false}
        className="editor-field__checkbox"
        onChange={(event) => onChange(event.target.checked || undefined)}
        type="checkbox"
      />
      <span className="editor-field__label">{label}</span>
    </label>
  );
}

/**
 * Props for CheckboxField.
 * @property {string} label - Field label
 * @property {(value: true | undefined) => void} onChange - Value change callback
 * @property {boolean} [value] - Current value
 */
interface CheckboxFieldProps {
  label: string;
  onChange: (value: true | undefined) => void;
  value?: boolean;
}

// Native date and time controls only ever emit YYYY-MM-DD and HH:mm, so an
// unparseable date cannot be authored in the first place. Time is kept separate
// because it only exists to order several stops within one calendar day.

/**
 * DateField component
 * A labelled local date with an optional time-of-day used to order same-day stops.
 * @component
 * @param {DateFieldProps} props
 * @param {string} props.label - Field label
 * @param {(value: string | undefined) => void} props.onChange - Value change callback
 * @param {string} [props.value] - Current YYYY-MM-DD or YYYY-MM-DDTHH:mm value
 * @returns {ReactNode} The labelled date and time inputs
 */
export function DateField({
  label,
  onChange,
  value,
}: DateFieldProps): ReactNode {
  const [datePart = "", timePart = ""] = (value ?? "").split("T");

  /**
   * Recombines the date and time parts into one authored value.
   * @param {string} nextDate - Date portion
   * @param {string} nextTime - Time portion
   * @returns {void}
   */
  function emit(nextDate: string, nextTime: string): void {
    if (!nextDate) {
      onChange(undefined);
      return;
    }
    onChange(
      nextTime && nextTime !== "00:00" ? `${nextDate}T${nextTime}` : nextDate,
    );
  }
  return (
    <label className="editor-field">
      <span className="editor-field__label">{label}</span>
      <span className="editor-field__date">
        <input
          className="editor-field__control"
          onChange={(event) => emit(event.target.value, timePart)}
          type="date"
          value={datePart}
        />
        <input
          aria-label={`${label} time of day`}
          className="editor-field__control"
          onChange={(event) => emit(datePart, event.target.value)}
          type="time"
          value={timePart}
        />
      </span>
    </label>
  );
}

/**
 * Props for DateField.
 * @property {string} label - Field label
 * @property {(value: string | undefined) => void} onChange - Value change callback
 * @property {string} [value] - Current YYYY-MM-DD or YYYY-MM-DDTHH:mm value
 */
interface DateFieldProps {
  label: string;
  onChange: (value: string | undefined) => void;
  value?: string;
}

/**
 * StringListField component
 * A labelled textarea editing one entry per line.
 * @component
 * @param {StringListFieldProps} props
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @param {(value: string[]) => void} props.onChange - Value change callback
 * @param {string[]} [props.value] - Current entries
 * @returns {ReactNode} The labelled textarea
 */
export function StringListField({
  hint,
  label,
  onChange,
  value,
}: StringListFieldProps): ReactNode {
  return (
    <FieldShell hint={hint} label={label}>
      <textarea
        className="editor-field__control editor-field__control--area"
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
        rows={4}
        value={(value ?? []).join("\n")}
      />
    </FieldShell>
  );
}

/**
 * Props for StringListField.
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {(value: string[]) => void} onChange - Value change callback
 * @property {string[]} [value] - Current entries
 */
interface StringListFieldProps {
  hint?: string;
  label: string;
  onChange: (value: string[]) => void;
  value?: string[];
}
