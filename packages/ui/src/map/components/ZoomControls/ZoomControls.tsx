import "./ZoomControls.scss";

import { Minus, Plus } from "lucide-react";
import { ReactNode } from "react";

import { useLanguage } from "../../../hooks/useLanguage";

/**
 * Properties accepted by the ZoomControls component.
 * @property {() => void} onZoomIn - Zooms the map in one step
 * @property {() => void} onZoomOut - Zooms the map out one step
 */
interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/**
 * ZoomControls component
 * The frosted plus and minus pill in the map's bottom-right corner, the same
 * control on the site's map and the editor's.
 * @component
 * @param {ZoomControlsProps} props - The control props
 * @param {() => void} props.onZoomIn - Zooms the map in one step
 * @param {() => void} props.onZoomOut - Zooms the map out one step
 * @returns {ReactNode} The zoom controls
 */
export function ZoomControls({
  onZoomIn,
  onZoomOut,
}: ZoomControlsProps): ReactNode {
  const { t } = useLanguage([]);

  return (
    <div className="zoom-controls">
      <button
        aria-label={t("common:map.zoomIn")}
        className="zoom-controls__button"
        onClick={onZoomIn}
        type="button"
      >
        <Plus aria-hidden="true" />
      </button>
      <button
        aria-label={t("common:map.zoomOut")}
        className="zoom-controls__button"
        onClick={onZoomOut}
        type="button"
      >
        <Minus aria-hidden="true" />
      </button>
    </div>
  );
}
