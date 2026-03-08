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
import { useLoaderData, useNavigate } from "react-router-dom";

import {
  ChevronIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  GalleryIcon,
} from "../../../assets";
import { City } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { parameters } from "../../../utils/parameters";
import { Button } from "../../atoms";

export interface LightboxProps {
  city: City;
  travelIdx: number;
  photoIdx: number;
}

/**
 * Lightbox component
 *
 * The lightbox component is used to display a lightbox.
 *
 * @component
 *
 * @returns {JSX.Element} - The lightbox
 */
export default function Lightbox(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { city, travelIdx, photoIdx } = useLoaderData() as LightboxProps;
  const photos = city.travels[travelIdx].photos;

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(photoIdx);
  const hideNavTimeoutRef = useRef<number | undefined>(undefined);
  const galleryRef = useRef<ImageGalleryRef>(null);
  const HIDE_NAV_AFTER_MS = 2000;

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
      if (hideNavTimeoutRef.current !== undefined) {
        window.clearTimeout(hideNavTimeoutRef.current);
      }
    };
  }, [scheduleHideNav]);

  type ItemType = ImageGalleryProps["items"][number] & {
    youtube?: boolean;
    alt?: string;
  };

  const handleRenderItem = (item: ItemType) => {
    if (item.youtube) {
      return (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="image-gallery-video"
          src={
            parameters.isShowPhotos
              ? `${import.meta.env.VITE_YOUTUBE_PATH}${item.original}`
              : ""
          }
          title="YouTube video"
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
        navigate(`../${newIndex}`);
      }
    },
    [photoIdx, navigate],
  );

  const renderNavigationButton = (
    onClick: MouseEventHandler,
    disabled: boolean,
    direction: "left" | "right",
  ) => (
    <Button
      aria-label={direction === "left" ? "Previous Slide" : "Next Slide"}
      className={`image-gallery-icon image-gallery-${direction}-nav ${
        disabled ? "image-gallery-icon--disabled" : ""
      }`}
      hoverScale={1}
      onClick={onClick}
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
      className={`lightbox ${isNavVisible ? "" : "lightbox--nav-hidden"}`}
      onMouseMove={revealNav}
      onTouchStart={revealNav}
    >
      <div className="lightbox__top-bar">
        <Button
          className="lightbox__back-button"
          onClick={() => navigate(`..`)}
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
          aria-label={t("fullscreen")}
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
