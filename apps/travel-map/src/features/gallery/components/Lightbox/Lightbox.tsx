import "./Lightbox.scss";

import { mediaUrl, PublishedImage } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDateRangeShort } from "@travelmap/ui/i18n/date";
import { classNames } from "@travelmap/ui/lib/classNames";
import { keepTabWithin } from "@travelmap/ui/lib/focus";
import { easeOut } from "@travelmap/ui/lib/motion";
import {
  animate,
  m,
  useMotionValue,
  useReducedMotionConfig,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLoaderData, useLocation, useNavigate } from "react-router";

import { env } from "@/shared/lib/env";

import { albumPhotos } from "../../lib/album";
import type { LightboxRouteData } from "../../loaders/Lightbox.loader";
import { useLightboxTrack } from "./Lightbox.track";

/*
 * The strip draws this many thumbnails either side of the open photo, so a
 * thousand-photo album does not mount a thousand buttons on every turn.
 */
const STRIP_REACH = 30;

/*
 * Slides further than one away are fetched and decoded too: the slide after
 * the next mounts during the move, and must arrive ready to paint.
 */
const DECODE_REACH = [-2, -1, 1, 2];

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
 * @property {boolean} isPlayable - Whether a video may load its player
 * @property {PublishedImage} photo - The photo or video
 */
interface SlideProps {
  isPlayable: boolean;
  photo: PublishedImage;
}

/**
 * Slide component
 * A photo at full size, or a video. The thumbnail is drawn underneath at once,
 * so a slow original arrives over something rather than over nothing. A video
 * is its thumbnail until it has come to rest in the middle, since building a
 * player mid-swipe would stall the swipe.
 * @component
 * @param {SlideProps} props - The slide props
 * @param {boolean} props.isPlayable - Whether a video may load its player
 * @param {PublishedImage} props.photo - The photo or video
 * @returns {ReactNode} The slide
 */
function Slide({ isPlayable, photo }: SlideProps): ReactNode {
  const { t } = useLanguage(["home"]);

  if (photo.youtube && !isPlayable)
    return (
      <img
        alt={photo.alt ?? ""}
        className="lightbox__poster"
        decoding="async"
        draggable={false}
        src={mediaUrl(photo.thumbnail)}
      />
    );

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
 * One photo of an album, full screen, with its neighbours beside it on a track
 * that follows the finger. Arrow keys, the side buttons, a swipe, or the
 * thumbnail strip move through the whole album; Escape or the close button
 * returns to it. Each move replaces the history entry once it has settled, so
 * Back closes the lightbox instead of stepping through every photo seen.
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
  const {
    goTo,
    handlePan,
    handlePanEnd,
    handlePointerDown,
    index: shownIdx,
    isMoving,
    isZoomed,
    step,
    trackRef,
    x,
  } = useLightboxTrack({
    count: photos.length,
    onSettled: (index) =>
      navigate(`../${index}`, {
        relative: "path",
        replace: true,
        state: location.state,
      }),
    urlIndex: photoIdx,
  });
  const current = photos[shownIdx];
  const stripStart = Math.max(0, shownIdx - STRIP_REACH);
  const stripEnd = shownIdx + STRIP_REACH + 1;
  const slidesStart = Math.max(0, shownIdx - 1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const hasPlacedStripRef = useRef(false);
  const opacity = useMotionValue(0);
  /* Set once the fade has finished, when the album behind is fully covered. */
  const [isCovering, setIsCovering] = useState(false);
  const isReduced = useReducedMotionConfig();

  /**
   * Returns to the album.
   * @returns {void}
   */
  const close = (): void => {
    navigate("..", { relative: "path", state: location.state });
  };

  const stepRef = useRef(step);
  const closeRef = useRef(close);
  useEffect(() => {
    stepRef.current = step;
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
      if (event.key === "ArrowRight") stepRef.current(1);
      else if (event.key === "ArrowLeft") stepRef.current(-1);
      else if (event.key === "Escape") closeRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const fade = animate(opacity, 1, {
      ...easeOut,
      onComplete: () => setIsCovering(true),
    });
    return () => fade.stop();
  }, [opacity]);

  /* Focus moves into the dialog and back to whatever opened it on close. */
  useEffect(() => {
    const opener = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  /* The neighbours are decoded ahead, so the next swipe lands on a painted photo. */
  useEffect(() => {
    const sequence = data ? albumPhotos(data.album) : [];
    for (const reach of DECODE_REACH) {
      const neighbour = sequence[shownIdx + reach];
      if (neighbour && !neighbour.photo.youtube) {
        const image = new Image();
        image.src = mediaUrl(neighbour.photo.original);
        /* A photo that cannot be decoded just stays on its thumbnail. */
        image.decode().catch(() => undefined);
      }
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
      behavior: hasPlacedStripRef.current && !isReduced ? "smooth" : "instant",
      left: active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2,
    });
    hasPlacedStripRef.current = true;
  }, [data, isReduced, shownIdx]);

  if (!current) return null;
  const { section } = current;

  /*
   * Portalled to the body: the album page sits under a backdrop filter and a
   * transform, either of which would trap a fixed overlay inside the page.
   */
  return createPortal(
    <m.div
      aria-label={t("gallery.lightbox")}
      aria-modal="true"
      className={classNames("lightbox", isCovering && "lightbox--covering")}
      ref={dialogRef}
      role="dialog"
      style={{ opacity }}
      tabIndex={-1}
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
          {shownIdx + 1} / {photos.length}
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

      <div
        className={classNames(
          "lightbox__stage",
          isZoomed && "lightbox__stage--zoomed",
        )}
      >
        <m.div
          className={classNames(
            "lightbox__track",
            isMoving && "lightbox__track--moving",
          )}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          onPointerDown={handlePointerDown}
          ref={trackRef}
          style={{ x }}
        >
          {photos.slice(slidesStart, shownIdx + 2).map(({ photo }, offset) => {
            const index = slidesStart + offset;
            return (
              <div
                aria-hidden={index === shownIdx ? undefined : true}
                className="lightbox__slide"
                key={photo.thumbnail}
                style={{ left: `${index * 100}%` }}
              >
                <Slide
                  isPlayable={
                    index === shownIdx ? shownIdx === photoIdx : false
                  }
                  photo={photo}
                />
              </div>
            );
          })}
        </m.div>
        <button
          aria-label={t("gallery.previous")}
          className={classNames(
            "lightbox__button lightbox__nav lightbox__nav--previous",
            shownIdx === 0 && "lightbox__nav--hidden",
          )}
          onClick={() => step(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          aria-label={t("gallery.next")}
          className={classNames(
            "lightbox__button lightbox__nav lightbox__nav--next",
            shownIdx === photos.length - 1 && "lightbox__nav--hidden",
          )}
          onClick={() => step(1)}
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
              aria-current={index === shownIdx ? "true" : undefined}
              aria-label={t("gallery.openPhoto", { index: index + 1 })}
              className={classNames(
                "lightbox__thumb",
                index === shownIdx && "lightbox__thumb--active",
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
