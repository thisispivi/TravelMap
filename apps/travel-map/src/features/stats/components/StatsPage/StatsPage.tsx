import "./StatsPage.scss";

import { City, Continent } from "@travelmap/core";
import { TravelType } from "@travelmap/core/typings/Travel";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { EmptyState } from "@travelmap/ui/components/EmptyState/EmptyState";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { Popover } from "@travelmap/ui/components/Popover/Popover";
import { TransportModeIcon } from "@travelmap/ui/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDuration, formatMileage } from "@travelmap/ui/i18n/format";
import { classNames } from "@travelmap/ui/lib/classNames";
import { MODE_COLORS } from "@travelmap/ui/lib/modeColors";
import { easeOut } from "@travelmap/ui/lib/motion";
import { animate, m, useInView, useReducedMotionConfig } from "framer-motion";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Clock,
  Compass,
  Earth,
  Globe,
  Hourglass,
  Landmark,
  LucideIcon,
  MapPinned,
  Milestone,
  Moon,
  Plane,
  Route,
  Ship,
  Sunrise,
  TrainFront,
} from "lucide-react";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import ContinentsMap from "@/assets/icons/Continents.svg?react";
import EarthFlat from "@/assets/icons/EarthFlat.svg?react";
import MoonFlat from "@/assets/icons/MoonFlat.svg?react";
import { resolveCompany } from "@/data/companies";
import { JournalSwitcher } from "@/shared/components/JournalSwitcher/JournalSwitcher";
import { SegmentedControl } from "@/shared/components/SegmentedControl/SegmentedControl";
import { Tooltip, TooltipBody } from "@/shared/components/Tooltip/Tooltip";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useTooltip } from "@/shared/hooks/useTooltip";
import { CONTINENT_COLORS } from "@/shared/lib/continentColors";
import { parameters } from "@/shared/lib/parameters";

import { getCurrencyDisplay } from "../../lib/countries";
import { FlightMeasure, getDonutSegments } from "../../lib/flightTypes";
import { PlaceMeasure, TripMeasure } from "../../lib/rankings";
import { RecordHolder, RecordId, TravelRecord } from "../../lib/records";
import { stats } from "../../lib/stats";
import { OperatorGroup as OperatorGroupStat } from "../../lib/transport";
import { StatBars } from "../StatBars/StatBars";

/** Which tile of the bento a card is, which decides how many columns it spans. */
type TileArea =
  | "continents"
  | "countries"
  | "currencies"
  | "days"
  | "clock"
  | "distance"
  | "edges"
  | "flightTypes"
  | "hemispheres"
  | "lines"
  | "modes"
  | "records"
  | "operators"
  | "topPlaces"
  | "topTrips"
  | "trips"
  | "world";

/** A figure's place in the bento: a headline number or a habit. */
type FigureArea = "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "h1" | "h2" | "h3";

/**
 * Properties accepted by the CountUp component.
 * @property {number} value - The number to count up to
 * @property {string} locale - The locale to group digits for
 * @property {number} [decimals] - Digits after the decimal separator
 */
interface CountUpProps {
  value: number;
  locale: string;
  decimals?: number;
}

/**
 * CountUp component
 * A number that counts up from zero the first time it scrolls into view. It
 * writes straight to the DOM, so the count costs no React renders.
 * @component
 * @param {CountUpProps} props - The number props
 * @param {number} props.value - The number to count up to
 * @param {string} props.locale - The locale to group digits for
 * @param {number} [props.decimals=0] - Digits after the decimal separator
 * @returns {ReactNode} The number
 */
function CountUp({ value, locale, decimals = 0 }: CountUpProps): ReactNode {
  const ref = useRef<HTMLSpanElement>(null);
  const hasCountedRef = useRef(false);
  const isInView = useInView(ref, { once: true });
  const isReduced = useReducedMotionConfig() ?? false;
  const digits = {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  };

  useEffect(() => {
    const node = ref.current;
    if (!node || !isInView) return;

    /**
     * Writes a number in the active locale.
     * @param {number} latest - The number to show
     * @returns {void}
     */
    const write = (latest: number): void => {
      node.textContent = latest.toLocaleString(locale, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      });
    };
    /*
     * The count runs once, on the first reveal, and only counts as done once
     * it finishes: an effect re-run mid-count, as StrictMode's double mount
     * does, starts it over. The animation writes to the DOM behind React's
     * back, so a later change — a new language — is written the same way,
     * straight to its final value, as is every number under Reduce motion.
     */
    if (hasCountedRef.current || isReduced) {
      write(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        hasCountedRef.current = true;
      },
      onUpdate: write,
    });
    return () => controls.stop();
  }, [decimals, isInView, isReduced, locale, value]);

  return <span ref={ref}>{value.toLocaleString(locale, digits)}</span>;
}

/**
 * Properties accepted by the Figure component.
 * @property {LucideIcon} icon - The figure's icon
 * @property {string} label - What the number counts
 * @property {number} value - The number
 * @property {string} [suffix] - Printed after it, such as `/ 195` or `days`
 * @property {FigureArea} area - Where in the bento the figure sits
 * @property {boolean} [isInline] - Whether the value sits beside the label, for a short tile
 */
interface FigureProps {
  area: FigureArea;
  isInline?: boolean;
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
}

/**
 * Figure component
 * One number as a small tile of the bento: icon and label, with the value
 * counting up beneath them.
 * @component
 * @param {FigureProps} props - The figure props
 * @param {FigureArea} props.area - Where in the bento the figure sits
 * @param {boolean} [props.isInline=false] - Whether the value sits beside the label
 * @param {LucideIcon} props.icon - The figure's icon
 * @param {string} props.label - What the number counts
 * @param {number} props.value - The number
 * @param {string} [props.suffix] - Printed after it
 * @returns {ReactNode} The figure tile
 */
function Figure({
  area,
  isInline = false,
  icon: Icon,
  label,
  value,
  suffix,
}: FigureProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  return (
    <m.section
      className={classNames(
        "stats-tile",
        "stats-tile--figure",
        `stats-tile--${area}`,
        isInline && "stats-tile--inline",
      )}
      initial={{ opacity: 0, y: 12 }}
      transition={easeOut}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <p className="stats-tile__label">
        <span className="stats-tile__icon">
          <Icon aria-hidden="true" />
        </span>
        {label}
      </p>
      <p className="stats-tile__value">
        <CountUp locale={currLanguage} value={value} />
        {suffix ? <span className="stats-tile__suffix">{suffix}</span> : null}
      </p>
    </m.section>
  );
}

/**
 * Properties accepted by the Card component.
 * @property {TileArea} area - Which tile it is
 * @property {string} title - The card's heading
 * @property {ReactNode} children - Its content
 */
interface CardProps {
  area: TileArea;
  title: string;
  children: ReactNode;
}

/**
 * Card component
 * One chart or list as a tile of the bento, rising into place as it scrolls
 * into view.
 * @component
 * @param {CardProps} props - The card props
 * @param {TileArea} props.area - Which tile it is
 * @param {string} props.title - The card's heading
 * @param {ReactNode} props.children - Its content
 * @returns {ReactNode} The card tile
 */
function Card({ area, title, children }: CardProps): ReactNode {
  return (
    <m.section
      className={classNames("stats-tile", `stats-tile--${area}`)}
      initial={{ opacity: 0, y: 16 }}
      transition={easeOut}
      viewport={{ margin: "-5% 0px", once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <h2 className="stats-tile__title">{title}</h2>
      {children}
    </m.section>
  );
}

/**
 * Properties accepted by the PlaceNames component.
 * @property {City[]} cities - The places, in order
 * @property {boolean} [isRoute] - Whether they are the stops of one journey
 */
interface PlaceNamesProps {
  cities: City[];
  isRoute?: boolean;
}

/**
 * PlaceNames component
 * Names places with their flags, an arrow between them when they are the two
 * ends of a journey.
 * @component
 * @param {PlaceNamesProps} props - The names props
 * @param {City[]} props.cities - The places, in order
 * @param {boolean} [props.isRoute=false] - Whether they are the stops of one journey
 * @returns {ReactNode} The names
 */
function PlaceNames({ cities, isRoute = false }: PlaceNamesProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);

  return (
    <span className="stats-tile__places">
      {cities.map((city, index) => (
        <span className="stats-tile__place" key={`${city.id}-${index}`}>
          {isRoute && index > 0 ? "→ " : null}
          <CountryFlag countryId={city.country.id} />
          {city.getLocalizedName(currLanguage)}
        </span>
      ))}
    </span>
  );
}

/**
 * Properties accepted by the Record component.
 * @property {ReactNode} icon - The record's icon
 * @property {string} label - What the record is
 * @property {string} value - The record itself
 * @property {ReactNode} [detail] - Who holds it
 * @property {string} [runnerUp] - The next best, as a line under it
 * @property {string} [to] - The trip page it links to
 * @property {() => void} [onPress] - Shows its place on the map
 */
interface RecordProps {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: ReactNode;
  runnerUp?: string;
  to?: string;
  onPress?: () => void;
}

/**
 * Record component
 * One superlative, such as the longest flight, as a row of the records tile,
 * leading to the trip or the place that holds it.
 * @component
 * @param {RecordProps} props - The record props
 * @param {ReactNode} props.icon - The record's icon
 * @param {string} props.label - What the record is
 * @param {string} props.value - The record itself
 * @param {ReactNode} [props.detail] - Who holds it
 * @param {string} [props.runnerUp] - The next best
 * @param {string} [props.to] - The trip page it links to
 * @param {() => void} [props.onPress] - Shows its place on the map
 * @returns {ReactNode} The record row
 */
function Record({
  icon,
  label,
  value,
  detail,
  runnerUp,
  to,
  onPress,
}: RecordProps): ReactNode {
  const content = (
    <>
      <span className="stats-tile__record-icon">{icon}</span>
      <span className="stats-tile__record-body">
        <span className="stats-tile__record-label">{label}</span>
        <span className="stats-tile__record-value">{value}</span>
        {detail ? (
          <span className="stats-tile__record-detail">{detail}</span>
        ) : null}
        {runnerUp ? (
          <span className="stats-tile__record-runner-up">{runnerUp}</span>
        ) : null}
      </span>
    </>
  );

  return (
    <li className="stats-tile__record">
      {to ? (
        <Link
          className="stats-tile__record-row stats-tile__record-row--link"
          to={to}
        >
          {content}
        </Link>
      ) : onPress ? (
        <button
          className="stats-tile__record-row stats-tile__record-row--link"
          onClick={onPress}
          type="button"
        >
          {content}
        </button>
      ) : (
        <span className="stats-tile__record-row">{content}</span>
      )}
    </li>
  );
}

/**
 * One column of a yearly chart.
 * @property {number} year - The year
 * @property {number} value - Its total
 */
interface YearValue {
  year: number;
  value: number;
}

/**
 * Properties accepted by the YearChart component.
 * @property {YearValue[]} years - Every year, oldest first
 * @property {(count: number) => string} unit - Writes a value with its unit, such as `12 days`
 */
interface YearChartProps {
  years: YearValue[];
  unit: (count: number) => string;
}

/**
 * YearChart component
 * A column per year, drawn with flexbox rather than a chart library, growing
 * from the baseline the first time it scrolls into view. A year with nothing
 * in it keeps its label but draws no bar. Hovering or tapping a year tells
 * its value in full and its share of every year together.
 * @component
 * @param {YearChartProps} props - The chart props
 * @param {YearValue[]} props.years - Every year, oldest first
 * @param {(count: number) => string} props.unit - Writes a value with its unit
 * @returns {ReactNode} The chart
 */
function YearChart({ years, unit }: YearChartProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { tip, triggerProps } = useTooltip();
  const max = Math.max(...years.map(({ value }) => value), 1);
  const total = years.reduce((sum, { value }) => sum + value, 0) || 1;

  /*
   * The list, not each bar, watches for the viewport: a bar that starts at
   * zero height has no area to intersect it.
   */
  return (
    <>
      <m.ol
        className="stats-tile__years"
        initial="hidden"
        viewport={{ once: true }}
        whileInView="visible"
      >
        {years.map(({ year, value }, index) => (
          <li
            className="stats-tile__year"
            key={year}
            {...triggerProps(
              String(year),
              <TooltipBody
                lines={[
                  unit(value),
                  t("stats.tooltip.share", {
                    share: Math.round((value / total) * 100).toLocaleString(
                      currLanguage,
                    ),
                  }),
                ]}
                title={year}
              />,
            )}
          >
            <span className="stats-tile__year-track">
              {/* The count above takes 1rem of the track; the bar scales in the rest. */}
              {value > 0 ? (
                <m.span
                  className="stats-tile__year-value"
                  transition={{ ...easeOut, delay: index * 0.03 + 0.4 }}
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  {value}
                </m.span>
              ) : null}
              {value > 0 ? (
                <m.span
                  className="stats-tile__year-bar"
                  style={{ height: `calc((100% - 1rem) * ${value / max})` }}
                  transition={{
                    ...easeOut,
                    delay: index * 0.03,
                    duration: 0.6,
                  }}
                  variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1 } }}
                />
              ) : null}
            </span>
            <span className="stats-tile__year-label">
              ’{String(year).slice(2)}
            </span>
          </li>
        ))}
      </m.ol>
      <Tooltip tip={tip} />
    </>
  );
}

/**
 * Properties accepted by the Planet component.
 * @property {"earth" | "moon"} body - Which picture to draw
 * @property {number} [delay] - Seconds to wait before it rolls in
 */
interface PlanetProps {
  body: "earth" | "moon";
  delay?: number;
}

/**
 * Planet component
 * The Earth or the Moon, rolling into place as it scrolls into view.
 * @component
 * @param {PlanetProps} props - The planet props
 * @param {"earth" | "moon"} props.body - Which picture to draw
 * @param {number} [props.delay=0] - Seconds to wait before it rolls in
 * @returns {ReactNode} The planet
 */
function Planet({ body, delay = 0 }: PlanetProps): ReactNode {
  const Picture = body === "earth" ? EarthFlat : MoonFlat;
  return (
    <m.span
      className="stats-tile__planet"
      initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
      transition={{ ...easeOut, delay, duration: 0.8 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
    >
      <Picture aria-hidden="true" className="stats-tile__planet-image" />
    </m.span>
  );
}

/**
 * Prints a distance in kilometres.
 * @param {number} km - The distance
 * @param {string} locale - The active locale
 * @returns {string} Such as `9,853 km`
 */
function kilometresIn(km: number, locale: string): string {
  return `${formatMileage(km, locale, 0)} km`;
}

/**
 * ContinentsTile component
 * One tile of the statistics bento: the map of continents with a bar per continent visited, coloured to match.
 * @component
 * @returns {ReactNode} The tile
 */
function ContinentsTile(): ReactNode {
  const { t } = useLanguage(["home"]);
  /*
   * Each continent group in the map reads its fill from one of these custom
   * properties, which `CSSProperties` has no keys for — hence the cast.
   */
  const visited = new Set(stats.continents.map(({ continent }) => continent));
  const continentFills = Object.fromEntries(
    Object.values(Continent).map((continent) => [
      `--fill-${continent.toLowerCase()}`,
      visited.has(continent)
        ? CONTINENT_COLORS[continent]
        : "var(--c-card-sunken)",
    ]),
  ) as CSSProperties;

  return (
    <Card area="continents" title={t("stats.byContinent")}>
      <div className="stats-tile__continents">
        <ContinentsMap
          aria-hidden="true"
          className="stats-tile__continents-map"
          style={continentFills}
        />
        <StatBars
          bars={stats.continents.map(({ continent, countries, cities }) => ({
            color: CONTINENT_COLORS[continent],
            display: `${t("stats.countryCount", { count: countries })} · ${t("stats.cityCount", { count: cities })}`,
            key: continent,
            label: t(`continents.${continent}`),
            value: countries,
          }))}
        />
      </div>
    </Card>
  );
}

/**
 * DistanceTile component
 * One tile of the statistics bento: the total distance, set against the Earth's circumference and the way to the Moon.
 * @component
 * @returns {ReactNode} The tile
 */
function DistanceTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const moonShare = Math.min(stats.toMoon, 1);

  return (
    <Card area="distance" title={t("stats.distance")}>
      <p className="stats-tile__distance">
        <CountUp locale={currLanguage} value={stats.km} />
        <span className="stats-tile__suffix">km</span>
      </p>
      <div className="stats-tile__journey">
        <Planet body="earth" />
        <span aria-hidden="true" className="stats-tile__journey-track">
          <m.span
            className="stats-tile__journey-fill"
            initial={{ scaleX: 0 }}
            style={{ width: `${moonShare * 100}%` }}
            transition={{ ...easeOut, delay: 0.3, duration: 1.2 }}
            viewport={{ once: true }}
            whileInView={{ scaleX: 1 }}
          />
        </span>
        <Planet body="moon" delay={0.15} />
      </div>
      <div className="stats-tile__journey-captions">
        <p className="stats-tile__journey-caption">
          <span className="stats-tile__journey-value">
            <CountUp
              decimals={1}
              locale={currLanguage}
              value={stats.aroundEarth}
            />
            ×
          </span>
          {t("stats.aroundEarth")}
        </p>
        <p className="stats-tile__journey-caption stats-tile__journey-caption--end">
          {stats.toMoon < 1 ? (
            <>
              <span className="stats-tile__journey-value">
                <CountUp locale={currLanguage} value={stats.toMoon * 100} />%
              </span>
              {t("stats.wayToMoon")}
            </>
          ) : (
            <>
              <span className="stats-tile__journey-value">
                <CountUp
                  decimals={2}
                  locale={currLanguage}
                  value={stats.toMoon}
                />
                ×
              </span>
              {t("stats.toMoon")}
            </>
          )}
        </p>
      </div>
    </Card>
  );
}

/**
 * WorldTile component
 * One tile of the statistics bento: the share of the world's countries visited, as a ring that fills to it.
 * @component
 * @returns {ReactNode} The tile
 */
function WorldTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const isReduced = useReducedMotionConfig() ?? false;

  return (
    <Card area="world" title={t("stats.world")}>
      <div className="stats-tile__world">
        <svg
          aria-hidden="true"
          className="stats-tile__ring"
          viewBox="0 0 120 120"
        >
          <circle className="stats-tile__ring-track" cx="60" cy="60" r="52" />
          <m.circle
            className="stats-tile__ring-fill"
            cx="60"
            cy="60"
            initial={{ pathLength: 0 }}
            r="52"
            transition={
              isReduced
                ? { duration: 0 }
                : { ...easeOut, delay: 0.2, duration: 1.2 }
            }
            viewport={{ once: true }}
            whileInView={{ pathLength: stats.countryShare }}
          />
        </svg>
        <p className="stats-tile__world-share">
          <span className="stats-tile__world-value">
            <CountUp
              decimals={1}
              locale={currLanguage}
              value={stats.countryShare * 100}
            />
            %
          </span>
          <span className="stats-tile__world-label">
            {t("stats.ofCountries", {
              count: stats.countries,
              total: stats.totalCountries,
            })}
          </span>
        </p>
      </div>
    </Card>
  );
}

/**
 * FlightTypesTile component
 * One tile of the statistics bento: the flights split into national,
 * international and intercontinental, as a donut sized by flights or by
 * kilometres beside a legend. A segment and its legend row highlight each other;
 * the rows are what a keyboard reaches, since the picture is one image to a
 * screen reader, which reads the same figures from a hidden table.
 * @component
 * @returns {ReactNode} The tile
 */
function FlightTypesTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const isReduced = useReducedMotionConfig() ?? false;
  const [measure, setMeasure] = useState<FlightMeasure>("count");
  const [activeType, setActiveType] = useState<TravelType | null>(null);
  const { tip, triggerProps } = useTooltip();
  const { count, types } = stats.flightTypes;
  const segments = getDonutSegments(types.map((type) => type[measure]));
  const rows = types.map((stat, index) => ({
    ...stat,
    name: t(`stats.flightTypes.type.${stat.type}`),
    segment: segments[index],
    share: stats.flightTypes[measure]
      ? (stat[measure] / stats.flightTypes[measure]) * 100
      : 0,
  }));

  return (
    <Card area="flightTypes" title={t("stats.flightTypes.title")}>
      <SegmentedControl
        id="flight-types"
        label={t("stats.flightTypes.measure")}
        onChange={setMeasure}
        options={[
          { label: t("stats.flightTypes.byCount"), value: "count" },
          { label: t("stats.flightTypes.byKm"), value: "km" },
        ]}
        value={measure}
      />
      <div className="stats-tile__flight-types">
        <div className="stats-tile__donut">
          <svg
            aria-label={t("stats.flightTypes.summary", {
              count,
              types: rows
                .map(({ name, count: flights, share, km }) =>
                  t("stats.flightTypes.row", {
                    count: flights,
                    km: formatMileage(km, currLanguage, 0),
                    share: Math.round(share),
                    type: name,
                  }),
                )
                .join("; "),
            })}
            className="stats-tile__ring"
            role="img"
            viewBox="0 0 120 120"
          >
            {rows.map(({ type, segment, name, count: flights, share, km }) =>
              segment.length > 0 ? (
                <m.circle
                  key={type}
                  {...triggerProps(
                    type,
                    <TooltipBody
                      lines={[
                        t("stats.tooltip.flights", { count: flights }),
                        kilometresIn(km, currLanguage),
                        t("stats.tooltip.share", {
                          share: Math.round(share).toLocaleString(currLanguage),
                        }),
                      ]}
                      swatch={`var(--c-flight-${type})`}
                      title={name}
                    />,
                  )}
                  className={classNames(
                    "stats-tile__donut-segment",
                    `stats-tile--${type}`,
                    activeType !== null &&
                      activeType !== type &&
                      "stats-tile__donut-segment--muted",
                  )}
                  cx="60"
                  cy="60"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  onMouseEnter={() => setActiveType(type)}
                  onMouseLeave={() => setActiveType(null)}
                  r="52"
                  transition={
                    isReduced ? { duration: 0 } : { ...easeOut, duration: 0.9 }
                  }
                  viewport={{ once: true }}
                  whileInView={{
                    pathLength: segment.length,
                    pathOffset: segment.offset,
                  }}
                />
              ) : null,
            )}
          </svg>
          <p className="stats-tile__donut-total">
            <span className="stats-tile__world-value">
              <CountUp locale={currLanguage} value={count} />
            </span>
            <span className="stats-tile__world-label">
              {t("stats.flightTypes.flights", { count })}
            </span>
          </p>
        </div>
        <ul className="stats-tile__flight-legend">
          {rows.map(({ type, name, count: flights, share, km }) => (
            <li key={type}>
              <button
                className={classNames(
                  "stats-tile__flight-row",
                  `stats-tile--${type}`,
                  activeType === type && "stats-tile__flight-row--active",
                )}
                onBlur={() => setActiveType(null)}
                onFocus={() => setActiveType(type)}
                onMouseEnter={() => setActiveType(type)}
                onMouseLeave={() => setActiveType(null)}
                type="button"
              >
                <span aria-hidden="true" className="stats-tile__flight-dot" />
                <span className="stats-tile__flight-name">{name}</span>
                <span className="stats-tile__flight-count">
                  <CountUp locale={currLanguage} value={flights} />
                </span>
                <span className="stats-tile__flight-detail">
                  <CountUp locale={currLanguage} value={share} />%{" · "}
                  <CountUp locale={currLanguage} value={km} /> km
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Tooltip tip={tip} />
      <table className="stats-tile__flight-table">
        <caption>{t("stats.flightTypes.title")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("stats.flightTypes.typeHeader")}</th>
            <th scope="col">{t("stats.flightTypes.byCount")}</th>
            <th scope="col">{t("stats.flightTypes.shareHeader")}</th>
            <th scope="col">{t("stats.flightTypes.byKm")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ type, name, count: flights, share, km }) => (
            <tr key={type}>
              <th scope="row">{name}</th>
              <td>{flights}</td>
              <td>{Math.round(share)}%</td>
              <td>{formatMileage(km, currLanguage, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/**
 * Gives a page a way to show a city on the map: the map flies there and opens
 * the city's card, with the bare map in front of it.
 * @returns {{ showCity: (city: City) => void }} The action
 */
function useShowCity(): { showCity: (city: City) => void } {
  const navigate = useNavigate();
  const { setHoveredCity, setMapPosition } = useMapInteraction();

  return {
    showCity: (city) => {
      setMapPosition({
        center: city.coordinates,
        zoom: parameters.map.hoveredCityZoom,
      });
      setHoveredCity(city);
      navigate("/", { state: { mapOnly: true } });
    },
  };
}

/**
 * Prints a latitude or longitude with its compass letter.
 * @param {number} degrees - The signed coordinate
 * @param {string} positive - The letter for a positive coordinate
 * @param {string} negative - The letter for a negative one
 * @param {string} locale - The active locale
 * @returns {string} Such as `59.33° N`
 */
function coordinateIn(
  degrees: number,
  positive: string,
  negative: string,
  locale: string,
): string {
  return `${formatMileage(Math.abs(degrees), locale)}° ${degrees < 0 ? negative : positive}`;
}

/**
 * Properties accepted by the EdgeCity component.
 * @property {"north" | "south" | "east" | "west"} edge - Which end of the map it is
 * @property {City} city - The city there
 */
interface EdgeCityProps {
  edge: "north" | "south" | "east" | "west";
  city: City;
}

/**
 * EdgeCity component
 * One point of the compass: the city at that end of the map, with its flag and
 * the coordinate that puts it there. Pressing it shows it on the map.
 * @component
 * @param {EdgeCityProps} props - The point's props
 * @param {"north" | "south" | "east" | "west"} props.edge - Which end of the map it is
 * @param {City} props.city - The city there
 * @returns {ReactNode} The compass point
 */
function EdgeCity({ edge, city }: EdgeCityProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { showCity } = useShowCity();
  const name = city.getLocalizedName(currLanguage);
  const [longitude, latitude] = city.coordinates;

  return (
    <button
      aria-label={t("stats.edges.showOnMap", { city: name })}
      className={classNames("stats-tile__edge", `stats-tile__edge--${edge}`)}
      onClick={() => showCity(city)}
      type="button"
    >
      <span className="stats-tile__edge-label">{t(`stats.edges.${edge}`)}</span>
      <span className="stats-tile__edge-name">
        <CountryFlag countryId={city.country.id} />
        {name}
      </span>
      <span className="stats-tile__edge-coordinate">
        {edge === "north" || edge === "south"
          ? coordinateIn(
              latitude,
              t("stats.edges.letter.N"),
              t("stats.edges.letter.S"),
              currLanguage,
            )
          : coordinateIn(
              longitude,
              t("stats.edges.letter.E"),
              t("stats.edges.letter.W"),
              currLanguage,
            )}
      </span>
    </button>
  );
}

/**
 * EdgesTile component
 * One tile of the statistics bento: the furthest cities slept in each way, laid
 * out as a compass around home, with how far apart they lie.
 * @component
 * @returns {ReactNode} The tile, or nothing before the first night away
 */
function EdgesTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { edges } = stats;
  const home = parameters.homeCity;
  if (!edges) return null;

  return (
    <Card area="edges" title={t("stats.edges.title")}>
      <div className="stats-tile__compass">
        <EdgeCity city={edges.north} edge="north" />
        <EdgeCity city={edges.west} edge="west" />
        <div className="stats-tile__compass-center">
          {home ? (
            <>
              <span className="stats-tile__edge-label">
                {t("stats.edges.home")}
              </span>
              <span className="stats-tile__edge-name">
                <CountryFlag countryId={home.country.id} />
                {home.getLocalizedName(currLanguage)}
              </span>
            </>
          ) : (
            <Compass aria-hidden="true" className="stats-tile__compass-mark" />
          )}
        </div>
        <EdgeCity city={edges.east} edge="east" />
        <EdgeCity city={edges.south} edge="south" />
      </div>
      <p className="stats-tile__note">
        {t("stats.edges.latitudeSpan", {
          degrees: formatMileage(edges.latitudeSpan, currLanguage, 0),
        })}
        <br />
        {t("stats.edges.longitudeSpan", {
          degrees: formatMileage(edges.longitudeSpan, currLanguage, 0),
        })}
      </p>
    </Card>
  );
}

/**
 * Properties accepted by the QuadrantCities component.
 * @property {string} label - The quarter's name
 * @property {City[]} cities - Every city slept in there, at least one
 */
interface QuadrantCitiesProps {
  label: string;
  cities: City[];
}

/**
 * QuadrantCities component
 * A quarter's first two cities, and for the rest a "+N more" that opens a
 * frosted list of every city slept in that quarter.
 * @component
 * @param {QuadrantCitiesProps} props - The cities props
 * @param {string} props.label - The quarter's name
 * @param {City[]} props.cities - Every city slept in there
 * @returns {ReactNode} The cities
 */
function QuadrantCities({ label, cities }: QuadrantCitiesProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <span className="stats-tile__quadrant-cities">
      <PlaceNames cities={cities.slice(0, 2)} />
      {cities.length > 2 ? (
        <>
          {" "}
          <button
            aria-expanded={anchor !== null}
            aria-haspopup="dialog"
            className="stats-tile__more"
            onClick={(event) =>
              setAnchor(
                anchor ? null : event.currentTarget.getBoundingClientRect(),
              )
            }
            ref={triggerRef}
            type="button"
          >
            {t("stats.hemispheres.more", { count: cities.length - 2 })}
          </button>
          <Popover
            anchor={anchor}
            label={t("stats.hemispheres.citiesIn", { quarter: label })}
            onClose={() => setAnchor(null)}
            placement="below"
            triggerRef={triggerRef}
          >
            <ul className="stats-tile__city-list">
              {cities.map((city) => (
                <li className="stats-tile__city-item" key={city.id}>
                  <CountryFlag countryId={city.country.id} />
                  {city.getLocalizedName(currLanguage)}
                </li>
              ))}
            </ul>
          </Popover>
        </>
      ) : null}
    </span>
  );
}

/**
 * HemispheresTile component
 * One tile of the statistics bento: the four quarters of the globe, each with a
 * couple of the cities slept in there and the rest a press away, or muted until
 * one is.
 * @component
 * @returns {ReactNode} The tile
 */
function HemispheresTile(): ReactNode {
  const { t } = useLanguage(["home"]);
  const { halves, quadrants } = stats.hemispheres;

  return (
    <Card area="hemispheres" title={t("stats.hemispheres.title")}>
      <ul className="stats-tile__quadrants">
        {quadrants.map(({ id, cities }) => (
          <li
            className={classNames(
              "stats-tile__quadrant",
              cities.length === 0 && "stats-tile__quadrant--empty",
            )}
            key={id}
          >
            <span className="stats-tile__edge-label">
              {t(`stats.hemispheres.${id}`)}
            </span>
            {cities.length > 0 ? (
              <QuadrantCities
                cities={cities}
                label={t(`stats.hemispheres.${id}`)}
              />
            ) : (
              <span className="stats-tile__quadrant-cities">
                {t("stats.hemispheres.notYet")}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="stats-tile__note">
        {t("stats.hemispheres.halves", halves)}
      </p>
    </Card>
  );
}

/**
 * LinesTile component
 * One tile of the statistics bento: the lines every globe has, how many times
 * the routes crossed each, and on which trips.
 * @component
 * @returns {ReactNode} The tile
 */
function LinesTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);

  return (
    <Card area="lines" title={t("stats.lines.title")}>
      <ul className="stats-tile__lines">
        {stats.crossings.map(({ id, count, trips }) => (
          <li
            className={classNames(
              "stats-tile__line",
              count === 0 && "stats-tile__line--empty",
            )}
            key={id}
          >
            <span className="stats-tile__line-body">
              <span className="stats-tile__line-name">
                {t(`stats.lines.${id}`)}
              </span>
              <span className="stats-tile__line-trips">
                {trips[0]
                  ? trips[0].getLocalizedTitle(currLanguage)
                  : t("stats.lines.notYet")}
                {trips.length > 1
                  ? ` ${t("stats.lines.more", { count: trips.length - 1 })}`
                  : null}
              </span>
            </span>
            {count > 0 ? (
              <span className="stats-tile__line-count">×{count}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}

const RECORD_ICONS: { [id in RecordId]: LucideIcon } = {
  biggestZoneJump: Clock,
  furthestCity: MapPinned,
  longestFerry: Ship,
  longestFlight: Plane,
  longestLayover: Hourglass,
  longestOverland: TrainFront,
};

/**
 * Properties accepted by the TravelRecordRow component.
 * @property {TravelRecord} record - The record
 */
interface TravelRecordRowProps {
  record: TravelRecord;
}

/**
 * TravelRecordRow component
 * A computed record in words: the figure, who holds it, the runner-up beneath,
 * leading to the holder's place or trip.
 * @component
 * @param {TravelRecordRowProps} props - The row props
 * @param {TravelRecord} props.record - The record
 * @returns {ReactNode} The record row
 */
function TravelRecordRow({ record }: TravelRecordRowProps): ReactNode {
  const { id, unit, best, runnerUp } = record;
  const { t, currLanguage } = useLanguage(["home"]);
  const { showCity } = useShowCity();
  const Icon = RECORD_ICONS[id];

  /**
   * Prints a record's figure in its own unit.
   * @param {number} value - The figure
   * @returns {string} The figure in words
   */
  const figure = (value: number): string =>
    unit === "km" ? kilometresIn(value, currLanguage) : formatDuration(value);

  /**
   * Names who holds a record: the ride or layover, else the place, else the trip.
   * @param {RecordHolder} holder - The holder
   * @returns {string} Its name
   */
  const subject = (holder: RecordHolder): string =>
    holder.route
      ? holder.route
          .map((stop) => stop.getLocalizedName(currLanguage))
          .join(" → ")
      : (holder.city?.getLocalizedName(currLanguage) ??
        holder.trip?.getLocalizedTitle(currLanguage) ??
        "");

  const { city, trip } = best;

  return (
    <Record
      detail={
        <PlaceNames
          cities={best.route ?? (best.city ? [best.city] : [])}
          isRoute={(best.route?.length ?? 0) > 1}
        />
      }
      icon={<Icon aria-hidden="true" />}
      label={t(`stats.${id}`)}
      onPress={city ? () => showCity(city) : undefined}
      runnerUp={
        runnerUp
          ? `${t("stats.runnerUp")} · ${subject(runnerUp)} · ${figure(runnerUp.value)}`
          : undefined
      }
      to={trip && !city ? `/trip/${encodeURIComponent(trip.id)}` : undefined}
      value={figure(best.value)}
    />
  );
}

/**
 * RecordsTile component
 * One tile of the statistics bento: the few superlatives a chart cannot say
 * better, each a single ride, wait or place. One the dataset cannot support is
 * left out.
 * @component
 * @returns {ReactNode} The tile
 */
function RecordsTile(): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <Card area="records" title={t("stats.records")}>
      <ul className="stats-tile__records">
        {stats.records.map((record) => (
          <TravelRecordRow key={record.id} record={record} />
        ))}
        <Record
          icon={<Clock aria-hidden="true" />}
          label={t("stats.timezones")}
          value={String(stats.timezones)}
        />
        {stats.unesco > 0 ? (
          <Record
            icon={<Landmark aria-hidden="true" />}
            label={t("stats.unesco")}
            value={String(stats.unesco)}
          />
        ) : null}
      </ul>
    </Card>
  );
}

/**
 * TopTripsTile component
 * One tile of the statistics bento: the biggest trips as a bar chart, by how
 * long they lasted or how many places they saw. Each bar's name opens its trip.
 * @component
 * @returns {ReactNode} The tile
 */
function TopTripsTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const [measure, setMeasure] = useState<TripMeasure>("days");

  return (
    <Card area="topTrips" title={t("stats.topTrips.title")}>
      <SegmentedControl
        id="top-trips"
        label={t("stats.topTrips.title")}
        onChange={setMeasure}
        options={(["days", "cities"] as const).map((value) => ({
          label: t(`stats.topTrips.${value}`),
          value,
        }))}
        value={measure}
      />
      <StatBars
        bars={stats.tripRankings[measure].map(({ trip, value }) => ({
          color: "var(--c-blue)",
          display:
            measure === "days"
              ? `${value} ${t("stats.daysUnit", { count: value })}`
              : t("stats.cityCount", { count: value }),
          key: trip.id,
          label: (
            <Link
              className="stats-tile__bar-link"
              to={`/trip/${encodeURIComponent(trip.id)}`}
            >
              {trip.getLocalizedTitle(currLanguage)}
              <span className="stats-tile__trip-flags">
                {trip.getCountriesVisited().map((country) => (
                  <CountryFlag countryId={country.id} key={country.id} />
                ))}
              </span>
            </Link>
          ),
          value,
        }))}
        key={measure}
      />
    </Card>
  );
}

/**
 * TopPlacesTile component
 * One tile of the statistics bento: the places slept in as a bar chart, by
 * nights, by returns, or by photos. A measure nothing scores on is not offered.
 * Each bar's name shows its place on the map.
 * @component
 * @returns {ReactNode} The tile, or nothing before the first night away
 */
function TopPlacesTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { showCity } = useShowCity();
  const options = (["nights", "visits", "photos"] as const).filter(
    (value) => stats.placeRankings[value].length > 0,
  );
  const [chosen, setChosen] = useState<PlaceMeasure | null>(null);
  const measure = chosen ?? options[0];
  if (!measure) return null;

  /**
   * Prints a place's score in the chosen measure.
   * @param {number} count - The score
   * @returns {string} The score in words
   */
  const scoreOf = (count: number): string => {
    switch (measure) {
      case "nights":
        return t("common:stay.nightsCount", { count });
      case "photos":
        return t("stats.photoCount", { count });
      case "visits":
        return t("stats.visitCount", { count });
    }
  };

  return (
    <Card area="topPlaces" title={t("stats.topPlaces.title")}>
      <SegmentedControl
        id="top-places"
        label={t("stats.topPlaces.title")}
        onChange={setChosen}
        options={options.map((value) => ({
          label: t(`stats.topPlaces.${value}`),
          value,
        }))}
        value={measure}
      />
      <StatBars
        bars={stats.placeRankings[measure].map(({ city, value }) => ({
          color: "var(--c-green)",
          display: scoreOf(value),
          key: city.id,
          label: (
            <button
              className="stats-tile__bar-link"
              onClick={() => showCity(city)}
              type="button"
            >
              <CountryFlag countryId={city.country.id} />
              {city.getLocalizedName(currLanguage)}
            </button>
          ),
          value,
        }))}
        key={measure}
      />
    </Card>
  );
}

/**
 * Prints a time of day on the reader's clock.
 * @param {number} minute - Minutes since midnight
 * @param {string} locale - The active locale
 * @returns {string} Such as `05:45`
 */
function clockIn(minute: number, locale: string): string {
  return new Date(
    2000,
    0,
    1,
    Math.floor(minute / 60),
    minute % 60,
  ).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

/**
 * ClockTile component
 * One tile of the statistics bento: the hours of the day the journeys left and
 * arrived, departures rising from a shared baseline and arrivals hanging from
 * it, with the earliest start and the latest finish beneath. Every hour reads on
 * the clock of the city it happened in.
 * @component
 * @returns {ReactNode} The tile, or nothing when no ride recorded a time
 */
function ClockTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { tip, triggerProps } = useTooltip();
  const { arrivals, departures, earliest, latest } = stats.clock;
  if (!earliest && !latest) return null;

  const max = Math.max(...departures, ...arrivals, 1);
  const hours = departures.map((left, hour) => ({
    arrived: arrivals[hour],
    hour,
    label: clockIn(hour * 60, currLanguage),
    left,
  }));

  return (
    <Card area="clock" title={t("stats.clock.title")}>
      <p className="stats-tile__clock-legend">
        <span className="stats-tile__clock-key stats-tile__clock-key--departures">
          {t("stats.clock.departures")}
        </span>
        <span className="stats-tile__clock-key stats-tile__clock-key--arrivals">
          {t("stats.clock.arrivals")}
        </span>
      </p>
      {/* The chart, not each bar, watches for the viewport, as a bar at zero has no area. */}
      <m.div
        aria-label={hours
          .filter(({ arrived, left }) => arrived + left > 0)
          .map(({ arrived, label, left }) =>
            t("stats.clock.hour", {
              arrivals: arrived,
              departures: left,
              hour: label,
            }),
          )
          .join("; ")}
        className="stats-tile__clock"
        initial="hidden"
        role="img"
        viewport={{ once: true }}
        whileInView="visible"
      >
        {hours.map(({ arrived, hour, label, left }) => (
          <div
            className="stats-tile__clock-hour"
            key={hour}
            {...triggerProps(
              String(hour),
              <TooltipBody
                lines={[
                  t("stats.tooltip.departures", { count: left }),
                  t("stats.tooltip.arrivals", { count: arrived }),
                ]}
                title={`${label}–${clockIn(((hour + 1) % 24) * 60, currLanguage)}`}
              />,
            )}
          >
            <span className="stats-tile__clock-side stats-tile__clock-side--departures">
              <m.span
                className="stats-tile__clock-bar stats-tile__clock-bar--departures"
                style={{ height: `${(left / max) * 100}%` }}
                transition={{ ...easeOut, delay: hour * 0.015, duration: 0.5 }}
                variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1 } }}
              />
            </span>
            <span className="stats-tile__clock-side stats-tile__clock-side--arrivals">
              <m.span
                className="stats-tile__clock-bar stats-tile__clock-bar--arrivals"
                style={{ height: `${(arrived / max) * 100}%` }}
                transition={{ ...easeOut, delay: hour * 0.015, duration: 0.5 }}
                variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1 } }}
              />
            </span>
            {hour % 6 === 0 ? (
              <span aria-hidden="true" className="stats-tile__clock-tick">
                {label}
              </span>
            ) : null}
          </div>
        ))}
      </m.div>
      <Tooltip tip={tip} />
      <ul className="stats-tile__records stats-tile__records--pair">
        {earliest ? (
          <Record
            detail={
              <PlaceNames cities={[earliest.from, earliest.to]} isRoute />
            }
            icon={<Sunrise aria-hidden="true" />}
            label={t("stats.clock.earliest")}
            to={`/trip/${encodeURIComponent(earliest.trip.id)}`}
            value={clockIn(earliest.minute, currLanguage)}
          />
        ) : null}
        {latest ? (
          <Record
            detail={<PlaceNames cities={[latest.from, latest.to]} isRoute />}
            icon={<Moon aria-hidden="true" />}
            label={t("stats.clock.latest")}
            to={`/trip/${encodeURIComponent(latest.trip.id)}`}
            value={clockIn(latest.minute, currLanguage)}
          />
        ) : null}
      </ul>
    </Card>
  );
}

/**
 * Properties accepted by the OperatorGroup component.
 * @property {OperatorGroupStat} group - The kind of transport and its operators
 */
interface OperatorGroupProps {
  group: OperatorGroupStat;
}

/**
 * OperatorGroup component
 * One kind of operator under its own heading, each with its logo and how many
 * journeys it carried.
 * @component
 * @param {OperatorGroupProps} props - The group props
 * @param {OperatorGroupStat} props.group - The kind of transport and its operators
 * @returns {ReactNode} The group
 */
function OperatorGroup({ group }: OperatorGroupProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const { companies, mode } = group;

  return (
    <section className="stats-tile__operator-group">
      <h3 className="stats-tile__operator-heading">
        <TransportModeIcon mode={mode} />
        {t(`stats.operatorGroup.${mode}`)}
      </h3>
      <ul className="stats-tile__operators">
        {companies.slice(0, 12).map(({ company, count }) => {
          const { name, logo } = resolveCompany(company);
          return (
            <li className="stats-tile__operator" key={company}>
              {logo ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="stats-tile__operator-logo"
                  src={logo}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="stats-tile__operator-logo"
                />
              )}
              <span className="stats-tile__operator-name">{name}</span>
              <span className="stats-tile__operator-count">×{count}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * OperatorsTile component
 * One tile of the statistics bento: the companies used, kept apart by what they
 * run, since a flight and a crossing are not rivals for the same place.
 * @component
 * @returns {ReactNode} The tile
 */
function OperatorsTile(): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <Card area="operators" title={t("stats.operators")}>
      <div className="stats-tile__operator-groups">
        {stats.operators.map((group) => (
          <OperatorGroup group={group} key={group.mode} />
        ))}
      </div>
    </Card>
  );
}

/**
 * StatsPage component
 * The record in numbers as one bento grid: every figure and chart is a tile
 * on the same columns, so their edges line up, laid out unevenly on purpose —
 * the headline numbers beside the map, the distance set against the Earth and
 * the Moon, the habits stacked beside the years — and rearranged for the room
 * the page actually has.
 * @component
 * @returns {ReactNode} The statistics page
 */
export function StatsPage(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);

  if (stats.trips === 0)
    return (
      <PanelFrame
        header={
          <PanelHeader surface="page" title={t("stats.title")}>
            <JournalSwitcher />
          </PanelHeader>
        }
      >
        <div className="stats-page">
          <EmptyState message={t("stats.empty")} />
        </div>
      </PanelFrame>
    );

  return (
    <PanelFrame
      header={
        <PanelHeader surface="page" title={t("stats.title")}>
          <JournalSwitcher />
        </PanelHeader>
      }
    >
      <div className="stats-page">
        <div className="stats-page__bento">
          <Figure
            area="f1"
            icon={Globe}
            label={t("stats.countries")}
            suffix={`/ ${stats.totalCountries}`}
            value={stats.countries}
          />
          <Figure
            area="f2"
            icon={Building2}
            label={t("stats.cities")}
            value={stats.cities}
          />
          <Figure
            area="f3"
            icon={Route}
            label={t("stats.trips")}
            value={stats.trips}
          />
          <Figure
            area="f4"
            icon={BedDouble}
            label={t("stats.nights")}
            value={stats.nights}
          />
          <Figure
            area="f5"
            icon={Milestone}
            label={t("stats.km")}
            value={stats.km}
          />
          <Figure
            area="f6"
            icon={Earth}
            label={t("stats.continents")}
            suffix={`/ ${stats.totalContinents}`}
            value={stats.visitedContinents}
          />
          <Figure
            area="h1"
            icon={CalendarDays}
            isInline
            label={t("stats.avgTrip")}
            suffix={t("stats.daysUnit", { count: stats.avgTripDays })}
            value={stats.avgTripDays}
          />
          <Figure
            area="h2"
            icon={Sunrise}
            isInline
            label={t("stats.yearsTraveling")}
            value={stats.yearsTraveling}
          />
          <Figure
            area="h3"
            icon={Camera}
            isInline
            label={t("stats.photos")}
            value={stats.photos}
          />

          <Card area="currencies" title={t("stats.currencies")}>
            <ul className="stats-tile__chips">
              {stats.currencies.map((country) => {
                const currency = getCurrencyDisplay(country, currLanguage);
                return (
                  <li className="stats-tile__chip" key={currency.code}>
                    <CountryFlag countryId={currency.countryId} />
                    <span className="stats-tile__chip-symbol">
                      {currency.symbol}
                    </span>
                    {currency.name}
                  </li>
                );
              })}
            </ul>
          </Card>

          <ContinentsTile />

          <DistanceTile />

          <WorldTile />

          <Card area="countries" title={t("stats.byCountry")}>
            <StatBars
              bars={stats.countriesByCities
                .slice(0, 8)
                .map(({ country, cities }) => ({
                  display: String(cities),
                  key: country.id,
                  label: (
                    <>
                      <CountryFlag countryId={country.id} />
                      {country.getLocalizedName(currLanguage)}
                    </>
                  ),
                  value: cities,
                }))}
            />
          </Card>

          <Card area="modes" title={t("stats.modes")}>
            <StatBars
              bars={stats.modes.map(({ mode, count, km, minutes }) => ({
                color: MODE_COLORS[mode],
                display: `${kilometresIn(km, currLanguage)} · ${formatDuration(minutes)}`,
                key: mode,
                label: (
                  <>
                    <TransportModeIcon mode={mode} />
                    {t(`trip.mode.${mode}`, { count })}
                  </>
                ),
                value: count,
              }))}
            />
          </Card>

          {stats.flightTypes.count > 0 ? <FlightTypesTile /> : null}

          <TopTripsTile />

          <TopPlacesTile />

          <RecordsTile />

          <ClockTile />

          <EdgesTile />

          <HemispheresTile />

          <LinesTile />

          <Card area="days" title={t("stats.daysPerYear")}>
            <YearChart
              unit={(count) => t("stats.tooltip.days", { count })}
              years={stats.perYear.map(({ year, days }) => ({
                value: days,
                year,
              }))}
            />
          </Card>

          <Card area="trips" title={t("stats.tripsPerYear")}>
            <YearChart
              unit={(count) => t("stats.tooltip.trips", { count })}
              years={stats.perYear.map(({ year, trips }) => ({
                value: trips,
                year,
              }))}
            />
          </Card>

          {stats.operators.length > 0 ? <OperatorsTile /> : null}
        </div>
      </div>
    </PanelFrame>
  );
}
