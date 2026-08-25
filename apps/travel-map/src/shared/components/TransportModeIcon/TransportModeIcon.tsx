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
 * @property {TransportMode} mode - The transport mode to illustrate
 * @property {string} [className] - Additional class names for the SVG element
 * @property {string} [label] - Accessible name, when the icon is the only label
 */
interface TransportModeIconProps {
  mode: TransportMode;
  className?: string;
  label?: string;
}

/**
 * TransportModeIcon component
 * Renders the icon corresponding to a given transport mode. The icon is hidden
 * from assistive technology unless a `label` is given: the source SVGs carry an
 * inline `<style>` block, which is announced verbatim when the element stays
 * exposed without a name of its own.
 * @component
 * @param {TransportModeIconProps} props - The transport icon props
 * @param {TransportMode} props.mode - The transport mode
 * @param {string} [props.className] - CSS class name for the SVG
 * @param {string} [props.label] - Accessible name for a standalone icon
 * @returns {ReactNode} The icon element, or null for unknown modes
 */
export function TransportModeIcon({
  mode,
  className,
  label,
}: TransportModeIconProps): ReactNode {
  const iconProps = label
    ? { "aria-label": label, className, role: "img" }
    : { "aria-hidden": true, className };

  if (mode === "plane") return <AirplaneIcon {...iconProps} />;
  if (mode === "ferry") return <FerryIcon {...iconProps} />;
  if (mode === "bus") return <BusIcon {...iconProps} />;
  if (mode === "train") return <TrainIcon {...iconProps} />;
  if (mode === "car") return <CarIcon {...iconProps} />;
  if (mode === "taxi") return <TaxiIcon {...iconProps} />;
  if (mode === "walk") return <WalkIcon {...iconProps} />;
  return null;
}
