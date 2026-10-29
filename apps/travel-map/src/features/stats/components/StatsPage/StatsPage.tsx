import "./StatsPage.scss";

import { Continent, Ferry, Flight } from "@travelmap/core";
import { animate, m, useInView } from "framer-motion";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Clock,
  Earth,
  Globe,
  Landmark,
  LucideIcon,
  MapPinned,
  Milestone,
  Plane,
  Route,
  Ship,
  Sunrise,
} from "lucide-react";
import { CSSProperties, ReactNode, useEffect, useRef } from "react";

import ContinentsMap from "@/assets/icons/Continents.svg?react";
import EarthFlat from "@/assets/icons/EarthFlat.svg?react";
import MoonFlat from "@/assets/icons/MoonFlat.svg?react";
import { resolveCompany } from "@/data/companies";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { PanelFrame } from "@/shared/components/PanelFrame/PanelFrame";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { CONTINENT_COLORS } from "@/shared/lib/continentColors";
import { formatDuration, formatMileage } from "@/shared/lib/format";
import { MODE_COLORS } from "@/shared/lib/modeColors";
import { easeOut } from "@/shared/lib/motion";

import { getCurrencyDisplay } from "../../lib/countries";
import { stats } from "../../lib/stats";
import { StatBars } from "../StatBars/StatBars";

/** Which tile of the bento a card is, which decides how many columns it spans. */
type TileArea =
  | "continents"
  | "countries"
  | "currencies"
  | "days"
  | "distance"
  | "modes"
  | "records"
  | "operators"
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
     * straight to its final value.
     */
    if (hasCountedRef.current) {
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
  }, [decimals, isInView, locale, value]);

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
 * Properties accepted by the Record component.
 * @property {ReactNode} icon - The record's icon
 * @property {string} label - What the record is
 * @property {string} value - The record itself
 * @property {string} [detail] - A line under it
 */
interface RecordProps {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
}

/**
 * Record component
 * One superlative, such as the longest flight, as a row of the records tile.
 * @component
 * @param {RecordProps} props - The record props
 * @param {ReactNode} props.icon - The record's icon
 * @param {string} props.label - What the record is
 * @param {string} props.value - The record itself
 * @param {string} [props.detail] - A line under it
 * @returns {ReactNode} The record row
 */
function Record({ icon, label, value, detail }: RecordProps): ReactNode {
  return (
    <li className="stats-tile__record">
      <span className="stats-tile__record-icon">{icon}</span>
      <span className="stats-tile__record-body">
        <span className="stats-tile__record-label">{label}</span>
        <span className="stats-tile__record-value">{value}</span>
        {detail ? (
          <span className="stats-tile__record-detail">{detail}</span>
        ) : null}
      </span>
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
 */
interface YearChartProps {
  years: YearValue[];
}

/**
 * YearChart component
 * A column per year, drawn with flexbox rather than a chart library, growing
 * from the baseline the first time it scrolls into view. A year with nothing
 * in it keeps its label but draws no bar.
 * @component
 * @param {YearChartProps} props - The chart props
 * @param {YearValue[]} props.years - Every year, oldest first
 * @returns {ReactNode} The chart
 */
function YearChart({ years }: YearChartProps): ReactNode {
  const max = Math.max(...years.map(({ value }) => value), 1);

  return (
    /*
     * The list, not each bar, watches for the viewport: a bar that starts at
     * zero height has no area to intersect it.
     */
    <m.ol
      className="stats-tile__years"
      initial="hidden"
      viewport={{ once: true }}
      whileInView="visible"
    >
      {years.map(({ year, value }, index) => (
        <li className="stats-tile__year" key={year}>
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
                transition={{ ...easeOut, delay: index * 0.03, duration: 0.6 }}
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
 * Prints a ride's two ends, for a record's detail line.
 * @param {Flight | Ferry} ride - The ride
 * @param {string} locale - The active locale
 * @returns {string} `From → To`
 */
function routeOf(ride: Flight | Ferry, locale: string): string {
  return `${ride.sCity.getLocalizedName(locale)} → ${ride.eCity.getLocalizedName(locale)}`;
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
            transition={{ ...easeOut, delay: 0.2, duration: 1.2 }}
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
 * RecordsTile component
 * One tile of the statistics bento: the superlatives: longest and shortest flight, longest ferry, furthest place, time zones and UNESCO sites.
 * @component
 * @returns {ReactNode} The tile
 */
function RecordsTile(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);

  return (
    <Card area="records" title={t("stats.records")}>
      <ul className="stats-tile__records">
        {stats.longestFlight ? (
          <Record
            detail={routeOf(stats.longestFlight, currLanguage)}
            icon={<Plane aria-hidden="true" />}
            label={t("stats.longestFlight")}
            value={kilometresIn(stats.longestFlight.distanceInKm, currLanguage)}
          />
        ) : null}
        {stats.shortestFlight ? (
          <Record
            detail={routeOf(stats.shortestFlight, currLanguage)}
            icon={<Plane aria-hidden="true" />}
            label={t("stats.shortestFlight")}
            value={kilometresIn(
              stats.shortestFlight.distanceInKm,
              currLanguage,
            )}
          />
        ) : null}
        {stats.longestFerry ? (
          <Record
            detail={routeOf(stats.longestFerry, currLanguage)}
            icon={<Ship aria-hidden="true" />}
            label={t("stats.longestFerry")}
            value={kilometresIn(stats.longestFerry.distanceInKm, currLanguage)}
          />
        ) : null}
        {stats.furthestCity ? (
          <Record
            icon={<MapPinned aria-hidden="true" />}
            label={t("stats.furthestCity")}
            value={stats.furthestCity.getLocalizedName(currLanguage)}
          />
        ) : null}
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
 * OperatorsTile component
 * One tile of the statistics bento: the airlines and ferry lines used, most used first, with their logos.
 * @component
 * @returns {ReactNode} The tile
 */
function OperatorsTile(): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <Card area="operators" title={t("stats.operators")}>
      <ul className="stats-tile__operators">
        {stats.companies.slice(0, 12).map(({ company, count }) => {
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
      <PanelFrame header={<PageHeader title={t("stats.title")} />}>
        <div className="stats-page">
          <EmptyState message={t("stats.empty")} />
        </div>
      </PanelFrame>
    );

  return (
    <PanelFrame header={<PageHeader title={t("stats.title")} />}>
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
                const currency = getCurrencyDisplay(country, t);
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

          <RecordsTile />

          <Card area="days" title={t("stats.daysPerYear")}>
            <YearChart
              years={stats.perYear.map(({ year, days }) => ({
                value: days,
                year,
              }))}
            />
          </Card>

          <Card area="trips" title={t("stats.tripsPerYear")}>
            <YearChart
              years={stats.perYear.map(({ year, trips }) => ({
                value: trips,
                year,
              }))}
            />
          </Card>

          {stats.companies.length > 0 ? <OperatorsTile /> : null}
        </div>
      </div>
    </PanelFrame>
  );
}
