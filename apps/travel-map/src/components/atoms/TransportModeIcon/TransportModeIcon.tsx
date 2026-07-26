import { TransportMode } from "@travelmap/core";
import { ReactNode } from "react";

import AirplaneIcon from "@/assets/icons/Airplane.svg?react";
import BusIcon from "@/assets/icons/Bus.svg?react";
import CarIcon from "@/assets/icons/Car.svg?react";
import FerryIcon from "@/assets/icons/Ferry.svg?react";
import TaxiIcon from "@/assets/icons/Taxi.svg?react";
import TrainIcon from "@/assets/icons/Train.svg?react";
import WalkIcon from "@/assets/icons/Walk.svg?react";

/**
 * Properties accepted by the TransportModeIcon component.
 * @property {TransportMode} mode - The mode
 * @property {string} [className] - The class name
 */
interface TransportModeIconProps {
  /**
   * Transport mode to render an icon for.
   */
  mode: TransportMode;

  /**
   * Optional CSS class name applied to the SVG element.
   */
  className?: string;
}

/**
 * TransportModeIcon component
 * Renders the icon corresponding to a given transport mode.
 * @component
 * @param {TransportModeIconProps} props - The transport icon props
 * @param {TransportMode} props.mode - The transport mode
 * @param {string} [props.className] - CSS class name for the SVG
 * @returns {ReactNode} The icon element, or null for unknown modes
 */
export function TransportModeIcon({
  mode,
  className,
}: TransportModeIconProps): ReactNode {
  if (mode === "plane") return <AirplaneIcon className={className} />;
  if (mode === "ferry") return <FerryIcon className={className} />;
  if (mode === "bus") return <BusIcon className={className} />;
  if (mode === "train") return <TrainIcon className={className} />;
  if (mode === "car") return <CarIcon className={className} />;
  if (mode === "taxi") return <TaxiIcon className={className} />;
  if (mode === "walk") return <WalkIcon className={className} />;
  return null;
}
