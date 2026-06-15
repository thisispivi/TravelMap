import "./Box.scss";

import { PropsWithChildren, ReactNode } from "react";

import { classNames } from "@/utils/className";

interface BoxProps extends PropsWithChildren {
  className?: string;
}

/**
 * Box component
 *
 * Generic boxed layout container.
 *
 * @component
 *
 * @param {BoxProps} props - The box props
 * @param {string} [props.className] - Additional class names
 * @param {React.ReactNode} props.children - Box content
 * @returns {ReactNode} The box
 */
export function Box({ className = "", children }: BoxProps): ReactNode {
  return <div className={classNames("box", className)}>{children}</div>;
}
