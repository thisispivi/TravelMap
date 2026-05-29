import { JSX } from "react";

interface CheckboxProps {
  isChecked: boolean;
}

/**
 * Checkbox component
 *
 * SVG checkbox icon that switches between checked and unchecked states.
 *
 * @component
 *
 * @param {CheckboxProps} props - The checkbox props
 * @param {boolean} props.isChecked - Whether the checkbox is in the checked state
 * @returns {JSX.Element} The checkbox icon
 */
export function Checkbox({ isChecked }: CheckboxProps): JSX.Element {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={
          isChecked
            ? "M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
            : "M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}
