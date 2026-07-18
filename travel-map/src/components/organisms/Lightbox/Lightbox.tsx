import "./Lightbox.scss";
import "react-image-gallery/styles/image-gallery.css";

import { ReactNode, useEffect, useRef, useState } from "react";
import ImageGallery, {
  ImageGalleryProps,
  ImageGalleryRef,
} from "react-image-gallery";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";

import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import FullscreenEnterIcon from "@/assets/icons/FullscreenEnter.svg?react";
import FullscreenExitIcon from "@/assets/icons/FullscreenExit.svg?react";
import GalleryIcon from "@/assets/icons/Gallery.svg?react";
import { Button } from "@/components/atoms/Buttons/Button";

import { City } from "../../../core";
import { visitedTrips } from "../../../data";
import { useLanguage } from "../../../hooks/language/language";
import { classNames } from "../../../utils/className";
import { parameters } from "../../../utils/parameters";
import { getTravelByCityIndex } from "../../../utils/trips";
const HIDE_NAV_AFTER_MS = 2000;
type LightboxItem = ImageGalleryProps["items"][number] & {
  youtube?: boolean;
  alt?: string;
};
export interface LightboxProps {
  city: City;
  travelIdx: number;
  photoIdx: number;
}

function getYoutubeEmbedSrc(original: string): string {
  const normalizedOriginal = original.replace(/^https:\//, "https://");
  if (/^https?:\/\//.test(normalizedOriginal)) return normalizedOriginal;

  return `${import.meta.env.VITE_YOUTUBE_PATH ?? "https://www.youtube.com/embed/"}${normalizedOriginal}`;
}

/**
 * Lightbox component
 *
 * Full-screen photo and video viewer. Wraps `react-image-gallery` with custom
 * navigation buttons, a fullscreen toggle, and an auto-hiding top bar.
 *
 * @component
 *
 * @returns {ReactNode} The lightbox overlay
 */
export default function Lightbox(): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { city, travelIdx, photoIdx } = useLoaderData() as LightboxProps;
  const photos =
    getTravelByCityIndex(city, travelIdx, visitedTrips)?.photos ?? [];
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideNavTimeoutRef = useRef<number | undefined>(undefined);
  const galleryRef = useRef<ImageGalleryRef>(null);
  const scheduleHideNav = () => {
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

  const revealNav = () => {
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
  const handleRenderItem = (item: LightboxItem) => {
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
          alt=""
          className="image-gallery-image"
          src={
            parameters.isShowPhotos
              ? `${import.meta.env.VITE_CDN_PATH}${item.original}`
              : ""
          }
        />
      );
    }
  };
  const handleChange = (newIndex: number | undefined) => {
    if (photoIdx !== undefined) {
      const element = document.querySelector(
        `[aria-label="Go to Slide ${photoIdx + 1}"]`,
      );
      if (element) {
        const child = element.children[0];
        if (child) {
          if (child.tagName === "VIDEO") (child as HTMLVideoElement).pause();
          if (child.tagName === "IFRAME") {
            const iframeSrc = (child as HTMLIFrameElement).src;
            (child as HTMLIFrameElement).src = iframeSrc;
          }
        }
      }
      navigate(`../${newIndex}`, { state: location.state });
    }
  };
  const handleSlide = (idx: number) => {
    handleChange(idx);
  };
  const handleNavigateSlide = (idx: number) => {
    if (idx < 0 || idx >= photos.length) return;
    revealNav();
    handleChange(idx);
  };
  const handleToggleFullscreen = () => {
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
        onSlide={handleSlide}
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
        className={`lightbox__nav-button image-gallery-left-nav ${photoIdx === 0 ? "lightbox__nav-button--disabled" : ""}`}
        hoverScale={1}
        onClick={() => handleNavigateSlide(photoIdx - 1)}
        tapScale={1}
      >
        <ChevronIcon className="chevron" />
      </Button>
      <Button
        ariaLabel={t("lightbox.nextSlide")}
        className={`lightbox__nav-button image-gallery-right-nav ${photoIdx >= photos.length - 1 ? "lightbox__nav-button--disabled" : ""}`}
        hoverScale={1}
        onClick={() => handleNavigateSlide(photoIdx + 1)}
        tapScale={1}
      >
        <ChevronIcon className="chevron" />
      </Button>
    </div>
  );
}
