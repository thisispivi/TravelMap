import "./RouteOverlay.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, use, useMemo } from "react";
import { Line } from "react-simple-maps";

import { HomeContext } from "@/components/pages/Home/HomeContext";
import { TransportMode } from "@/core";
import { useLocation } from "@/hooks/location/location";

// ── Segment color helpers ─────────────────────────────────────────────────────

const TRANSPORT_COLORS_DARK: Partial<Record<TransportMode, string>> = {
  ferry: "#06b6d4", // cyan
  plane: "#a78bfa", // violet
  bus: "#22c55e", // green
  train: "#f59e0b", // amber
  car: "#f97316", // orange
};

const TRANSPORT_COLORS_LIGHT: Partial<Record<TransportMode, string>> = {
  ferry: "#0891b2", // darker cyan
  plane: "#7c3aed", // darker violet
  bus: "#16a34a", // darker green
  train: "#d97706", // darker amber
  car: "#ea580c", // darker orange
};

function segmentColor(
  mode: TransportMode | undefined,
  isDark: boolean,
): string {
  if (!mode) return isDark ? "rgba(255,255,255,0.45)" : "#1a73e8";
  const map = isDark ? TRANSPORT_COLORS_DARK : TRANSPORT_COLORS_LIGHT;
  return map[mode] ?? (isDark ? "rgba(255,255,255,0.45)" : "#1a73e8");
}

/**
 * RouteOverlay component
 *
 * Renders route lines between every waypoint of the selected trip —
 * including origin, all destinations (layovers included), and returnTo.
 * Each segment is coloured by its transport mode (ferry=cyan, plane=violet,
 * default=white/blue). Segments animate in staggered.
 */
export function RouteOverlay(): JSX.Element {
  const { selectedTrip, isDarkTheme } = use(HomeContext)!;
  const { isTripDetail } = useLocation();

  const segments = useMemo(() => {
    if (!selectedTrip) return [];

    const allSegments = selectedTrip
      .getRouteSegments()
      .flatMap((step, stepIdx) => {
        const cities = [step.from, ...(step.via ?? step.ferry?.via ?? []), step.to];
        return cities.slice(0, -1).map((city, cityIdx) => ({
          from: city.coordinates as [number, number],
          to: cities[cityIdx + 1].coordinates as [number, number],
          mode: step.mode,
          idx: stepIdx + cityIdx / 10,
        }));
      });

    const seen = new Set<string>();
    return allSegments.filter((seg) => {
      const [lon1, lat1] = seg.from;
      const [lon2, lat2] = seg.to;
      const key =
        lon1 < lon2 || (lon1 === lon2 && lat1 < lat2)
          ? `${lon1},${lat1}-${lon2},${lat2}`
          : `${lon2},${lat2}-${lon1},${lat1}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedTrip]);

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
            {segments.map((seg) => {
              const color = segmentColor(seg.mode, isDarkTheme);
              // Planes get a longer dash; ferries and default get a tighter dash
              const dashArray =
                seg.mode === "plane"
                  ? "8 10"
                  : seg.mode === "ferry"
                    ? "5 8"
                    : "5 4";
              return (
                <Line
                  coordinates={[seg.from, seg.to]}
                  key={`route-${seg.idx}`}
                  stroke={color}
                  strokeDasharray={dashArray}
                  strokeLinecap="round"
                  strokeWidth={2}
                  style={{
                    animation: `route-draw 0.5s ease-out ${seg.idx * 0.2}s both`,
                    vectorEffect: "non-scaling-stroke",
                  }}
                />
              );
            })}
          </m.g>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}
