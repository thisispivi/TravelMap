import { useLoaderData, useNavigate } from "react-router-dom";
import { City } from "../../../core";
import "./Lightbox.scss";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import { MouseEventHandler, useCallback } from "react";
import {
  ChevronIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  GalleryIcon,
} from "../../../assets";
import useLanguage from "../../../hooks/language/language";
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

  type ItemType = ReactImageGalleryItem & {
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
          src={parameters.isShowPhotos ? item.original : ""}
          title={item.alt || ""}
        />
      );
    } else {
      return (
        <img
          alt=""
          className="image-gallery-image"
          src={parameters.isShowPhotos ? item.original : ""}
        />
      );
    }
  };

  const handleChange = useCallback(
    (currentIndex: number | undefined) => {
      if (photoIdx !== undefined) {
        const element = document.querySelector(
          `[aria-label="Go to Slide ${photoIdx + 1}"]`
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
        navigate(`../${currentIndex}`);
      }
    },
    [photoIdx, navigate]
  );

  const renderNavigationButton = (
    onClick: MouseEventHandler<HTMLElement>,
    disabled: boolean,
    direction: "left" | "right"
  ) => (
    <Button
      aria-label={direction === "left" ? "Previous Slide" : "Next Slide"}
      className={`image-gallery-icon image-gallery-${direction}-nav ${
        disabled ? "image-gallery-icon--disabled" : ""
      }`}
      onClick={onClick}
    >
      <ChevronIcon className="chevron" />
    </Button>
  );

  const handleSlide = (currentIndex: number) => handleChange(currentIndex);
  return (
    <div className="lightbox">
      <ImageGallery
        infinite={false}
        items={photos}
        lazyLoad={true}
        onSlide={handleSlide}
        renderCustomControls={() => (
          <Button className="back-button-text" onClick={() => navigate(`..`)}>
            <GalleryIcon />
            <p>{t("gallery")}</p>
          </Button>
        )}
        renderFullscreenButton={(onClick, isFullscreen: boolean) => (
          <Button
            aria-label={t("fullscreen")}
            className={`image-gallery-icon image-gallery-fullscreen ${
              isFullscreen ? "image-gallery-fullscreen--active" : ""
            }`}
            onClick={onClick}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
          </Button>
        )}
        renderItem={handleRenderItem}
        renderLeftNav={(onClick, disabled) =>
          renderNavigationButton(onClick, disabled, "left")
        }
        renderRightNav={(onClick, disabled) =>
          renderNavigationButton(onClick, disabled, "right")
        }
        showIndex={true}
        showPlayButton={false}
        showThumbnails={false}
        startIndex={photoIdx}
      />
    </div>
  );
}
