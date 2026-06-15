import "./Loading.scss";

import { ReactNode } from "react";

import { classNames } from "@/utils/className";

interface LoadingProps {
  className?: string;
}

/**
 * Loading component
 *
 * Spinner shown while async content is loading.
 *
 * @component
 *
 * @param {LoadingProps} props - The loading props
 * @param {string} [props.className] - Additional class names
 * @returns {ReactNode} The loading spinner
 */
export function Loading({ className = "" }: LoadingProps): ReactNode {
  return <div className={classNames("loader", className)} />;
}
