import "./RouteOverlay.scss";

import { JSX, useContext, useMemo } from "react";
import { Line } from "react-simple-maps";

import { HomeContext } from "@/components/pages/Home/HomeContext";

/**
 * RouteOverlay component.
 *
 * @component
 * @returns {JSX.Element | null} The RouteOverlay component.
 */
export function RouteOverlay(): JSX.Element | null {
  const { selectedTrip, isDarkTheme } = useContext(HomeContext)!;

  const segments = useMemo(() => {
    if (!selectedTrip) return [];
    const dests = selectedTrip.destinations;
    const result: {
      from: [number, number];
      to: [number, number];
      idx: number;
    }[] = [];
    for (let i = 0; i < dests.length - 1; i++) {
      result.push({
        from: dests[i].city.coordinates as [number, number],
        to: dests[i + 1].city.coordinates as [number, number],
        idx: i,
      });
    }
    return result;
  }, [selectedTrip]);

  if (segments.length === 0) return null;

  const strokeColor = isDarkTheme ? "rgba(255, 255, 255, 0.6)" : "#1a73e8";

  return (
    <g className="route-overlay">
      {segments.map((seg) => (
        <Line
          coordinates={[seg.from, seg.to]}
          key={`route-${seg.idx}`}
          stroke={strokeColor}
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeWidth={2}
          style={{
            animation: `route-draw 0.6s ease-out ${seg.idx * 0.3}s both`,
          }}
        />
      ))}
    </g>
  );
}
