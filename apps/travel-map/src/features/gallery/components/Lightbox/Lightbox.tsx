import "./Lightbox.scss";

import { mediaUrl, PublishedImage } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDateRangeShort } from "@travelmap/ui/i18n/date";
import { classNames } from "@travelmap/ui/lib/classNames";
import { keepTabWithin } from "@travelmap/ui/lib/focus";
import { easeOut } from "@travelmap/ui/lib/motion";
import { AnimatePresence, m, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLoaderData, useLocation, useNavigate } from "react-router";

import { env } from "@/shared/lib/env";

import { albumPhotos } from "../../lib/album";
import type { LightboxRouteData } from "../../loaders/Lightbox.loader";

/*
 * The strip draws this many thumbnails either side of the open photo, so a
 * thousand-photo album does not mount a thousand buttons on every turn.
 */
const STRIP_REACH = 30;

/* A swipe this far, or this fast, turns the page. */
const SWIPE_DISTANCE_PX = 80;
const SWIPE_VELOCITY = 500;

/**
 * Normalizes an absolute or configured YouTube embed source.
 * @param {string} original - The media's stored URL or video identifier
 * @returns {string} The complete YouTube embed URL
 */
function youtubeEmbedSrc(original: string): string {
  /* Repairs a scheme that lost a slash, without touching a correct one. */
  const normalized = original.replace(/^https:\/(?!\/)/, "https://");
  if (/^https?:\/\//.test(normalized)) return normalized;
  return `${env.VITE_YOUTUBE_PATH}${normalized}`;
}

/**
 * Properties accepted by the Slide component.
 * @property {PublishedImage} photo - The photo or video
 */
interface SlideProps {
  photo: PublishedImage;
}

/**
 * Slide component
 * The open photo at full size, or the embedded video. The thumbnail is drawn
 * underneath at once, so a slow original arrives over something rather than
 * over nothing.
 * @component
 * @param {SlideProps} props - The slide props
 * @param {PublishedImage} props.photo - The photo or video
 * @returns {ReactNode} The slide
 */
function Slide({ photo }: SlideProps): ReactNode {
  const { t } = useLanguage(["home"]);

  if (photo.youtube)
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="lightbox__video"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        src={youtubeEmbedSrc(photo.original)}
        title={t("gallery.video")}
      />
    );

  /*
   * The width and height attributes reserve the photo's shape before it
   * loads, and the thumbnail painted behind it fills that shape at once.
   */
  return (
    <img
      alt={photo.alt ?? ""}
      className="lightbox__image"
      decoding="async"
      draggable={false}
      height={photo.height}
      src={mediaUrl(photo.original)}
      style={{ backgroundImage: `url("${mediaUrl(photo.thumbnail)}")` }}
      width={photo.width}
    />
  );
}

/**
 * Lightbox component
 * One photo of an album, full screen. Arrow keys, the side buttons, a swipe,
 * or the thumbnail strip move through the whole album; Escape or the close
 * button returns to it. Each move replaces the history entry, so Back closes
 * the lightbox instead of stepping through every photo seen.
 * @component
 * @returns {ReactNode} The lightbox overlay
 */
export function Lightbox(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();
  const location = useLocation();
  /* Undefined while the album animates out after the route has changed. */
  const data = useLoaderData<LightboxRouteData | undefined>();
  const photoIdx = data?.photoIdx ?? 0;
  const photos = data ? albumPhotos(data.album) : [];
  const current = photos[photoIdx];
  const stripStart = Math.max(0, photoIdx - STRIP_REACH);
  const stripEnd = photoIdx + STRIP_REACH + 1;
  const dialogRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const hasPlacedStripRef = useRef(false);
  const currentIdx = useRef(photoIdx);
  /* Which way the last move went, so the slides enter and leave from that side. */
  const [step, setStep] = useState({ direction: 1, index: photoIdx });
  if (step.index !== photoIdx)
    setStep({ direction: photoIdx > step.index ? 1 : -1, index: photoIdx });
  const { direction } = step;

  useEffect(() => {
    currentIdx.current = photoIdx;
  }, [photoIdx]);

  /**
   * Opens another photo of the album, if there is one at that index.
   * @param {number} index - The photo's album index
   * @returns {void}
   */
  const goTo = (index: number): void => {
    if (index < 0 || index >= photos.length) return;
    navigate(`../${index}`, {
      relative: "path",
      replace: true,
      state: location.state,
    });
  };

  /**
   * Returns to the album.
   * @returns {void}
   */
  const close = (): void => {
    navigate("..", { relative: "path", state: location.state });
  };

  const goToRef = useRef(goTo);
  const closeRef = useRef(close);
  useEffect(() => {
    goToRef.current = goTo;
    closeRef.current = close;
  });

  useEffect(() => {
    /**
     * Moves with the arrow keys, closes with Escape, and keeps Tab inside the
     * dialog so focus never reaches the album hidden behind it.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      keepTabWithin(event, dialogRef.current);
      if (event.key === "ArrowRight") goToRef.current(currentIdx.current + 1);
      else if (event.key === "ArrowLeft")
        goToRef.current(currentIdx.current - 1);
      else if (event.key === "Escape") closeRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* Focus moves into the dialog and back to whatever opened it on close. */
  useEffect(() => {
    const opener = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  /* The neighbours are fetched ahead, so the next swipe lands on a loaded photo. */
  useEffect(() => {
    const sequence = data ? albumPhotos(data.album) : [];
    for (const neighbour of [sequence[photoIdx - 1], sequence[photoIdx + 1]]) {
      if (neighbour && !neighbour.photo.youtube)
        new Image().src = mediaUrl(neighbour.photo.original);
    }
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>(
      ".lightbox__thumb--active",
    );
    if (!strip || !active) return;
    /*
     * The strip opens already centred on the photo; only later moves glide,
     * and only the strip scrolls. Gliding there on open swept the whole strip
     * past, which stuttered in a large album.
     */
    strip.scrollTo({
      behavior: hasPlacedStripRef.current ? "smooth" : "instant",
      left: active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2,
    });
    hasPlacedStripRef.current = true;
  }, [data, photoIdx]);

  /**
   * Turns the page when a drag was long or fast enough.
   * @param {PointerEvent} _event - The pointer event that ended the drag
   * @param {PanInfo} info - The drag's offset and velocity
   * @returns {void}
   */
  const handleDragEnd = (_event: PointerEvent, info: PanInfo): void => {
    if (info.offset.x < -SWIPE_DISTANCE_PX || info.velocity.x < -SWIPE_VELOCITY)
      goTo(photoIdx + 1);
    else if (
      info.offset.x > SWIPE_DISTANCE_PX ||
      info.velocity.x > SWIPE_VELOCITY
    )
      goTo(photoIdx - 1);
  };

  if (!current) return null;
  const { section } = current;

  /*
   * Portalled to the body: the album page sits under a backdrop filter and a
   * transform, either of which would trap a fixed overlay inside the page.
   */
  return createPortal(
    <m.div
      animate={{ opacity: 1 }}
      aria-label={t("gallery.lightbox")}
      aria-modal="true"
      className="lightbox"
      initial={{ opacity: 0 }}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
      transition={easeOut}
    >
      <header className="lightbox__bar">
        <p className="lightbox__caption">
          <CountryFlag
            className="lightbox__flag"
            countryId={section.city.country.id}
          />
          <span className="lightbox__place">
            {section.city.getLocalizedName(currLanguage)}
          </span>
          <span className="lightbox__date">
            {formatDateRangeShort({
              eDateInput: section.eDate,
              locale: currLanguage,
              sDateInput: section.sDate,
            })}
          </span>
        </p>
        <span className="lightbox__counter">
          {photoIdx + 1} / {photos.length}
        </span>
        <button
          aria-label={t("common:action.close")}
          className="lightbox__button"
          onClick={close}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
      </header>

      <div className="lightbox__stage">
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <m.div
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="lightbox__slide"
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            exit={{ opacity: 0, scale: 0.96, x: -direction * 80 }}
            initial={{ opacity: 0, scale: 0.96, x: direction * 80 }}
            key={photoIdx}
            onDragEnd={handleDragEnd}
            transition={easeOut}
          >
            <Slide photo={current.photo} />
          </m.div>
        </AnimatePresence>
        <button
          aria-label={t("gallery.previous")}
          className={classNames(
            "lightbox__button lightbox__nav lightbox__nav--previous",
            photoIdx === 0 && "lightbox__nav--hidden",
          )}
          onClick={() => goTo(photoIdx - 1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          aria-label={t("gallery.next")}
          className={classNames(
            "lightbox__button lightbox__nav lightbox__nav--next",
            photoIdx === photos.length - 1 && "lightbox__nav--hidden",
          )}
          onClick={() => goTo(photoIdx + 1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="lightbox__strip" ref={stripRef}>
        {photos.slice(stripStart, stripEnd).map(({ photo }, offset) => {
          const index = stripStart + offset;
          return (
            <button
              aria-current={index === photoIdx ? "true" : undefined}
              aria-label={t("gallery.openPhoto", { index: index + 1 })}
              className={classNames(
                "lightbox__thumb",
                index === photoIdx && "lightbox__thumb--active",
              )}
              key={photo.thumbnail}
              onClick={() => goTo(index)}
              type="button"
            >
              <img
                alt=""
                className="lightbox__thumb-image"
                decoding="async"
                loading="lazy"
                src={mediaUrl(photo.thumbnail)}
              />
            </button>
          );
        })}
      </div>
    </m.div>,
    document.body,
  );
}
