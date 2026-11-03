import "./PassportPage.scss";

import { Continent } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { EmptyState } from "@travelmap/ui/components/EmptyState/EmptyState";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDateRangeShort, formatMonthYear } from "@travelmap/ui/i18n/date";
import { classNames } from "@travelmap/ui/lib/classNames";
import {
  catalogueNameById,
  STAMP_CATALOGUE,
  stampName,
} from "@travelmap/ui/stamps/catalogue";
import { passportCoverOf } from "@travelmap/ui/stamps/covers";
import { EmblemSet } from "@travelmap/ui/stamps/emblems";
import { stampTilt } from "@travelmap/ui/stamps/frames";
import { Stamp, StampEmblem, StampInk } from "@travelmap/ui/stamps/Stamp";
import { Globe } from "lucide-react";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import {
  futureCities,
  futureTrips,
  homeCity,
  siteConfig,
  visitedTrips,
} from "@/data/world";
import { JournalSwitcher } from "@/shared/components/JournalSwitcher/JournalSwitcher";
import { useResponsive } from "@/shared/hooks/useResponsive";

import {
  buildPassport,
  IssuingCountry,
  Passport,
  PassportPage as ContinentPage,
  PassportSlot,
  StampSlot,
} from "../../lib/passport";
import { Booklet } from "../Booklet/Booklet";
import { useEmblems } from "./PassportPage.emblems";

/**
 * Properties accepted by the SlotView component.
 * @property {PassportSlot} slot - The slot
 * @property {EmblemSet} emblems - The drawings that have arrived
 * @property {(slot: StampSlot) => void} onSelect - Shows the stamp's country among the places
 */
interface SlotViewProps {
  slot: PassportSlot;
  emblems: EmblemSet;
  onSelect: (slot: StampSlot) => void;
}

/**
 * SlotView component
 * One of a page's places: a stamp to press, or a pencil sketch of a planned
 * visit. Each sits a little off its square by the same hash that tilts it, so a
 * page reads as stamped by hand rather than laid out on a grid.
 * @component
 * @param {SlotViewProps} props - The slot props
 * @param {PassportSlot} props.slot - The slot
 * @param {EmblemSet} props.emblems - The drawings that have arrived
 * @param {(slot: StampSlot) => void} props.onSelect - Shows the stamp's country among the places
 * @returns {ReactNode} The slot
 */
function SlotView({ slot, emblems, onSelect }: SlotViewProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const tilt = stampTilt(slot.id);
  /* CSSProperties has no keys for custom properties, hence the cast. */
  const offset = {
    "--slot-x": `${tilt * 1.4}%`,
    "--slot-y": `${-tilt * 1.1}%`,
  } as CSSProperties;
  const look = {
    emblem: slot.emblem ? emblems[slot.emblem] : undefined,
    frame: slot.frame,
    id: slot.id,
    name: slot.name,
    textStyle: slot.textStyle,
  };

  switch (slot.kind) {
    case "stamp": {
      const first = slot.entries[0];
      const date = first
        ? formatDateRangeShort({ locale: currLanguage, sDateInput: first.date })
        : "";
      const city = first?.city.getLocalizedName(currLanguage) ?? "";
      return (
        <button
          aria-label={t("passport.stampLabel", {
            city,
            count: slot.entries.length,
            date,
            name: slot.name,
          })}
          className="passport-slot passport-slot--stamp"
          onClick={() => onSelect(slot)}
          style={offset}
          type="button"
        >
          <Stamp {...look} color={slot.country.color} lines={[date, city]} />
          {slot.entries.length > 1 ? (
            <span aria-hidden="true" className="passport-slot__badge">
              ×{slot.entries.length}
            </span>
          ) : null}
        </button>
      );
    }
    case "planned":
      return (
        <div className="passport-slot" style={offset}>
          <Stamp
            {...look}
            color={slot.country.color}
            isPencil
            lines={[
              t("passport.planned"),
              ...(slot.date ? [formatMonthYear(slot.date, currLanguage)] : []),
            ]}
          />
        </div>
      );
  }
}

/**
 * Properties accepted by the IssuingPage component.
 * @property {IssuingCountry} issuing - The home country
 * @property {Passport} passport - The whole booklet, for its totals
 * @property {EmblemSet} emblems - The drawings that have arrived
 * @property {(slot: StampSlot) => void} onSelect - Shows the home country among the places
 */
interface IssuingPageProps {
  issuing: IssuingCountry;
  passport: Passport;
  emblems: EmblemSet;
  onSelect: (slot: StampSlot) => void;
}

/**
 * IssuingPage component
 * The booklet's first page: the country that issued the passport, which is home
 * and so is never a visit, with the holder's totals under it.
 * @component
 * @param {IssuingPageProps} props - The page props
 * @param {IssuingCountry} props.issuing - The home country
 * @param {Passport} props.passport - The whole booklet, for its totals
 * @param {EmblemSet} props.emblems - The drawings that have arrived
 * @param {(slot: StampSlot) => void} props.onSelect - Shows the home country among the places
 * @returns {ReactNode} The page
 */
function IssuingPage({
  issuing,
  passport,
  emblems,
  onSelect,
}: IssuingPageProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { city, slot } = issuing;

  return (
    <section className="passport-sheet passport-sheet--issuing">
      <p className="passport-sheet__eyebrow">{t("passport.issuing")}</p>
      <button
        aria-label={t("passport.issuingLabel", { name: slot.name })}
        className="passport-slot passport-slot--stamp passport-slot--issuing"
        onClick={() => onSelect(slot)}
        type="button"
      >
        <Stamp
          color={slot.country.color}
          emblem={slot.emblem ? emblems[slot.emblem] : undefined}
          frame={slot.frame}
          id={slot.id}
          lines={[city.getLocalizedName(currLanguage)]}
          name={slot.name}
          textStyle={slot.textStyle}
        />
      </button>
      <h2 className="passport-sheet__holder">
        <CountryFlag
          className="passport-sheet__flag"
          countryId={slot.country.id}
        />
        {slot.name}
      </h2>
      <dl className="passport-sheet__totals">
        <div className="passport-sheet__total">
          <dt>{t("passport.totals.stamps")}</dt>
          <dd>{passport.stamps}</dd>
        </div>
        <div className="passport-sheet__total">
          <dt>{t("passport.totals.continents")}</dt>
          <dd>{passport.continentsEntered}</dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * Properties accepted by the SlotsPage component.
 * @property {ContinentPage} page - The page
 * @property {boolean} isSingle - Whether one page shows at a time, two stamps to a row
 * @property {string} folio - The line at its head
 * @property {EmblemSet} emblems - The drawings that have arrived
 * @property {(slot: StampSlot) => void} onSelect - Shows a stamp's country among the places
 */
interface SlotsPageProps {
  page: ContinentPage;
  isSingle: boolean;
  folio: string;
  emblems: EmblemSet;
  onSelect: (slot: StampSlot) => void;
}

/**
 * SlotsPage component
 * A page of a continent, its stamps in loose columns, three to a row with two
 * pages open and two to a row on a page alone, and its folio at the head.
 * @component
 * @param {SlotsPageProps} props - The page props
 * @param {ContinentPage} props.page - The page
 * @param {boolean} props.isSingle - Whether one page shows at a time
 * @param {string} props.folio - The line at its head
 * @param {EmblemSet} props.emblems - The drawings that have arrived
 * @param {(slot: StampSlot) => void} props.onSelect - Shows a stamp's country among the places
 * @returns {ReactNode} The page
 */
function SlotsPage({
  page,
  isSingle,
  folio,
  emblems,
  onSelect,
}: SlotsPageProps): ReactNode {
  return (
    <section className="passport-sheet">
      <p className="passport-sheet__folio">{folio}</p>
      <div
        className={classNames(
          "passport-sheet__grid",
          isSingle && "passport-sheet__grid--single",
        )}
      >
        {page.slots.map((slot) => (
          <SlotView
            emblems={emblems}
            key={slot.id}
            onSelect={onSelect}
            slot={slot}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Properties accepted by the CoverPage component.
 * @property {string} title - The document's name, under the emblem
 * @property {string} [country] - The issuing country, above it
 * @property {string} [emblem] - The issuing country's drawing, for the arms
 */
interface CoverPageProps {
  title: string;
  country?: string;
  emblem?: string;
}

/**
 * CoverPage component
 * The front cover, laid out as passports are: the issuing country across the
 * top, its arms in the middle, the document's name beneath, and the chip mark
 * of a biometric passport at the foot, all blocked in gold foil on grained
 * board. The arms are the country's own stamp drawing, so the cover and the
 * stamps inside read as one set.
 * @component
 * @param {CoverPageProps} props - The cover props
 * @param {string} props.title - The document's name
 * @param {string} [props.country] - The issuing country
 * @param {string} [props.emblem] - The issuing country's drawing
 * @returns {ReactNode} The cover
 */
function CoverPage({ title, country, emblem }: CoverPageProps): ReactNode {
  return (
    <section className="passport-cover">
      <p className="passport-cover__country">{country}</p>
      <span aria-hidden="true" className="passport-cover__arms">
        {emblem ? <StampEmblem drawing={emblem} /> : <Globe strokeWidth={1} />}
      </span>
      <p className="passport-cover__title">{title}</p>
      <svg
        aria-hidden="true"
        className="passport-cover__chip"
        viewBox="0 0 36 24"
      >
        <rect height="22" rx="1.5" width="34" x="1" y="1" />
        <circle cx="18" cy="12" r="5" />
        <path d="M1 7h34M1 17h34" />
      </svg>
    </section>
  );
}

/**
 * Lists a booklet's pages in reading order: the front cover, the issuing page,
 * the continents' pages, and the back cover. With an odd count the last page
 * faces the inside of the back cover rather than a blank page.
 * @param {Passport} passport - The whole booklet
 * @returns {Array<"cover" | "issuing" | ContinentPage>} The pages
 */
function sheetsOf(
  passport: Passport,
): Array<"cover" | "issuing" | ContinentPage> {
  return [
    "cover",
    ...(passport.issuing ? (["issuing"] as const) : []),
    ...passport.pages,
    "cover",
  ];
}

/* Stamps a page holds: three rows of three on a spread, of two on a page alone. */
const PER_PAGE_DOUBLE = 9;
const PER_PAGE_SINGLE = 6;

/* The least room two pages side by side need, in CSS pixels, controls included. */
const SPREAD_MIN_WIDTH = 440;
const SPREAD_MIN_HEIGHT = 368;

/**
 * Lays the passport out for one page at a time or for spreads.
 * @param {boolean} isSingle - Whether one page shows at a time
 * @param {string} locale - The reader's locale
 * @returns {Passport} The booklet
 */
function passportFor(isSingle: boolean, locale: string): Passport {
  return buildPassport({
    futureCities,
    futureTrips,
    homeCity,
    locale,
    perPage: isSingle ? PER_PAGE_SINGLE : PER_PAGE_DOUBLE,
    visitedTrips,
  });
}

/**
 * Finds the pages open at a given page index.
 * @param {number} page - The first page open
 * @param {boolean} isSingle - Whether one page shows at a time
 * @param {number} count - How many pages there are
 * @returns {number[]} The open pages' indexes
 */
function openPages(page: number, isSingle: boolean, count: number): number[] {
  if (isSingle || page === 0) return [page];
  const left = page % 2 === 1 ? page : page - 1;
  return [left, left + 1].filter((index) => index < count);
}

/**
 * PassportPage component
 * The travel record as a passport to page through: a cover, the issuing country,
 * then one stamp for each country entered, continent by continent, set down
 * across the pages as a border officer would. Pressing a stamp lists that
 * country's places. Two pages show side by side when the page has room for
 * them, and the stamps are laid out again for one page when it does not.
 * @component
 * @returns {ReactNode} The passport page
 */
export function PassportPage(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { isCompact } = useResponsive();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  /* A first guess from the window, until the page measures its own room. */
  const [layout, setLayout] = useState({ isSingle: isCompact, page: 0 });
  const { isSingle, page } = layout;
  const relayoutRef = useRef<(isSingle: boolean) => void>(() => undefined);

  const passport = passportFor(isSingle, currLanguage);
  const nationality =
    siteConfig?.nationality ?? homeCity?.country.id ?? undefined;
  const nationalityName = nationality
    ? catalogueNameById(nationality)
    : undefined;
  const arms = nationalityName ? STAMP_CATALOGUE[nationalityName] : undefined;
  const sheets = sheetsOf(passport);
  const open = openPages(page, isSingle, sheets.length);

  /**
   * Reads which continent a page of the booklet belongs to.
   * @param {number} index - The page's index
   * @returns {Continent | undefined} Its continent, if it is a continent's page
   */
  const continentOf = (index: number): Continent | undefined => {
    const sheet = sheets[index];
    return typeof sheet === "object" ? sheet.continent : undefined;
  };
  const current = open.map(continentOf).find(Boolean);
  const progress = passport.continents.find(
    ({ continent }) => continent === current,
  );
  /* The open pages and the ones either side, so a turn never finds a stamp blank. */
  const nearby = Array.from(
    { length: 6 },
    (_, offset) => (open[0] ?? 0) - 2 + offset,
  ).flatMap((index) => continentOf(index) ?? []);
  const emblems = useEmblems([
    ...nearby,
    ...(passport.issuing ? [passport.issuing.slot.continent] : []),
    ...(arms ? [arms.continent] : []),
  ]);
  /* The covers are not pages: a spread of the last page and the back cover reads as one. */
  const printed = open.filter(
    (index) => index > 0 && index < sheets.length - 1,
  );
  const pagesLabel =
    printed.length === 0
      ? t("passport.cover")
      : printed.length === 1
        ? t("passport.pageOne", { count: sheets.length - 2, page: printed[0] })
        : t("passport.pageTwo", {
            count: sheets.length - 2,
            end: printed[1],
            start: printed[0],
          });

  /**
   * Switches between one page and spreads, keeping the reader on the stamps
   * they were looking at, which the new layout puts on another page.
   * @param {boolean} nextIsSingle - Whether one page should show at a time
   * @returns {void}
   */
  const relayout = (nextIsSingle: boolean): void => {
    if (nextIsSingle === isSingle) return;
    const sheet = sheets[open[0] ?? 0];
    const anchor = typeof sheet === "object" ? sheet.slots[0]?.id : undefined;
    const nextSheets = sheetsOf(passportFor(nextIsSingle, currLanguage));
    const found = nextSheets.findIndex(
      (next) =>
        typeof next === "object" && next.slots.some(({ id }) => id === anchor),
    );
    setLayout({
      isSingle: nextIsSingle,
      page:
        found >= 0
          ? found
          : page >= sheets.length - 1
            ? nextSheets.length - 1
            : Math.min(page, 1),
    });
  };

  useEffect(() => {
    relayoutRef.current = relayout;
  });

  useEffect(() => {
    const element = pageRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      relayoutRef.current(
        width < SPREAD_MIN_WIDTH || height < SPREAD_MIN_HEIGHT,
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /**
   * Lists the places of a stamp's country.
   * @param {StampSlot} slot - The stamp
   * @returns {void}
   */
  const showPlaces = (slot: StampSlot): void => {
    navigate(`/places/visited?country=${encodeURIComponent(slot.country.id)}`);
  };

  return (
    <PanelFrame
      header={
        <PanelHeader surface="page" title={t("nav.passport")}>
          <JournalSwitcher />
        </PanelHeader>
      }
    >
      <div
        className={`passport-page passport-page--${passportCoverOf(nationality ?? "")}`}
        ref={pageRef}
      >
        <StampInk />
        {passport.issuing || passport.pages.length > 0 ? (
          <div
            className={classNames(
              "passport-page__book",
              isSingle && "passport-page__book--single",
            )}
          >
            <Booklet
              indicator={
                progress
                  ? t("passport.progress", {
                      continent: t(`continents.${progress.continent}`),
                      pages: pagesLabel,
                      stamped: progress.stamped,
                      total: progress.total,
                    })
                  : pagesLabel
              }
              isSingle={isSingle}
              nextLabel={t("passport.next")}
              onTurn={(next) => setLayout((now) => ({ ...now, page: next }))}
              page={page}
              pages={sheets.map((sheet, index) => {
                const id =
                  typeof sheet === "object" ? sheet.id : `${sheet}-${index}`;
                if (sheet === "cover")
                  return {
                    content:
                      index === 0 ? (
                        <CoverPage
                          country={
                            nationalityName
                              ? stampName(nationalityName, currLanguage)
                              : undefined
                          }
                          emblem={arms ? emblems[arms.emblem] : undefined}
                          title={t("nav.passport")}
                        />
                      ) : (
                        <section className="passport-cover" />
                      ),
                    id,
                    isHard: true,
                  };
                if (sheet === "issuing")
                  return {
                    content: passport.issuing ? (
                      <IssuingPage
                        emblems={emblems}
                        issuing={passport.issuing}
                        onSelect={showPlaces}
                        passport={passport}
                      />
                    ) : null,
                    id,
                  };
                return {
                  content: (
                    <SlotsPage
                      emblems={emblems}
                      folio={t("passport.folio", {
                        continent: t(`continents.${sheet.continent}`),
                        page: index,
                      })}
                      isSingle={isSingle}
                      onSelect={showPlaces}
                      page={sheet}
                    />
                  ),
                  id,
                };
              })}
              previousLabel={t("passport.previous")}
            />
          </div>
        ) : (
          <EmptyState message={t("passport.empty")} />
        )}
      </div>
    </PanelFrame>
  );
}
