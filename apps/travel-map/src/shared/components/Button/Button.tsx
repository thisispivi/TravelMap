import "./Button.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { MouseEventHandler, ReactNode } from "react";

/**
 * Props for the shared animated button.
 * @property {string} [className] - Additional class names
 * @property {MouseEventHandler} [onClick] - Click handler
 * @property {MouseEventHandler} [onMouseEnter] - Mouse enter handler
 * @property {MouseEventHandler} [onMouseLeave] - Mouse leave handler
 * @property {string} [ariaLabel] - Accessible label
 * @property {string} [tooltipId] - Tooltip identifier
 * @property {string} [tooltipContent] - Tooltip content
 * @property {number} [hoverScale] - Hover scale
 * @property {number} [tapScale] - Tap scale
 * @property {ReactNode} children - Button content
 */
export interface ButtonProps {
  className?: string;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  ariaLabel?: string;
  tooltipId?: string;
  tooltipContent?: string;
  hoverScale?: number;
  tapScale?: number;
  children: ReactNode;
}

/**
 * Button component
 * Shared animated button primitive used for icon and text actions.
 * @component
 * @param {ButtonProps} props - The button props
 * @param {MouseEventHandler} [props.onClick] - Click handler
 * @param {string} [props.className=""] - Additional class names
 * @param {ReactNode} props.children - Button content
 * @param {string} [props.ariaLabel] - Accessible label
 * @param {string} [props.tooltipContent] - Tooltip content
 * @param {string} [props.tooltipId] - Tooltip id to attach to
 * @param {MouseEventHandler} [props.onMouseEnter] - Mouse enter handler
 * @param {MouseEventHandler} [props.onMouseLeave] - Mouse leave handler
 * @param {number} [props.hoverScale=1.08] - Framer Motion hover scale
 * @param {number} [props.tapScale=0.95] - Framer Motion tap scale
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
