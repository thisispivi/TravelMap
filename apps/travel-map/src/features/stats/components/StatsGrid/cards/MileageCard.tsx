import "./MileageCard.scss";

import { City } from "@travelmap/core";
import { ReactNode } from "react";

import EarthFlatIcon from "@/assets/icons/EarthFlat.svg?react";
import MoonFlatIcon from "@/assets/icons/MoonFlat.svg?react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatMileage } from "@/shared/lib/format";
import { parameters } from "@/shared/lib/parameters";

import { CityRow } from "../../rows/RowCity";

/**
 * Props for the MileageCard component.
 * @property {number} totalMileage - Total distance traveled in km.
 * @property {string} totalMileageAroundEarth - How many times around the Earth (formatted string).
 * @property {string} totalMileageToMoon - How many times to the Moon (formatted string).
 * @property {City} furthestCity - Furthest city visited from the birth city.
 * @property {City} nearestCity - Nearest city visited from the birth city.
 */
export type MileageCardProps = {
  totalMileage: number;
  totalMileageAroundEarth: string;
  totalMileageToMoon: string;
  furthestCity: City;
  nearestCity: City;
};

/**
 * MileageCard component
 * Bento detail card showing total travel distance with Earth/Moon comparisons,
 * plus the furthest and nearest cities visited from home.
 * @component
 * @param {MileageCardProps} props
 * @param {number} props.totalMileage - Total distance traveled in kilometers
 * @param {string} props.totalMileageAroundEarth - Earth-circumference comparison
 * @param {string} props.totalMileageToMoon - Earth-to-Moon comparison
 * @param {City} props.furthestCity - The furthest visited city from home
 * @param {City} props.nearestCity - The nearest visited city from home
 * @returns {ReactNode} The mileage panel
 */
export function MileageCard({
  totalMileage,
  totalMileageAroundEarth,
  totalMileageToMoon,
  furthestCity,
  nearestCity,
}: MileageCardProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);

  return (
    <section className="stats-panel stats-panel--full stats-block">
      <div className="stats-block__top">
        <h2>{t("stats.mileage")}</h2>
        <div className="stats-mileage__total">
          <p>{t("stats.totalMileage")}</p>
          <b className="figure">
            {formatMileage(totalMileage, currLanguage)} km
          </b>
        </div>
        <div className="stats-mileage__planets">
          <div className="stats-mileage__planet">
            <EarthFlatIcon className="stats-mileage__planet-icon" />
            <div className="stats-mileage__planet-text">
              <b className="figure">{totalMileageAroundEarth}×</b>
              <p>{t("stats.aroundEarth")}</p>
            </div>
          </div>
          <div className="stats-mileage__planet">
            <MoonFlatIcon className="stats-mileage__planet-icon" />
            <div className="stats-mileage__planet-text">
              <b className="figure">{totalMileageToMoon}×</b>
              <p>{t("stats.toMoon")}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="stats-block__rows">
        <div className="stats-block__row">
          <p className="stats-block__row-label">{t("stats.furthestCity")}</p>
          <CityRow
            eCity={furthestCity}
            sCity={parameters.homeCity ?? undefined}
          />
        </div>
        <div className="stats-block__row">
          <p className="stats-block__row-label">{t("stats.nearestCity")}</p>
          <CityRow
            eCity={nearestCity}
            sCity={parameters.homeCity ?? undefined}
          />
        </div>
      </div>
    </section>
  );
}
