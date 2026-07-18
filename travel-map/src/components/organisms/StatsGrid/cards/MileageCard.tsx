import "./MileageCard.scss";

import { ReactNode } from "react";

import EarthFlatIcon from "@/assets/icons/EarthFlat.svg?react";
import MoonFlatIcon from "@/assets/icons/MoonFlat.svg?react";
import { City } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatMileage } from "@/utils/format";

import { Card } from "../../../molecules/Cards/Card";
import { CityRow } from "../../../molecules/Row/RowCity";

/**
 * Props for the MileageCard component.
 *
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
 *
 * Bento detail card showing total travel distance with Earth/Moon comparisons,
 * plus the furthest and nearest cities visited from home.
 *
 * @component
 *
 * @param {MileageCardProps} props
 * @returns {ReactNode} The mileage bento card
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
    <Card className="bento-card bento-card--large bento-detail card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.mileage")}</h2>
        <div className="bento-mileage__total">
          <p>{t("stats.totalMileage")}</p>
          <b>{formatMileage(totalMileage, currLanguage)} km</b>
        </div>
        <div className="bento-mileage__planets">
          <div className="bento-mileage__planet">
            <EarthFlatIcon className="bento-mileage__planet-icon" />
            <b>{totalMileageAroundEarth}×</b>
            <p>{t("stats.aroundEarth")}</p>
          </div>
          <div className="bento-mileage__planet">
            <MoonFlatIcon className="bento-mileage__planet-icon" />
            <b>{totalMileageToMoon}×</b>
            <p>{t("stats.toMoon")}</p>
          </div>
        </div>
      </div>
      <div className="bento-detail__rows">
        <div className="bento-detail__row">
          <p className="bento-detail__row-label">{t("stats.furthestCity")}</p>
          <CityRow eCity={furthestCity} />
        </div>
        <div className="bento-detail__row">
          <p className="bento-detail__row-label">{t("stats.nearestCity")}</p>
          <CityRow eCity={nearestCity} />
        </div>
      </div>
    </Card>
  );
}
