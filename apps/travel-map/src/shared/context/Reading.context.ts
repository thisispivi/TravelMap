import { City } from "@travelmap/core";
import { createContext, useContext } from "react";

import { RunningFigures } from "@/data/record";

/**
 * What the reader is currently pointing at in the record. The plate frames it;
 * nothing else in the app needs to know how the row that produced it is shaped.
 * @property {City[]} cities - The cities the reading refers to
 * @property {[number, number][]} [route] - The path to draw, when the reading is a journey or a passage
 */
export interface Locus {
  cities: City[];
  route?: [number, number][];
}

/**
 * The reading position shared by the record and the plate beside it.
 * @property {Locus | null} locus - What the reader is pointing at, or null for the whole record
 * @property {(locus: Locus | null) => void} setLocus - Points the plate at a new reading
 * @property {RunningFigures} figures - The archive totals as of how far the reader has read
 * @property {(figures: RunningFigures) => void} setFigures - Reports a new reading position
 * @property {boolean} isDark - Whether the record is being read on a dark ground
 */
export interface ReadingContextValue {
  locus: Locus | null;
  setLocus: (locus: Locus | null) => void;
  figures: RunningFigures;
  setFigures: (figures: RunningFigures) => void;
  isDark: boolean;
}

const ReadingContext = createContext<ReadingContextValue | null>(null);

export const ReadingProvider = ReadingContext.Provider;

/**
 * Reads the shared reading position.
 * @returns {ReadingContextValue} The reading position and the active ground
 * @throws {Error} When used outside the record shell
 */
export function useReading(): ReadingContextValue {
  const value = useContext(ReadingContext);
  if (!value)
    throw new Error("useReading must be used inside the record shell");
  return value;
}
