import "./SegmentedControl.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX } from "react";

interface SegmentedControlProps<T extends string> {
  className?: string;
  options: { value: T; label: string; tooltip?: string }[];
  selected: T;
  onSelect: (value: T) => void;
  layoutId: string;
  tooltipId?: string;
}

/**
 * SegmentedControl component.
 *
 * @component
 * @param {SegmentedControlProps<string>} props - The props of the component.
 * @param {string} props.className - The class to apply to the control.
 * @param {{ value: string; label: string }[]} props.options - The selectable options.
 * @param {string} props.selected - The selected option value.
 * @param {function} props.onSelect - The function called when selecting an option.
 * @param {string} props.layoutId - The Framer Motion shared layout id.
 * @returns {JSX.Element} The SegmentedControl component.
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
      <div className={`segmented-control ${className}`}>
        {options.map((option) => (
          <button
            className={`segmented-control__option ${selected === option.value ? "segmented-control__option--active" : ""}`}
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
