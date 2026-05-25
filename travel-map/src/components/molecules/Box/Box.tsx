import "./Box.scss";

import { JSX, PropsWithChildren } from "react";

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
 * @returns {JSX.Element} The box
 */
export function Box({ className = "", children }: BoxProps): JSX.Element {
  return <div className={classNames("box", className)}>{children}</div>;
}
