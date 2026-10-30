import "./Button.scss";

import { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "../../lib/classNames";

/**
 * How strongly a button reads against its surface: the one action that moves
 * forward, a tinted secondary, a bare one, a plain one on a card, or one that
 * destroys something.
 */
type ButtonVariant = "primary" | "soft" | "ghost" | "neutral" | "danger";

/**
 * Properties accepted by the Button component, besides a native button's own.
 * It never submits a form: neither app posts one.
 * @property {ReactNode} children - The label, an icon, or both
 * @property {ButtonVariant} [variant] - How strongly the button reads
 * @property {boolean} [isIconOnly] - Whether the button holds only an icon, drawn round
 */
interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  children: ReactNode;
  variant?: ButtonVariant;
  isIconOnly?: boolean;
}

/**
 * Button component
 * The one button of both apps: a pill with an optional icon. Every native
 * button attribute passes through, so a disabled, autofocused, or labelled
 * button needs nothing beyond the attribute itself.
 * @component
 * @param {ButtonProps} props - The button props
 * @param {ReactNode} props.children - The label, an icon, or both
 * @param {ButtonVariant} [props.variant="neutral"] - How strongly the button reads
 * @param {boolean} [props.isIconOnly=false] - Whether the button holds only an icon
 * @param {string} [props.className] - Extra classes from the owning block
 * @returns {ReactNode} The button
 */
export function Button({
  children,
  variant = "neutral",
  isIconOnly = false,
  className,
  ...rest
}: ButtonProps): ReactNode {
  return (
    <button
      {...rest}
      className={classNames(
        "button",
        `button--${variant}`,
        isIconOnly && "button--icon",
        className,
      )}
      type="button"
    >
      {children}
    </button>
  );
}
