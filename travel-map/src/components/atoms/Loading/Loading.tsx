import "./Loading.scss";

import { JSX } from "react";

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
 * @returns {JSX.Element} The loading spinner
 */
export function Loading({ className = "" }: LoadingProps): JSX.Element {
  return <div className={classNames("loader", className)} />;
}
