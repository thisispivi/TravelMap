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
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @param {number} [props.min] - Minimum accepted value
 * @param {(value: number | undefined) => void} props.onChange - Value change callback
 * @param {string} [props.step] - Input step attribute
 * @param {number} [props.value] - Current value
 * @returns {ReactNode} The labelled input
 */
export function NumberField({
  hint,
  label,
  min,
  onChange,
  step,
  value,
}: NumberFieldProps): ReactNode {
  return (
    <FieldShell hint={hint} label={label}>
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
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {number} [min] - Minimum accepted value
 * @property {(value: number | undefined) => void} onChange - Value change callback
 * @property {string} [step] - Input step attribute
 * @property {number} [value] - Current value
 */
interface NumberFieldProps {
  hint?: string;
  label: string;
  min?: number;
  onChange: (value: number | undefined) => void;
  step?: string;
  value?: number;
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
