import "./GalleryAlbum.scss";
import "react-photo-album/rows.css";

import { mediaUrl } from "@travelmap/core";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { ReactNode, useRef } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import { Outlet, useLoaderData, useLocation, useNavigate } from "react-router";

import { Album, AlbumSection } from "@/data/albums";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { PanelFrame } from "@/shared/components/PanelFrame/PanelFrame";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useScrollState } from "@/shared/hooks/useScrollState";
import { classNames } from "@/shared/lib/classNames";
import { easeOut } from "@/shared/lib/motion";
import { readNavigationState } from "@/shared/lib/navigationState";

/**
 * Picks a row height for the album's width, so a phone shows two or three
 * photos to a row and a wide screen five or six.
 * @param {number} width - The album's width in pixels
 * @returns {number} The target row height in pixels
 */
function rowHeightFor(width: number): number {
  return width < 600 ? 150 : 230;
}

/**
 * Properties accepted by the SectionLabel component.
 * @property {AlbumSection} section - The visit to name
 * @property {Album["kind"]} kind - Whether the album is a trip's or a place's
 */
interface SectionLabelProps {
  section: AlbumSection;
  kind: Album["kind"];
}

/**
 * SectionLabel component
 * Names one visit of an album: the place and its flag in a trip's album, the
 * trip and its flags in a place's, then the dates and how many photos it
 * holds. It heads each group of photos and, once the header condenses, tells
 * the header which group is being looked at.
 * @component
 * @param {SectionLabelProps} props - The label props
 * @param {AlbumSection} props.section - The visit to name
 * @param {Album["kind"]} props.kind - Whether the album is a trip's or a place's
 * @returns {ReactNode} The label
 */
function SectionLabel({ section, kind }: SectionLabelProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const countries =
    kind === "trip"
      ? [section.city.country]
      : section.trip.getCountriesVisited();

  return (
    <>
      <span className="gallery-album__label-name">
        <span className="gallery-album__label-text">
          {kind === "trip"
            ? section.city.getLocalizedName(currLanguage)
            : section.trip.getLocalizedTitle(currLanguage)}
        </span>
        {countries.map((country) => (
          <CountryFlag
            className="gallery-album__label-flag"
            countryId={country.id}
            key={country.id}
          />
        ))}
      </span>
      <span className="gallery-album__label-meta">
        {formatDateRangeShort({
          eDateInput: section.eDate,
          locale: currLanguage,
          sDateInput: section.sDate,
        })}{" "}
        · {t("gallery.photoCount", { count: section.photos.length })}
      </span>
    </>
  );
}

/**
 * Properties accepted by the AlbumSectionView component.
 * @property {AlbumSection} section - The visit whose photos to show
 * @property {Album["kind"]} kind - Whether the album is a trip's or a place's, which decides the heading
 * @property {(index: number) => void} onOpen - Opens a photo by its album index
 */
interface AlbumSectionViewProps {
  section: AlbumSection;
  kind: Album["kind"];
  onOpen: (index: number) => void;
}

/**
 * AlbumSectionView component
 * One visit's photos under a heading that names it: the place, in a trip's
 * album, or the trip, in a place's album.
 * @component
 * @param {AlbumSectionViewProps} props - The section props
 * @param {AlbumSection} props.section - The visit whose photos to show
 * @param {Album["kind"]} props.kind - Whether the album is a trip's or a place's
 * @param {(index: number) => void} props.onOpen - Opens a photo by its album index
 * @returns {ReactNode} The section
 */
function AlbumSectionView({
  section,
  kind,
  onOpen,
}: AlbumSectionViewProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const photos = section.photos.map((photo, index) => ({
    alt: photo.alt ?? "",
    height: photo.height,
    key: `${section.key}-${index}`,
    src: mediaUrl(photo.thumbnail),
    width: photo.width,
    youtube: photo.youtube,
  }));

  return (
    <section className="gallery-album__section">
      <h2 className="gallery-album__section-title">
        <SectionLabel kind={kind} section={section} />
      </h2>
      <RowsPhotoAlbum
        onClick={({ index }) => onOpen(section.offset + index)}
        photos={photos}
        render={{
          image: (props, { photo }) => (
            <span className="gallery-album__tile">
              <img
                {...props}
                alt={photo.alt || (photo.youtube ? t("gallery.playVideo") : "")}
                decoding="async"
                loading="lazy"
              />
              {/*
               * The album already wraps each tile in a button that opens it,
               * so the play mark is decoration; a second button inside would
               * be invalid nested interactive markup.
               */}
              {photo.youtube ? (
                <span aria-hidden="true" className="gallery-album__play">
                  <Play />
                </span>
              ) : null}
            </span>
          ),
        }}
        rowConstraints={section.rowConstraints}
        spacing={6}
        targetRowHeight={section.targetRowHeight ?? rowHeightFor}
      />
    </section>
  );
}

/**
 * GalleryAlbum component
 * A trip's or a place's photos, one group per visit in travel order: a trip's
 * album groups by place, a place's by trip. The header starts large with the
 * title, its flags, the photo count and the trip's dates or the place's number
 * of trips. Once the photos scroll it condenses into two short rows: the way
 * back, the title and the count, then the group being looked at. A photo opens
 * in the lightbox, a child route drawn over the album.
 * @component
 * @returns {ReactNode} The album page
 */
export function GalleryAlbum(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();
  const location = useLocation();
  /*
   * The page keeps rendering while it animates out, after the router has
   * already dropped this route's data.
   */
  const album = useLoaderData<Album | undefined>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { isScrolled, activeIndex } = useScrollState(
    bodyRef,
    ".gallery-album__section",
  );
  const { fromPath } = readNavigationState(location.state);
  const first = album?.sections[0];
  if (!album || !first) return null;

  const section = album.sections[activeIndex] ?? first;
  const title =
    album.kind === "trip"
      ? first.trip.getLocalizedTitle(currLanguage)
      : first.city.getLocalizedName(currLanguage);
  const countries =
    album.kind === "trip"
      ? first.trip.getCountriesVisited()
      : [first.city.country];
  const meta =
    album.kind === "trip"
      ? formatDateRangeShort({
          eDateInput: first.trip.eDate,
          locale: currLanguage,
          sDateInput: first.trip.sDate,
        })
      : t("gallery.tripCount", {
          count: new Set(album.sections.map(({ trip }) => trip.id)).size,
        });
  const backLabel = fromPath ? t("gallery.back") : t("gallery.title");

  return (
    <PanelFrame
      bodyRef={bodyRef}
      header={
        <header
          className={classNames(
            "gallery-album__header",
            isScrolled && "gallery-album__header--condensed",
          )}
        >
          <div className="gallery-album__bar">
            <button
              aria-label={backLabel}
              className="gallery-album__back"
              onClick={() => navigate(fromPath ?? "/gallery")}
              type="button"
            >
              <ArrowLeft
                aria-hidden="true"
                className="gallery-album__back-icon"
              />
            </button>
            <h1 className="gallery-album__title">
              <span className="gallery-album__title-text">{title}</span>
              {countries.map((country) => (
                <CountryFlag
                  className="gallery-album__title-flag"
                  countryId={country.id}
                  key={country.id}
                />
              ))}
            </h1>
            <span className="gallery-album__count">
              {t("gallery.photoCount", { count: album.count })}
            </span>
          </div>
          {/*
           * The resting line and the current group share one grid cell and
           * cross-fade, so the header never changes height while they swap.
           */}
          <div className="gallery-album__line">
            <AnimatePresence initial={false}>
              <m.p
                animate={{ opacity: 1, y: 0 }}
                className={classNames(
                  "gallery-album__line-text",
                  isScrolled && "gallery-album__line-text--current",
                )}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={isScrolled ? section.key : "meta"}
                transition={easeOut}
              >
                {isScrolled ? (
                  <SectionLabel kind={album.kind} section={section} />
                ) : (
                  meta
                )}
              </m.p>
            </AnimatePresence>
          </div>
        </header>
      }
    >
      <div className="gallery-album__sections">
        {album.sections.map((visit) => (
          <AlbumSectionView
            key={visit.key}
            kind={album.kind}
            onOpen={(index) =>
              navigate(`./${index}`, { state: location.state })
            }
            section={visit}
          />
        ))}
      </div>
      <Outlet />
    </PanelFrame>
  );
}
