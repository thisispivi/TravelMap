import { useLoaderData, useNavigate } from "react-router-dom";
import { City } from "../../../core";
import "./Lightbox.scss";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import Button from "../../atoms/Buttons/Button";
import { MouseEventHandler, useCallback } from "react";
import {
  ChevronIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  GalleryIcon,
} from "../../../assets";
import useLanguage from "../../../hooks/language/language";
import { parameters } from "../../../utils/parameters";

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
          className="image-gallery-video"
          src={parameters.isShowPhotos ? item.original : ""}
          title={item.alt || ""}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    } else {
      return (
        <img
          className="image-gallery-image"
          src={parameters.isShowPhotos ? item.original : ""}
          alt=""
        />
      );
    }
  };

  const handleChange = useCallback(
    (currentIndex: number | undefined) => {
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
        navigate(`../${currentIndex}`);
      }
    },
    [photoIdx, navigate],
  );

  const renderNavigationButton = (
    onClick: MouseEventHandler<HTMLElement>,
    disabled: boolean,
    direction: "left" | "right",
  ) => (
    <Button
      className={`image-gallery-icon image-gallery-${direction}-nav ${
        disabled ? "image-gallery-icon--disabled" : ""
      }`}
      onClick={onClick}
      aria-label={direction === "left" ? "Previous Slide" : "Next Slide"}
    >
      <ChevronIcon className="chevron" />
    </Button>
  );

  const handleSlide = (currentIndex: number) => handleChange(currentIndex);
  return (
    <div className="lightbox">
      <ImageGallery
        lazyLoad={true}
        infinite={false}
        showIndex={true}
        showPlayButton={false}
        showThumbnails={false}
        startIndex={photoIdx}
        items={photos}
        renderItem={handleRenderItem}
        renderCustomControls={() => (
          <Button className="back-button-text" onClick={() => navigate(`..`)}>
            <GalleryIcon />
            <p>{t("gallery")}</p>
          </Button>
        )}
        renderLeftNav={(onClick, disabled) =>
          renderNavigationButton(onClick, disabled, "left")
        }
        renderRightNav={(onClick, disabled) =>
          renderNavigationButton(onClick, disabled, "right")
        }
        renderFullscreenButton={(onClick, isFullscreen: boolean) => (
          <Button
            className={`image-gallery-icon image-gallery-fullscreen ${
              isFullscreen ? "image-gallery-fullscreen--active" : ""
            }`}
            onClick={onClick}
            aria-label={t("fullscreen")}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
          </Button>
        )}
        onSlide={handleSlide}
      />
    </div>
  );
}
