import "./SegmentedControl.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX } from "react";

import { classNames } from "@/utils/className";

interface SegmentedControlProps<T extends string> {
  className?: string;
  options: { value: T; label: string; tooltip?: string }[];
  selected: T;
  onSelect: (value: T) => void;
  layoutId: string;
  tooltipId?: string;
}

/**
 * SegmentedControl component
 *
 * Button group for switching between related views.
 *
 * @component
 *
 * @param {SegmentedControlProps<string>} props - The segmented control props
 * @param {string} [props.className] - Additional class names
 * @param {{ value: string; label: string; tooltip?: string }[]} props.options - Selectable options
 * @param {string} props.selected - Selected option value
 * @param {(value: string) => void} props.onSelect - Selection handler
 * @param {string} props.layoutId - Framer Motion shared layout id
 * @param {string} [props.tooltipId] - Tooltip id for option descriptions
 * @returns {JSX.Element} The segmented control
 */
export function SegmentedControl<T extends string>({
  className = "",
  options,
  selected,
  onSelect,
  layoutId,
  tooltipId,
}: SegmentedControlProps<T>): JSX.Element {
  return (
    <LazyMotion features={domAnimation}>
      <div className={classNames("segmented-control", className)}>
        {options.map((option) => (
          <button
            className={classNames(
              "segmented-control__option",
              selected === option.value && "segmented-control__option--active",
            )}
            data-tooltip-content={option.tooltip}
            data-tooltip-id={option.tooltip ? tooltipId : undefined}
            key={option.value}
            onClick={() => onSelect(option.value)}
            type="button"
          >
            {selected === option.value ? (
              <m.div
                className="segmented-control__indicator"
                layoutId={layoutId}
                transition={{ duration: 0.16, ease: [0.35, 0, 0.25, 1] }}
              />
            ) : null}
            <span className="segmented-control__label">{option.label}</span>
          </button>
        ))}
      </div>
    </LazyMotion>
  );
}
