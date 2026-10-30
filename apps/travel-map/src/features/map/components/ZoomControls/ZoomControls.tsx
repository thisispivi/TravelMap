import "./ZoomControls.scss";

import { Minus, Plus } from "lucide-react";
import { ReactNode } from "react";

/**
 * Properties accepted by the ZoomControls component.
 * @property {() => void} onZoomIn - Zooms the map in one step
 * @property {() => void} onZoomOut - Zooms the map out one step
 * @property {string} zoomInLabel - The zoom-in button's accessible name
 * @property {string} zoomOutLabel - The zoom-out button's accessible name
 */
interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomInLabel: string;
  zoomOutLabel: string;
}

/**
 * ZoomControls component
 * The frosted plus and minus pill in the map's bottom-right corner. The site
 * and the editor share it so both maps carry the same control; each passes
 * its own labels, since the two apps load different translation namespaces.
 * @component
 * @param {ZoomControlsProps} props - The control props
 * @param {() => void} props.onZoomIn - Zooms the map in one step
 * @param {() => void} props.onZoomOut - Zooms the map out one step
 * @param {string} props.zoomInLabel - The zoom-in button's accessible name
 * @param {string} props.zoomOutLabel - The zoom-out button's accessible name
 * @returns {ReactNode} The zoom controls
 */
export function ZoomControls({
  onZoomIn,
  onZoomOut,
  zoomInLabel,
  zoomOutLabel,
}: ZoomControlsProps): ReactNode {
  return (
    <div className="zoom-controls">
      <button
        aria-label={zoomInLabel}
        className="zoom-controls__button"
        onClick={onZoomIn}
        type="button"
      >
        <Plus aria-hidden="true" />
      </button>
      <button
        aria-label={zoomOutLabel}
        className="zoom-controls__button"
        onClick={onZoomOut}
        type="button"
      >
        <Minus aria-hidden="true" />
      </button>
    </div>
  );
}
