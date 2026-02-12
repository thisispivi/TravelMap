import "./InfoTabVisited.scss";

import { JSX } from "react";

import { visitedTrips } from "@/data";

import { InfoTabTrips } from "./InfoTabTrips";

interface InfoTabVisitedProps {
  className?: string;
  isVisible?: boolean;
}

/**
 * InfoTabVisited component
 *
 * The info tab visited component is used to display the visited
 * cities and countries.
 *
 * @component
 *
 * @param {InfoTabVisitedProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab visited
 * @param {boolean} props.isVisible - The visibility of the info tab visited
 * @returns {JSX.Element} - The info tab visited
 */
export function InfoTabVisited({
  className = "",
  isVisible = false,
}: InfoTabVisitedProps): JSX.Element {
  return (
    <InfoTabTrips
      className={className}
      id="visited"
      isVisible={isVisible}
      trips={visitedTrips}
    />
  );
}
