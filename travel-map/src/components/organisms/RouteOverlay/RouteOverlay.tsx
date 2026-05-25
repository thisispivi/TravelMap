import "./RouteOverlay.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useContext, useMemo } from "react";
import { Line } from "react-simple-maps";

import { HomeContext } from "@/components/pages/Home/HomeContext";
import { useLocation } from "@/hooks/location/location";

/**
 * RouteOverlay component
 *
 * Renders dashed route lines between consecutive trip destinations on the map.
 * Only visible when a trip detail is active. Segments animate in one by one
 * with a staggered CSS keyframe.
 *
 * @component
 *
 * @returns {JSX.Element} SVG overlay lines rendered inside the ZoomableGroup
 */
export function RouteOverlay(): JSX.Element {
  const { selectedTrip, isDarkTheme } = useContext(HomeContext)!;
  const { isTripDetail } = useLocation();

  const segments = useMemo(() => {
    if (!selectedTrip) return [];
    const dests = selectedTrip.destinations;
    return dests.slice(0, -1).map((dest, i) => ({
      from: dest.city.coordinates as [number, number],
      to: dests[i + 1].city.coordinates as [number, number],
      idx: i,
    }));
  }, [selectedTrip]);

  const lineColor = isDarkTheme ? "rgba(255,255,255,0.6)" : "#1a73e8";

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {selectedTrip && isTripDetail && segments.length > 0 ? (
          <m.g
            animate={{ opacity: 1 }}
            className="route-overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 1 }}
            key={selectedTrip.id}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {segments.map((seg) => (
              <Line
                coordinates={[seg.from, seg.to]}
                key={`route-${seg.idx}`}
                stroke={lineColor}
                strokeDasharray="6 4"
                strokeLinecap="round"
                strokeWidth={2}
                style={{
                  animation: `route-draw 0.5s ease-out ${seg.idx * 0.25}s both`,
                  vectorEffect: "non-scaling-stroke",
                }}
              />
            ))}
          </m.g>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}
