import "./Box.scss";

import { ReactNode } from "react";

import { classNames } from "@/utils/className";

/**
 * Properties accepted by the Box component.
 * @property {string} [className] - The class name
 * @property {ReactNode} children - The children
 */
interface BoxProps {
  className?: string;
  children: ReactNode;
}

/**
 * Box component
 * Generic boxed layout container.
 * @component
 * @param {BoxProps} props - The box props
 * @param {string} [props.className=""] - Additional class names
 * @param {ReactNode} props.children - Box content
 * @returns {ReactNode} The box
 */
export function Box({ className = "", children }: BoxProps): ReactNode {
  return <div className={classNames("box", className)}>{children}</div>;
}
