import "./Button.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { MouseEventHandler, PropsWithChildren, ReactNode } from "react";

export interface ButtonProps extends PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  ariaLabel?: string;
  tooltipId?: string;
  tooltipContent?: string;
  hoverScale?: number;
  tapScale?: number;
}

/**
 * Button component
 *
 * Shared animated button primitive used for icon and text actions.
 *
 * @component
 *
 * @param {ButtonProps} props - The button props
 * @param {string} [props.className] - Additional class names
 * @param {MouseEventHandler} [props.onClick] - Click handler
 * @param {MouseEventHandler} [props.onMouseEnter] - Mouse enter handler
 * @param {MouseEventHandler} [props.onMouseLeave] - Mouse leave handler
 * @param {string} [props.ariaLabel] - Accessible label
 * @param {string} [props.tooltipId] - Tooltip id to attach to
 * @param {string} [props.tooltipContent] - Tooltip content
 * @param {number} [props.hoverScale] - Framer Motion hover scale
 * @param {number} [props.tapScale] - Framer Motion tap scale
 * @param {React.ReactNode} props.children - Button content
 * @returns {ReactNode} The button
 */
export function Button({
  onClick,
  className = "",
  children,
  ariaLabel,
  tooltipContent,
  tooltipId,
  onMouseEnter,
  onMouseLeave,
  hoverScale = 1.08,
  tapScale = 0.95,
}: ButtonProps): ReactNode {
  return (
    <LazyMotion features={domAnimation}>
      <m.button
        aria-label={ariaLabel}
        className={`button ${className}`}
        data-tooltip-content={tooltipContent}
        data-tooltip-id={tooltipId}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        type="button"
        whileHover={hoverScale !== 1 ? { scale: hoverScale } : undefined}
        whileTap={tapScale !== 1 ? { scale: tapScale } : undefined}
      >
        {children}
      </m.button>
    </LazyMotion>
  );
}
