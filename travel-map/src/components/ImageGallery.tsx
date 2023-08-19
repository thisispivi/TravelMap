import ImageGallery from "react-image-gallery";
import { getCityPhotos } from "../utils/photos";
import { City } from "../utils/city";
import { BackButtonWText } from "./Button";

interface CustomImageGalleryProps {
  currentCity?: City;
  currentImage?: number;
  onBackClick?: () => void;
}

export function CustomImageGallery({
  currentCity,
  currentImage,
  onBackClick,
}: CustomImageGalleryProps) {
  const baseUrl = "TravelMap/";
  const renderItems = (item: any) => {
    if (item.video) {
      return (
        <video className="media" controls>
          <source src={baseUrl + item.original} type="video/mp4" />
        </video>
      );
    } else if (item.youtube) {
      return (
        <iframe
          src="https://www.youtube.com/embed/_CaBMaSUx_w"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      );
    } else {
      return <img className="media" src={baseUrl + item.original} alt="" />;
    }
  };

  return (
    <ImageGallery
      lazyLoad={true}
      infinite={true}
      showIndex={true}
      showPlayButton={false}
      showThumbnails={false}
      startIndex={currentImage}
      items={getCityPhotos(currentCity?.name || "")}
      renderItem={renderItems}
      renderCustomControls={() => {
        return (
          <BackButtonWText
            text="To gallery"
            onClick={() => onBackClick && onBackClick()}
          />
        );
      }}
    />
  );
}
