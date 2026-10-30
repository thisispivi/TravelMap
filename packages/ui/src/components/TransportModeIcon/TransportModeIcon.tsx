import { TransportMode } from "@travelmap/core";
import {
  Bus,
  Car,
  CarTaxiFront,
  Footprints,
  LucideIcon,
  Plane,
  Ship,
  TrainFront,
} from "lucide-react";
import { ReactNode } from "react";

const MODE_ICONS: Record<TransportMode, LucideIcon> = {
  bus: Bus,
  car: Car,
  ferry: Ship,
  plane: Plane,
  taxi: CarTaxiFront,
  train: TrainFront,
  walk: Footprints,
};

/**
 * Properties accepted by the TransportModeIcon component.
 * @property {TransportMode} mode - The transport mode to draw
 * @property {string} [className] - Extra classes from the owning block
 */
interface TransportModeIconProps {
  mode: TransportMode;
  className?: string;
}

/**
 * TransportModeIcon component
 * The stroke icon for a transport mode, decorative because the mode is always
 * named in text beside it.
 * @component
 * @param {TransportModeIconProps} props - The icon props
 * @param {TransportMode} props.mode - The transport mode to draw
 * @param {string} [props.className] - Extra classes from the owning block
 * @returns {ReactNode} The icon
 */
export function TransportModeIcon({
  mode,
  className,
}: TransportModeIconProps): ReactNode {
  const Icon = MODE_ICONS[mode];
  return <Icon aria-hidden="true" className={className} strokeWidth={2} />;
}
