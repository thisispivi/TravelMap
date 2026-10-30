import "./Button.scss";

import { classNames } from "@travelmap/ui/lib/classNames";
import { ReactNode } from "react";

/** How strongly a button reads against its surface. */
type ButtonVariant = "primary" | "soft" | "ghost";

/**
 * Properties accepted by the Button component.
 * @property {ReactNode} children - The label, an icon, or both
 * @property {() => void} onClick - Runs when the button is activated
 * @property {ButtonVariant} [variant] - How strongly the button reads
 * @property {string} [ariaLabel] - The accessible name, required for icon-only buttons
 * @property {boolean} [isIconOnly] - Whether the button holds only an icon, drawn round
 * @property {string} [className] - Extra classes from the owning block
 */
interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  ariaLabel?: string;
  isIconOnly?: boolean;
  className?: string;
}

/**
 * Button component
 * The app's one button: a pill with an optional icon, in three strengths.
 * Press feedback is CSS, so it costs nothing until it is used.
 * @component
 * @param {ButtonProps} props - The button props
 * @param {ReactNode} props.children - The label, an icon, or both
 * @param {() => void} props.onClick - Runs when the button is activated
 * @param {ButtonVariant} [props.variant="soft"] - How strongly the button reads
 * @param {string} [props.ariaLabel] - The accessible name, required for icon-only buttons
 * @param {boolean} [props.isIconOnly=false] - Whether the button holds only an icon
 * @param {string} [props.className] - Extra classes from the owning block
 * @returns {ReactNode} The button
 */
export function Button({
  children,
  onClick,
  variant = "soft",
  ariaLabel,
  isIconOnly = false,
  className,
}: ButtonProps): ReactNode {
  return (
    <button
      aria-label={ariaLabel}
      className={classNames(
        "button",
        `button--${variant}`,
        isIconOnly && "button--icon",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
