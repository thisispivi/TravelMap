import "./Lightbox.scss";
import "react-image-gallery/styles/image-gallery.css";

import { mediaUrl } from "@travelmap/core";
import { ReactNode, useEffect, useRef, useState } from "react";
import ImageGallery, {
  ImageGalleryProps,
  ImageGalleryRef,
} from "react-image-gallery";
import { useLoaderData, useLocation, useNavigate } from "react-router";

import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import FullscreenEnterIcon from "@/assets/icons/FullscreenEnter.svg?react";
import FullscreenExitIcon from "@/assets/icons/FullscreenExit.svg?react";
import GalleryIcon from "@/assets/icons/Gallery.svg?react";
import { Button } from "@/shared/components/Button/Button";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { env } from "@/shared/lib/env";
import { parameters } from "@/shared/lib/parameters";

import type { lightboxLoader } from "../../loaders/Lightbox.loader";

const HIDE_NAV_AFTER_MS = 2000;

/**
 * One slide handed to react-image-gallery, carrying the extra fields the custom
 * renderer needs to choose between an image and a YouTube embed.
 * @property {boolean} [youtube] - Whether the slide's original is a YouTube id
 * @property {string} [alt] - Alternative text from the dataset
 */
type LightboxItem = ImageGalleryProps["items"][number] & {
  youtube?: boolean;
  alt?: string;
};

/**
 * Normalizes an absolute or configured YouTube embed source.
 * @param {string} original - The media's stored URL or video identifier
 * @returns {string} The complete YouTube embed URL
 */
function getYoutubeEmbedSrc(original: string): string {
  const normalizedOriginal = original.replace(/^https:\//, "https://");
  if (/^https?:\/\//.test(normalizedOriginal)) return normalizedOriginal;

  return `${env.VITE_YOUTUBE_PATH}${normalizedOriginal}`;
}

/**
 * Lightbox component
 * Full-screen photo and video viewer. Wraps `react-image-gallery` with custom
 * navigation buttons, a fullscreen toggle, and an auto-hiding top bar.
 * @component
 * @returns {ReactNode} The lightbox overlay
 */
export function Lightbox(): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { photoIdx, travel } = useLoaderData<typeof lightboxLoader>();
  const photos = travel.photos;
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideNavTimeoutRef = useRef<number | undefined>(undefined);
  const galleryRef = useRef<ImageGalleryRef>(null);

  /**
   * Restarts the timer that hides the lightbox navigation.
   * @returns {void}
   */
  const scheduleHideNav = (): void => {
    if (hideNavTimeoutRef.current !== undefined) {
      window.clearTimeout(hideNavTimeoutRef.current);
    }
    hideNavTimeoutRef.current = window.setTimeout(() => {
      setIsNavVisible(false);
    }, HIDE_NAV_AFTER_MS);
  };
  const scheduleHideNavRef = useRef(scheduleHideNav);

  useEffect(() => {
    scheduleHideNavRef.current = scheduleHideNav;
  });

  /**
   * Reveals the lightbox navigation and restarts its hide timer.
   * @returns {void}
   */
  const revealNav = (): void => {
    setIsNavVisible(true);
    scheduleHideNavRef.current();
  };
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsNavVisible(false);
    }, HIDE_NAV_AFTER_MS);
    hideNavTimeoutRef.current = timeoutId;
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  /**
   * Renders either a sandboxed video embed or a responsive image slide.
   * @param {LightboxItem} item - The lightbox item to render
   * @returns {ReactNode} The rendered media slide
   */
  const handleRenderItem = (item: LightboxItem): ReactNode => {
    if (item.youtube) {
      return (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="image-gallery-video"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          src={parameters.isShowPhotos ? getYoutubeEmbedSrc(item.original) : ""}
          title={t("lightbox.youtubeVideo")}
        />
      );
    } else {
      return (
        <img
          alt={item.alt ?? ""}
          className="image-gallery-image"
          src={parameters.isShowPhotos ? mediaUrl(item.original) : ""}
        />
      );
    }
  };

  /**
   * Stops media on the current slide and navigates to a new media index.
   * @param {number} newIndex - The destination media index
   * @returns {void}
   */
  const goToSlide = (newIndex: number): void => {
    const media = document.querySelector(
      `[aria-label="Go to Slide ${photoIdx + 1}"]`,
    )?.children[0];
    if (media instanceof HTMLVideoElement) media.pause();
    if (media instanceof HTMLIFrameElement) {
      /* Reloading the embed is the only way to stop a YouTube player from outside it. */
      const { src } = media;
      media.src = src;
    }
    navigate(`../${newIndex}`, { state: location.state });
  };

  /**
   * Navigates to an in-range slide and reveals the navigation controls.
   * @param {number} idx - The destination media index
   * @returns {void}
   */
  const handleNavigateSlide = (idx: number): void => {
    if (idx < 0 || idx >= photos.length) return;
    revealNav();
    goToSlide(idx);
  };

  /**
   * Toggles the underlying image gallery's fullscreen mode.
   * @returns {void}
   */
  const handleToggleFullscreen = (): void => {
    if (galleryRef.current) {
      if (isFullscreen) {
        galleryRef.current.exitFullScreen();
      } else {
        galleryRef.current.fullScreen();
      }
    }
  };
  return (
    <div
      className={classNames(
        "lightbox",
        !isNavVisible && "lightbox--nav-hidden",
        isFullscreen && "lightbox--fullscreen",
      )}
      onMouseMove={revealNav}
      onTouchStart={revealNav}
    >
      <div className="lightbox__top-bar">
        <Button
          className="lightbox__back-button"
          onClick={() => navigate(`..`, { state: location.state })}
        >
          <GalleryIcon />
          <p>{t("gallery")}</p>
        </Button>
        <span className="lightbox__spacer" />
        <span className="lightbox__index">
          <span className="lightbox__index--current">{photoIdx + 1}</span> /{" "}
          {photos.length}
        </span>
        <Button
          ariaLabel={t("lightbox.fullscreen")}
          className="lightbox__fullscreen-button"
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
        </Button>
      </div>
      <ImageGallery
        infinite={false}
        items={photos}
        lazyLoad={true}
        onScreenChange={(fs) => setIsFullscreen(fs)}
        onSlide={goToSlide}
        ref={galleryRef}
        renderItem={handleRenderItem}
        showFullscreenButton={false}
        showIndex={false}
        showNav={false}
        showPlayButton={false}
        showThumbnails={false}
        startIndex={photoIdx}
      />
      <Button
        ariaLabel={t("lightbox.previousSlide")}
        className={classNames(
          "lightbox__nav-button image-gallery-left-nav",
          photoIdx === 0 && "lightbox__nav-button--disabled",
        )}
        hoverScale={1}
        onClick={() => handleNavigateSlide(photoIdx - 1)}
        tapScale={1}
      >
        <ChevronIcon className="chevron" />
      </Button>
      <Button
        ariaLabel={t("lightbox.nextSlide")}
        className={classNames(
          "lightbox__nav-button image-gallery-right-nav",
          photoIdx >= photos.length - 1 && "lightbox__nav-button--disabled",
        )}
        hoverScale={1}
        onClick={() => handleNavigateSlide(photoIdx + 1)}
        tapScale={1}
      >
        <ChevronIcon className="chevron" />
      </Button>
    </div>
  );
}
