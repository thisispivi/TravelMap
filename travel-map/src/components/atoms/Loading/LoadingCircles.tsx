import "./LoadingCircles.scss";
import { JSX } from "react";

/**
 * Loading component
 *
 * The Loading component is an atom that displays a spinner while the content is loading.
 * @component
 * @returns {JSX.Element} The Loading component
 */
export function Loading(): JSX.Element {
  return <div className="loader-circles" />;
}
