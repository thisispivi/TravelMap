import React, { useCallback } from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import { getCityPhotos } from "../../../utils/photos";
import { City } from "../../../classes/City";
import { TextBackButton } from "../../atoms";
import "./ImageGallery.scss";

interface CustomImageGalleryProps {
  currentCity?: City;
  currentImage?: number;
  setCurrentImage: (index: number | undefined) => void;
  onBackClick?: () => void;
  baseUrl?: string;
}

export function CustomImageGallery({
  currentCity,
  currentImage,
  setCurrentImage,
  onBackClick,
  baseUrl = "",
}: CustomImageGalleryProps) {
  const items = getCityPhotos(currentCity?.name || "");

  type ItemType = ReactImageGalleryItem & {
    video?: boolean;
    youtube?: boolean;
  };

  const getDescription = (item: ItemType) => {
    return (
      <>
        {item.description && (
          <span
            className="image-gallery-description"
            style={{ left: "0px", right: "initial" }}
          >
            {item.description}
          </span>
        )}
      </>
    );
  };

  const handleRenderItem = (item: ItemType) => {
    const media = (item: ItemType) => {
      if (item.video) {
        return (
          <video
            className="image-gallery-video"
            controls
            id={item.original}
            key={item.original}
          >
            <source src={baseUrl + item.original} type="video/mp4" />
          </video>
        );
      } else if (item.youtube) {
        return (
          <iframe
            className="image-gallery-video"
            src={item.original}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        );
      } else {
        return (
          <img
            className="image-gallery-image"
            src={baseUrl + item.original}
            alt=""
          />
        );
      }
    };

    return (
      <>
        {media(item)}
        {getDescription(item)}
      </>
    );
  };

  const handleChange = useCallback(
    (currentIndex: number | undefined) => {
      if (currentImage !== undefined) {
        const element = document.querySelector(
          `[aria-label="Go to Slide ${currentImage + 1}"]`
        );
        if (element) {
          const child = element.children[0];
          if (child) {
            if (child.tagName === "VIDEO") {
              (child as HTMLVideoElement).pause();
            }
            if (child.tagName === "IFRAME") {
              const iframeSrc = (child as HTMLIFrameElement).src;
              (child as HTMLIFrameElement).src = iframeSrc;
            }
          }
        }
        setCurrentImage(currentIndex);
      }
    },
    [currentImage]
  );

  const handleSlide = (currentIndex: number) => handleChange(currentIndex);

  const handleBackClick = () => {
    onBackClick && onBackClick();
    handleChange(undefined);
  };

  return (
    <ImageGallery
      lazyLoad={true}
      infinite={false}
      showIndex={true}
      showPlayButton={false}
      showThumbnails={false}
      startIndex={currentImage}
      items={items}
      renderItem={handleRenderItem}
      renderCustomControls={() => {
        return (
          <TextBackButton text="To gallery" onClick={() => handleBackClick()} />
        );
      }}
      onSlide={handleSlide}
    />
  );
}
