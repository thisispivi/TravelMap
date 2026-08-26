import "./Record.scss";

import { lazy, ReactNode, Suspense, useState } from "react";
import { Outlet } from "react-router";

import { RunningFigures, totalFigures } from "@/data/record";
import { Figures } from "@/features/ledger/components/Figures/Figures";
import { Rail } from "@/features/ledger/components/Rail/Rail";
import { Plate } from "@/features/map/components/Plate/Plate";
import { Locus, ReadingProvider } from "@/shared/context/Reading.context";
import { useThemeDetector } from "@/shared/hooks/useThemeDetector";
import { classNames } from "@/shared/lib/classNames";

import { useAppLocation } from "../routing/useAppLocation";

/* Photographs pull in the album and viewer libraries, and most readings never
   open one, so the sheet is the only part of the record that is split out. */
const Photographs = lazy(() =>
  import("@/features/gallery/components/Photographs/Photographs").then(
    (module) => ({ default: module.Photographs }),
  ),
);

/**
 * Record component
 * The whole application: a measure rail, the reading column the record is read
 * in, the plate that locates whatever is being read, and the running figures.
 * There is no navigation bar because the record itself is the navigation — a
 * reader moves by changing scale on one column, not by choosing a destination.
 * @component
 * @returns {ReactNode} The record shell
 */
export function Record(): ReactNode {
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  const [locus, setLocus] = useState<Locus | null>(null);
  const [figures, setFigures] = useState<RunningFigures>(totalFigures);
  const { spanIndex, tripId } = useAppLocation();

  return (
    <div
      className={classNames(
        "record",
        isDarkTheme ? "record--dark" : "record--light",
      )}
    >
      <ReadingProvider
        value={{ figures, isDark: isDarkTheme, locus, setFigures, setLocus }}
      >
        <main className="record__ledger">
          <Outlet />
        </main>
        <Plate />
        {/* The rail is placed by the grid, so it sits last in the document and
            a reader tabbing through reaches the record itself before reaching
            a second, redundant set of links to the same journeys. */}
        <Rail tripId={tripId} />
        {spanIndex === null ? null : (
          <Suspense fallback={null}>
            <Photographs spanIndex={spanIndex} tripId={tripId} />
          </Suspense>
        )}
        <Figures onToggleGround={handleDarkModeSwitch} />
      </ReadingProvider>
    </div>
  );
}
