import "./Backdrop.scss";

import { JSX } from "react";

import { classNames } from "@/utils/className";
import { isActivationKey } from "@/utils/keyboard";

interface BackdropProps {
  onClick?: () => void;
  isVisible?: boolean;
  className?: string;
}

/**
 * Backdrop component
 *
 * Clickable overlay used behind modal and panel content.
 *
 * @component
 *
 * @param {BackdropProps} props - The backdrop props
 * @param {() => void} [props.onClick] - Click handler
 * @param {boolean} [props.isVisible] - Whether the backdrop is visible
 * @param {string} [props.className] - Additional class names
 * @returns {JSX.Element} The backdrop
 */
export function Backdrop({
  onClick,
  isVisible = true,
  className = "",
}: BackdropProps): JSX.Element {
  return (
    <div
      className={classNames(
        "backdrop",
        isVisible && "backdrop--visible",
        className,
      )}
      {...(onClick
        ? {
            onClick,
            onKeyDown: (event) => isActivationKey(event) && onClick(),
            role: "button" as const,
            tabIndex: 0,
          }
        : {})}
    />
  );
}
