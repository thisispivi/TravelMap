import "./SegmentedControl.scss";

import { m } from "framer-motion";
import { ReactNode } from "react";

import { classNames } from "@/shared/lib/classNames";
import { panelSpring } from "@/shared/lib/motion";

/**
 * One choice in a segmented control.
 * @property {T} value - The value the choice selects
 * @property {string} label - The visible label
 */
interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Properties accepted by the SegmentedControl component.
 * @property {string} id - Unique per control on screen; scopes the sliding indicator
 * @property {SegmentedOption<T>[]} options - The choices, in order
 * @property {T} value - The selected value
 * @property {(value: T) => void} onChange - Selects a value
 * @property {string} label - The accessible name of the group
 */
interface SegmentedControlProps<T extends string> {
  id: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/**
 * SegmentedControl component
 * A row of mutually exclusive choices whose highlight slides to the selected
 * one. Needs a `LazyMotion` ancestor, which the shell provides.
 * @component
 * @param {SegmentedControlProps<T>} props - The control props
 * @param {string} props.id - Unique per control on screen
 * @param {SegmentedOption<T>[]} props.options - The choices, in order
 * @param {T} props.value - The selected value
 * @param {(value: T) => void} props.onChange - Selects a value
 * @param {string} props.label - The accessible name of the group
 * @returns {ReactNode} The segmented control
 */
export function SegmentedControl<T extends string>({
  id,
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>): ReactNode {
  return (
    <div aria-label={label} className="segmented-control" role="radiogroup">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            aria-checked={isActive}
            className={classNames(
              "segmented-control__option",
              isActive && "segmented-control__option--active",
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            role="radio"
            type="button"
          >
            {isActive ? (
              <m.span
                className="segmented-control__indicator"
                layoutId={`segmented-${id}`}
                transition={panelSpring}
              />
            ) : null}
            <span className="segmented-control__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
