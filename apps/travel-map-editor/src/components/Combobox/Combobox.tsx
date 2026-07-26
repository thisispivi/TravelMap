import "./Combobox.scss";

import { classNames } from "@app/utils/className";
import { useCombobox, useMultipleSelection } from "downshift";
import Fuse, { IFuseOptions } from "fuse.js";
import { ReactNode, useMemo, useState } from "react";

/**
 * One choice in a combobox.
 * @property {string} [hint] - Secondary text shown after the label
 * @property {string} [iconUrl] - Small circular image shown before the label
 * @property {string} label - Display text
 * @property {string} value - Underlying identifier
 */
export interface ComboboxOption {
  hint?: string;
  iconUrl?: string;
  label: string;
  value: string;
}

// Matching stays deliberately permissive: every token counts, so short words
// like "san", "st", or "new" narrow a country list instead of being discarded
// as noise. Location is ignored so a match anywhere in the string ranks.
const FUSE_OPTIONS: IFuseOptions<ComboboxOption> = {
  ignoreLocation: true,
  includeScore: true,
  keys: [
    { name: "label", weight: 3 },
    { name: "hint", weight: 1 },
    { name: "value", weight: 1 },
  ],
  threshold: 0.4,
};
const MAX_VISIBLE_OPTIONS = 100;

/**
 * Ranks options against a search term, falling back to the full list when the
 * term is empty.
 * @param {Fuse<ComboboxOption>} fuse - The prepared index
 * @param {ComboboxOption[]} options - Every available option
 * @param {string} term - The current search term
 * @returns {ComboboxOption[]} The options to display
 */
function search(
  fuse: Fuse<ComboboxOption>,
  options: ComboboxOption[],
  term: string,
): ComboboxOption[] {
  if (!term.trim()) return options.slice(0, MAX_VISIBLE_OPTIONS);
  return fuse
    .search(term, { limit: MAX_VISIBLE_OPTIONS })
    .map((result) => result.item);
}

/**
 * OptionRow component
 * Renders one option's icon, label, and hint.
 * @component
 * @param {OptionRowProps} props
 * @param {ComboboxOption} props.option - The option to render
 * @returns {ReactNode} The option contents
 */
function OptionRow({ option }: OptionRowProps): ReactNode {
  return (
    <>
      {option.iconUrl ? (
        <img alt="" className="combobox__icon" src={option.iconUrl} />
      ) : null}
      <span className="combobox__option-label">{option.label}</span>
      {option.hint ? (
        <span className="combobox__option-hint">{option.hint}</span>
      ) : null}
    </>
  );
}

/**
 * Props for OptionRow.
 * @property {ComboboxOption} option - The option to render
 */
interface OptionRowProps {
  option: ComboboxOption;
}

/**
 * Combobox component
 * A searchable single-choice dropdown. Typing fuzzy-matches the options, so a
 * list of every country or city stays usable without scrolling.
 * @component
 * @param {ComboboxProps} props
 * @param {string} [props.emptyLabel] - Label for clearing the choice, omitted when absent
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @param {(value: string) => void} props.onChange - Selection callback
 * @param {ComboboxOption[]} props.options - Selectable options
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} props.value - Currently selected value
 * @returns {ReactNode} The searchable dropdown
 */
export function Combobox({
  emptyLabel,
  hint,
  label,
  onChange,
  options,
  placeholder,
  value,
}: ComboboxProps): ReactNode {
  const items = useMemo(
    () =>
      emptyLabel === undefined
        ? options
        : [{ label: emptyLabel, value: "" }, ...options],
    [emptyLabel, options],
  );
  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items]);
  const [term, setTerm] = useState("");
  const visible = useMemo(() => search(fuse, items, term), [fuse, items, term]);
  const selected = items.find((option) => option.value === value) ?? null;
  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
  } = useCombobox({
    inputValue: term,
    items: visible,
    itemToString: (option) => option?.label ?? "",
    onInputValueChange: ({ inputValue }) => setTerm(inputValue ?? ""),
    onIsOpenChange: ({ isOpen: nextIsOpen }) => {
      // The term is scratch space for searching, not the field's value, so it
      // resets whenever the menu closes.
      if (!nextIsOpen) setTerm("");
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) onChange(selectedItem.value);
      setTerm("");
    },
    selectedItem: selected,
  });
  return (
    <div className="editor-field combobox">
      <label className="editor-field__label" {...getLabelProps()}>
        {label}
      </label>
      <div className="combobox__control">
        {selected?.iconUrl && !isOpen ? (
          <img alt="" className="combobox__icon" src={selected.iconUrl} />
        ) : null}
        <input
          className="editor-field__control combobox__input"
          {...getInputProps({
            placeholder: isOpen
              ? "Type to search"
              : (selected?.label ?? placeholder ?? "Select"),
          })}
          value={isOpen ? term : (selected?.label ?? "")}
        />
        <button
          className="combobox__toggle"
          type="button"
          {...getToggleButtonProps({ "aria-label": `Open ${label} options` })}
        >
          ▾
        </button>
      </div>
      <ul
        className={classNames(
          "combobox__menu",
          !isOpen && "combobox__menu--hidden",
        )}
        {...getMenuProps()}
      >
        {isOpen
          ? visible.map((option, index) => (
              <li
                className={classNames(
                  "combobox__option",
                  highlightedIndex === index && "combobox__option--highlighted",
                  option.value === value && "combobox__option--selected",
                )}
                key={option.value}
                {...getItemProps({ index, item: option })}
              >
                <OptionRow option={option} />
              </li>
            ))
          : null}
        {isOpen && visible.length === 0 ? (
          <li className="combobox__empty">No matches</li>
        ) : null}
      </ul>
      {hint ? <span className="editor-field__hint">{hint}</span> : null}
    </div>
  );
}

/**
 * Props for Combobox.
 * @property {string} [emptyLabel] - Label for clearing the choice, omitted when absent
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {(value: string) => void} onChange - Selection callback
 * @property {ComboboxOption[]} options - Selectable options
 * @property {string} [placeholder] - Placeholder text
 * @property {string} value - Currently selected value
 */
interface ComboboxProps {
  emptyLabel?: string;
  hint?: string;
  label: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  value: string;
}

/**
 * MultiCombobox component
 * A searchable multiple-choice field. Choices become removable chips, which
 * keeps a long selection readable where a multi-select list would not.
 * @component
 * @param {MultiComboboxProps} props
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @param {(value: string[]) => void} props.onChange - Selection callback
 * @param {ComboboxOption[]} props.options - Selectable options
 * @param {string[]} props.value - Currently selected values
 * @returns {ReactNode} The searchable multi-select
 */
export function MultiCombobox({
  hint,
  label,
  onChange,
  options,
  value,
}: MultiComboboxProps): ReactNode {
  const [term, setTerm] = useState("");
  const selectedItems = useMemo(
    () =>
      value
        .map((entry) => options.find((option) => option.value === entry))
        .filter((option): option is ComboboxOption => option !== undefined),
    [options, value],
  );
  const available = useMemo(
    () => options.filter((option) => !value.includes(option.value)),
    [options, value],
  );
  const fuse = useMemo(() => new Fuse(available, FUSE_OPTIONS), [available]);
  const visible = useMemo(
    () => search(fuse, available, term),
    [available, fuse, term],
  );
  const { getDropdownProps, getSelectedItemProps, removeSelectedItem } =
    useMultipleSelection({
      onStateChange: ({ selectedItems: next, type }) => {
        if (
          type ===
            useMultipleSelection.stateChangeTypes
              .SelectedItemKeyDownBackspace ||
          type ===
            useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete ||
          type ===
            useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace ||
          type ===
            useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem
        )
          onChange((next ?? []).map((option) => option.value));
      },
      selectedItems,
    });
  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    isOpen,
  } = useCombobox({
    inputValue: term,
    items: visible,
    itemToString: (option) => option?.label ?? "",
    onInputValueChange: ({ inputValue }) => setTerm(inputValue ?? ""),
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;
      onChange([...value, selectedItem.value]);
      setTerm("");
    },
    selectedItem: null,
    stateReducer: (_state, { changes, type }) =>
      // Keep the menu open so several choices can be added in one pass.
      type === useCombobox.stateChangeTypes.ItemClick ||
      type === useCombobox.stateChangeTypes.InputKeyDownEnter
        ? { ...changes, highlightedIndex: 0, isOpen: true }
        : changes,
  });
  return (
    <div className="editor-field combobox">
      <label className="editor-field__label" {...getLabelProps()}>
        {label}
      </label>
      {selectedItems.length > 0 ? (
        <ul className="combobox__chips">
          {selectedItems.map((option, index) => (
            <li
              className="combobox__chip"
              key={option.value}
              {...getSelectedItemProps({ index, selectedItem: option })}
            >
              {option.iconUrl ? (
                <img alt="" className="combobox__icon" src={option.iconUrl} />
              ) : null}
              {option.label}
              <button
                aria-label={`Remove ${option.label}`}
                className="combobox__chip-remove"
                onClick={() => {
                  removeSelectedItem(option);
                  onChange(value.filter((entry) => entry !== option.value));
                }}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="combobox__control">
        <input
          className="editor-field__control combobox__input"
          {...getInputProps(
            getDropdownProps({
              placeholder: "Type to search",
              preventKeyAction: isOpen,
            }),
          )}
        />
      </div>
      <ul
        className={classNames(
          "combobox__menu",
          !isOpen && "combobox__menu--hidden",
        )}
        {...getMenuProps()}
      >
        {isOpen
          ? visible.map((option, index) => (
              <li
                className={classNames(
                  "combobox__option",
                  highlightedIndex === index && "combobox__option--highlighted",
                )}
                key={option.value}
                {...getItemProps({ index, item: option })}
              >
                <OptionRow option={option} />
              </li>
            ))
          : null}
        {isOpen && visible.length === 0 ? (
          <li className="combobox__empty">No matches</li>
        ) : null}
      </ul>
      {hint ? <span className="editor-field__hint">{hint}</span> : null}
    </div>
  );
}

/**
 * Props for MultiCombobox.
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {(value: string[]) => void} onChange - Selection callback
 * @property {ComboboxOption[]} options - Selectable options
 * @property {string[]} value - Currently selected values
 */
interface MultiComboboxProps {
  hint?: string;
  label: string;
  onChange: (value: string[]) => void;
  options: ComboboxOption[];
  value: string[];
}
