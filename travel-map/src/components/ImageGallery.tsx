import ImageGallery from "react-image-gallery";
import { getCityPhotos } from "../utils/photos";
import { City } from "../classes/City";
import { TextBackButton } from "./atoms";

interface CustomImageGalleryProps {
  currentCity?: City;
  currentImage?: number;
  onBackClick?: () => void;
  baseUrl?: string;
}

export function CustomImageGallery({
  currentCity,
  currentImage,
  onBackClick,
  baseUrl = "",
}: CustomImageGalleryProps) {
  const renderItems = (item: any) => {
    if (item.video) {
      return (
        <video className="image-gallery-video" controls>
          <source src={baseUrl + item.original} type="video/mp4" />
        </video>
      );
    } else if (item.youtube) {
      return (
        <iframe
          className="image-gallery-video"
          src="https://www.youtube.com/embed/_CaBMaSUx_w"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
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
    <ImageGallery
      lazyLoad={true}
      infinite={false}
      showIndex={true}
      showPlayButton={false}
      showThumbnails={false}
      startIndex={currentImage}
      items={getCityPhotos(currentCity?.name || "")}
      renderItem={renderItems}
      renderCustomControls={() => {
        return (
          <TextBackButton
            text="To gallery"
            onClick={() => onBackClick && onBackClick()}
          />
        );
      }}
    />
  );
}
