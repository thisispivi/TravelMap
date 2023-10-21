import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import { getCityPhotos } from "../../../utils/photos";
import { City } from "../../../classes/City";
import { TextBackButton } from "../../atoms";
import "./ImageGallery.scss";

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
  const items = getCityPhotos(currentCity?.name || "");
  console.log("items", items);

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

  const renderItems = (item: ItemType) => {
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
            src="https://www.youtube.com/embed/_CaBMaSUx_w"
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

  return (
    <ImageGallery
      lazyLoad={true}
      infinite={false}
      showIndex={true}
      showPlayButton={false}
      showThumbnails={false}
      startIndex={currentImage}
      items={items}
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
