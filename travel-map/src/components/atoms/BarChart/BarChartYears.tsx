import "./BarChartYears.scss";

import { JSX, useMemo } from "react";

import { Trip } from "@/core";

interface BarChartYearsProps {
  trips: Trip[];
}

/**
 * BarChartYears component
 *
 * Vertical bar chart showing total days abroad per travel year.
 *
 * @component
 * @param {BarChartYearsProps} props
 * @param {Trip[]} props.trips - All trips to derive year data from.
 * @returns {JSX.Element}
 */
export function BarChartYears({ trips }: BarChartYearsProps): JSX.Element {
  const yearData = useMemo(() => {
    const result: Record<number, number> = {};
    for (const trip of trips) {
      const year = trip.sDate.getFullYear();
      const days = Math.max(1, trip.getDurationInDays());
      result[year] = (result[year] ?? 0) + days;
    }
    return Object.entries(result)
      .map(([year, days]) => ({ year: parseInt(year, 10), days }))
      .sort((a, b) => a.year - b.year);
  }, [trips]);

  const maxDays = useMemo(
    () => Math.max(1, ...yearData.map((d) => d.days)),
    [yearData],
  );

  return (
    <div className="years-bar-chart">
      <div className="years-bar-chart__bars">
        {yearData.map(({ year, days }) => (
          <div className="years-bar-chart__col" key={year}>
            <span className="years-bar-chart__value">{days}</span>
            <div className="years-bar-chart__track">
              <div
                className="years-bar-chart__fill"
                style={{ height: `${(days / maxDays) * 100}%` }}
              />
            </div>
            <span className="years-bar-chart__label">
              &apos;{String(year).slice(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
