import "./Loading.scss";

import { classNames } from "@travelmap/ui/lib/classNames";
import { ReactNode } from "react";

/**
 * Properties accepted by the Loading component.
 * @property {string} [className] - The class name
 */
interface LoadingProps {
  className?: string;
}

/**
 * Loading component
 * Spinner shown while async content is loading.
 * @component
 * @param {LoadingProps} props - The loading props
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The loading spinner
 */
export function Loading({ className = "" }: LoadingProps): ReactNode {
  return <div className={classNames("loader", className)} />;
}
