import "./Figures.scss";

import { ReactNode } from "react";

import MoonIcon from "@/assets/icons/Moon.svg?react";
import SunIcon from "@/assets/icons/Sun.svg?react";
import { useReading } from "@/shared/context/Reading.context";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { toHours } from "../../lib/duration";

/**
 * Properties accepted by the figures band.
 * @property {() => void} onToggleGround - Switches between the light and dark ground
 */
interface FiguresProps {
  onToggleGround: () => void;
}

/**
 * Figures component
 * The archive's totals as they stood at the point the reader has reached,
 * rather than one grand total shown out of context. Scrolling the record moves
 * these numbers, which is what makes a separate statistics page unnecessary:
 * the figures are a consequence of reading, not a destination.
 * @component
 * @param {FiguresProps} props - The figures props
 * @param {() => void} props.onToggleGround - Switches the ground
 * @returns {ReactNode} The running figures band
 */
export function Figures({ onToggleGround }: FiguresProps): ReactNode {
  const { currLanguage, changeLanguage, t } = useLanguage(["record"]);
  const { figures, isDark } = useReading();
  const readings = [
    { label: t("record:journeys"), value: String(figures.journeys) },
    {
      label: t("record:distance"),
      value: `${Math.round(figures.distanceKm).toLocaleString(currLanguage)} km`,
    },
    {
      label: t("record:inMotion"),
      value: `${toHours(figures.minutesInMotion).toLocaleString(currLanguage)} h`,
    },
    { label: t("record:countries"), value: String(figures.countries) },
    {
      label: t("record:photographs_short"),
      value: String(figures.photographs),
    },
  ];

  return (
    <footer className="figures">
      <dl className="figures__readings">
        {readings.map((reading) => (
          <div className="figures__reading" key={reading.label}>
            <dt className="figures__label">{reading.label}</dt>
            <dd className="figures__value figure">{reading.value}</dd>
          </div>
        ))}
      </dl>
      <div className="figures__controls">
        <button
          className="figures__control figure"
          onClick={() =>
            changeLanguage(currLanguage.startsWith("it") ? "en-US" : "it-IT")
          }
          type="button"
        >
          {currLanguage.slice(0, 2).toUpperCase()}
        </button>
        <button
          aria-label={t(isDark ? "record:toLight" : "record:toDark")}
          className="figures__control"
          onClick={onToggleGround}
          type="button"
        >
          {isDark ? (
            <SunIcon className="figures__icon" />
          ) : (
            <MoonIcon className="figures__icon" />
          )}
        </button>
      </div>
    </footer>
  );
}
