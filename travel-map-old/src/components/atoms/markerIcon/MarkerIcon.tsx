import { useCallback } from "react";
import "./MarkerIcon.scss";

interface MarkerIconProps {
  active?: boolean;
  scaleFactor?: number;
}

export default function MarkerIcon({
  active = false,
  scaleFactor = 1,
}: MarkerIconProps) {
  const getScale = useCallback(
    (x: number, active: boolean) =>
      (0.279132 - 0.0449837 * Math.log(2.29564 * x + 2.79089)) *
      (active ? 1.2 : 1),
    [scaleFactor, active]
  );
  return (
    <g className={`marker-icon ${active ? "active" : ""}`}>
      <g
        transform={`scale(${getScale(
          scaleFactor,
          active
        )}) translate(-12, -24)`}
      >
        <path
          className="marker-circle"
          d="m12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z"
        />
        <path
          className="marker-component"
          d="m12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z"
        />
      </g>
    </g>
  );
}
