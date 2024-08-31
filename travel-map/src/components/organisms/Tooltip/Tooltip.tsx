import { Tooltip as ReactTooltip } from "react-tooltip";
import "./Tooltip.scss";

interface TooltipProps {
  className?: string;
  text?: string;
  anchorSelect?: string;
  opacity?: number;
}

/**
 * Tooltip component
 *
 * The tooltip component is used to display a tooltip.
 *
 * @component
 *
 * @param {TooltipProps} props - The props of the tooltip
 * @param {string} [props.className] - The class name of the tooltip
 * @param {string} [props.text] - The text of the tooltip
 * @param {string} [props.anchorSelect] - The anchor select of the tooltip
 * @param {number} [props.opacity] - The opacity of the tooltip
 * @returns {JSX.Element} - The tooltip
 */
export default function Tooltip({
  className = "",
  text = "",
  anchorSelect = "",
  opacity = 1,
}: TooltipProps): JSX.Element {
  return (
    <ReactTooltip
      clickable
      className={`tooltip ${className}`}
      id={text}
      key={text}
      anchorSelect={anchorSelect}
      opacity={opacity}
    >
      {text}
    </ReactTooltip>
  );
}
