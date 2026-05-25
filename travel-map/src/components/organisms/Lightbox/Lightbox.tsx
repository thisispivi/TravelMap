import "./Lightbox.scss";
import "react-image-gallery/styles/image-gallery.css";

import {
  JSX,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ImageGallery, {
  ImageGalleryProps,
  ImageGalleryRef,
} from "react-image-gallery";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";

import {
  ChevronIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  GalleryIcon,
} from "../../../assets";
import { City } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { classNames } from "../../../utils/className";
import { parameters } from "../../../utils/parameters";
import { Button } from "../../atoms";

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

/**
 * Lightbox component
 *
 * Full-screen photo and video viewer. Wraps `react-image-gallery` with custom
 * navigation buttons, a fullscreen toggle, and an auto-hiding top bar.
 *
 * @component
 *
 * @returns {JSX.Element} The lightbox overlay
 */
export default function Lightbox(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { city, travelIdx, photoIdx } = useLoaderData() as LightboxProps;
  const photos = city.travels[travelIdx].photos;

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(photoIdx);
  const hideNavTimeoutRef = useRef<number | undefined>(undefined);
  const galleryRef = useRef<ImageGalleryRef>(null);

  const scheduleHideNav = useCallback(() => {
    if (hideNavTimeoutRef.current !== undefined) {
      window.clearTimeout(hideNavTimeoutRef.current);
    }
    hideNavTimeoutRef.current = window.setTimeout(() => {
      setIsNavVisible(false);
    }, HIDE_NAV_AFTER_MS);
  }, []);

  const revealNav = useCallback(() => {
    setIsNavVisible(true);
    scheduleHideNav();
  }, [scheduleHideNav]);

  useEffect(() => {
    scheduleHideNav();
    return () => {
      const timeoutId = hideNavTimeoutRef.current;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [scheduleHideNav]);

  const handleRenderItem = (item: LightboxItem) => {
    if (item.youtube) {
      return (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="image-gallery-video"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          src={
            parameters.isShowPhotos
              ? `${import.meta.env.VITE_YOUTUBE_PATH}${item.original}`
              : ""
          }
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

  const handleChange = useCallback(
    (newIndex: number | undefined) => {
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
    },
    [location, photoIdx, navigate],
  );

  const renderNavigationButton = (
    onClick: MouseEventHandler,
    disabled: boolean,
    direction: "left" | "right",
  ) => (
    <Button
      ariaLabel={
        direction === "left"
          ? t("lightbox.previousSlide")
          : t("lightbox.nextSlide")
      }
      className={`image-gallery-icon image-gallery-${direction}-nav ${
        disabled ? "image-gallery-icon--disabled" : ""
      }`}
      hoverScale={1}
      onClick={(event) => {
        revealNav();
        onClick(event);
      }}
      tapScale={1}
    >
      <ChevronIcon className="chevron" />
    </Button>
  );

  const handleSlide = (idx: number) => {
    setCurrentIndex(idx);
    handleChange(idx);
  };

  const handleToggleFullscreen = useCallback(() => {
    if (galleryRef.current) {
      if (isFullscreen) {
        galleryRef.current.exitFullScreen();
      } else {
        galleryRef.current.fullScreen();
      }
    }
  }, [isFullscreen]);

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
          <span className="lightbox__index--current">{currentIndex + 1}</span> /{" "}
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
        renderFullscreenButton={() => null}
        renderItem={handleRenderItem}
        renderLeftNav={(onClick, disabled) =>
          renderNavigationButton(onClick, disabled, "left")
        }
        renderRightNav={(onClick, disabled) =>
          renderNavigationButton(onClick, disabled, "right")
        }
        showIndex={false}
        showPlayButton={false}
        showThumbnails={false}
        startIndex={photoIdx}
      />
    </div>
  );
}
