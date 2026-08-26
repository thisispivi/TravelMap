import "./CompassRose.scss";

import { Trip } from "@travelmap/core";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { futureTrips, visitedTrips } from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatBearing, reckonAll, resolveOrigin } from "@/shared/lib/bearings";
import { classNames } from "@/shared/lib/classNames";
import { formatDistance } from "@/shared/lib/format";

import { plotRose, RosePoint, toRadius, visibleRings } from "../../lib/rose";

/* The plot is drawn in a unit square around the mark and scaled by the
   viewBox, so every radius in the projection stays a plain fraction of one. */
const VIEW = 100;
const THREAD_STAGGER_MS = 22;
const CENTER = VIEW / 2;
const CARDINALS: { label: string; bearing: number }[] = [
  { label: "N", bearing: 0 },
  { label: "E", bearing: 90 },
  { label: "S", bearing: 180 },
  { label: "W", bearing: 270 },
];

/**
 * Converts a unit-square offset into viewBox coordinates.
 * @param {number} offset - The offset from the mark in unit coordinates
 * @returns {number} The coordinate in viewBox units
 */
function toView(offset: number): number {
  return CENTER + offset * CENTER;
}

/**
 * CompassRose component
 * An azimuthal plot of the whole record, drawn from the one place every journey
 * leaves and returns to. Each thread runs out along its journey's true bearing
 * to its true distance, so the shape on the plate is not an illustration of the
 * travel but a projection of it, centred on home instead of on the equator.
 * The plot is a picture rather than a set of controls: threads answer to the
 * pointer, and the record beside it is the equivalent every journey is reachable
 * and readable through without one.
 * @component
 * @returns {ReactNode} The compass rose, or an empty state when nothing is recorded
 */
export function CompassRose(): ReactNode {
  const navigate = useNavigate();
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const { focusedTrip, setFocusedTrip } = useMapInteraction();
  const [pointer, setPointer] = useState<RosePoint | null>(null);
  const origin = resolveOrigin();

  if (!origin) {
    return (
      <div className="compass-rose compass-rose--empty">
        <EmptyState message={t("atlas.empty")} />
      </div>
    );
  }

  const plannedIds = new Set(futureTrips.map((trip) => trip.id));
  const points = plotRose(
    reckonAll([...visitedTrips, ...futureTrips], origin),
    plannedIds,
  );
  const maxDistanceKm = points.reduce(
    (furthest, point) => Math.max(furthest, point.distanceKm),
    0,
  );
  const rings = visibleRings(points);
  const active =
    points.find((point) => point.trip.id === focusedTrip?.id) ?? pointer;

  /**
   * Points the record and the readout at one journey.
   * @param {RosePoint | null} point - The journey under the pointer, or none
   * @returns {void}
   */
  const handlePoint = (point: RosePoint | null): void => {
    setPointer(point);
    setFocusedTrip(point?.trip ?? null);
  };

  /**
   * Opens a journey from its thread.
   * @param {Trip} trip - The journey to open
   * @returns {void}
   */
  const openJourney = (trip: Trip): void => {
    setFocusedTrip(null);
    navigate(`/trip/${trip.id}`);
  };

  return (
    <div className="compass-rose">
      <svg
        className="compass-rose__plot"
        role="img"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
      >
        <title>
          {t("atlas.roseTitle", { place: origin.getLocalizedName(lang) })}
        </title>

        <g className="compass-rose__graticule">
          {rings.map((ring) => (
            <circle
              className="compass-rose__ring"
              cx={CENTER}
              cy={CENTER}
              key={ring}
              r={toRadius(ring, maxDistanceKm) * CENTER}
            />
          ))}
          {CARDINALS.map(({ label, bearing }) => {
            const angle = ((bearing - 90) * Math.PI) / 180;
            return (
              <line
                className="compass-rose__axis"
                key={label}
                x1={CENTER}
                x2={toView(Math.cos(angle) * 0.98)}
                y1={CENTER}
                y2={toView(Math.sin(angle) * 0.98)}
              />
            );
          })}
        </g>

        <g className="compass-rose__threads">
          {points.map((point, index) => (
            <g
              className={classNames(
                "compass-rose__thread",
                point.isPlanned && "compass-rose__thread--planned",
                active?.trip.id === point.trip.id &&
                  "compass-rose__thread--active",
              )}
              key={point.trip.id}
              style={{ animationDelay: `${index * THREAD_STAGGER_MS}ms` }}
            >
              <line
                className="compass-rose__thread-line"
                pathLength={1}
                x1={CENTER}
                x2={toView(point.x)}
                y1={CENTER}
                y2={toView(point.y)}
              />
              <circle
                className="compass-rose__thread-dot"
                cx={toView(point.x)}
                cy={toView(point.y)}
                r={point.dot * CENTER}
              />
              <circle
                className="compass-rose__thread-target"
                cx={toView(point.x)}
                cy={toView(point.y)}
                onClick={() => openJourney(point.trip)}
                onMouseEnter={() => handlePoint(point)}
                onMouseLeave={() => handlePoint(null)}
                r={2.6}
              />
            </g>
          ))}
        </g>

        <circle
          className="compass-rose__mark"
          cx={CENTER}
          cy={CENTER}
          r={1.5}
        />

        <g className="compass-rose__labels">
          {rings.map((ring) => (
            <text
              className="compass-rose__ring-label figure"
              key={ring}
              x={CENTER - toRadius(ring, maxDistanceKm) * CENTER + 0.8}
              y={CENTER - 1.1}
            >
              {ring.toLocaleString(lang)}
            </text>
          ))}
          {CARDINALS.map(({ label, bearing }) => {
            const angle = ((bearing - 90) * Math.PI) / 180;
            return (
              <text
                className="compass-rose__cardinal"
                dominantBaseline="middle"
                key={label}
                textAnchor="middle"
                x={toView(Math.cos(angle) * 1.045)}
                y={toView(Math.sin(angle) * 1.045)}
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>

      <p className="compass-rose__origin">
        <span className="compass-rose__origin-name">
          {origin.getLocalizedName(lang)}
        </span>
        <span className="compass-rose__origin-note">{t("atlas.origin")}</span>
      </p>

      <div
        aria-live="polite"
        className={classNames(
          "compass-rose__readout",
          active && "compass-rose__readout--live",
        )}
      >
        {active ? (
          <>
            <span className="compass-rose__readout-title">
              {active.trip.getLocalizedTitle(lang)}
            </span>
            <span className="compass-rose__readout-figures figure">
              {formatBearing(active.bearing)}
              <span className="compass-rose__readout-gap" />
              {formatDistance(active.distanceKm, lang)}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
