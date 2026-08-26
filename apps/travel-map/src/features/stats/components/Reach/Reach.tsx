import "./Reach.scss";

import { City } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatBearing } from "@/shared/lib/bearings";
import { formatDistance, formatMileage } from "@/shared/lib/format";

/**
 * A measured edge of the record: the place, and the reading that puts it there.
 * @property {City} city - The place at that edge
 * @property {number} bearing - The bearing to it from the origin
 * @property {number} distanceKm - The distance to it from the origin
 */
export interface ReachEdge {
  city: City;
  bearing: number;
  distanceKm: number;
}

/**
 * Properties accepted by the Reach component.
 * @property {number} totalKm - Every kilometre in the record
 * @property {string} aroundEarth - How many times around the Earth that is
 * @property {string} toMoon - How many times to the Moon that is
 * @property {ReachEdge | null} furthest - The furthest place reached
 * @property {ReachEdge | null} nearest - The nearest place visited
 */
interface ReachProps {
  totalKm: number;
  aroundEarth: string;
  toMoon: string;
  furthest: ReachEdge | null;
  nearest: ReachEdge | null;
}

/**
 * Reach component
 * The headline figure of the record and the two places at either end of it.
 * The distance is set at display size because it is the one number that
 * summarises everything else on the page, and the comparisons sit under it as a
 * plain line rather than as tiles, since they only exist to make it imaginable.
 * @component
 * @param {ReachProps} props - The reach props
 * @param {number} props.totalKm - Every kilometre in the record
 * @param {string} props.aroundEarth - How many times around the Earth that is
 * @param {string} props.toMoon - How many times to the Moon that is
 * @param {ReachEdge | null} props.furthest - The furthest place reached
 * @param {ReachEdge | null} props.nearest - The nearest place visited
 * @returns {ReactNode} The reach headline
 */
export function Reach({
  totalKm,
  aroundEarth,
  toMoon,
  furthest,
  nearest,
}: ReachProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const edges = [
    furthest ? { key: "furthest" as const, edge: furthest } : null,
    nearest ? { key: "nearest" as const, edge: nearest } : null,
  ].filter((entry) => entry !== null);

  return (
    <section className="reach">
      <p className="reach__label">{t("stats.totalMileage")}</p>
      <p className="reach__total figure">
        {formatMileage(Math.round(totalKm), lang, 0)}
        <span className="reach__unit">km</span>
      </p>
      <p className="reach__comparison">
        {t("figures.comparison", { earth: aroundEarth, moon: toMoon })}
      </p>

      {edges.length > 0 ? (
        <dl className="reach__edges">
          {edges.map(({ key, edge }) => (
            <div className="reach__edge" key={key}>
              <dt className="reach__edge-label">
                {t(
                  key === "furthest"
                    ? "stats.furthestCity"
                    : "stats.nearestCity",
                )}
              </dt>
              <dd className="reach__edge-value">
                <span className="reach__edge-city">
                  {edge.city.getLocalizedName(lang)}
                </span>
                <span className="reach__edge-reading figure">
                  {formatBearing(edge.bearing)}
                  {" / "}
                  {formatDistance(edge.distanceKm, lang)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
