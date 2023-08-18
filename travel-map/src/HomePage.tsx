import MapChart from "./components/MapChart";
import { Country } from "./utils/country";
import { cities } from "./utils/data";
import { ReactComponent as ItalyFlag } from "./icons/Italian.svg";
import { ReactComponent as EnglandFlag } from "./icons/England.svg";
import { ReactComponent as BelgiumFlag } from "./icons/Belgium.svg";
import { ReactComponent as GermanyFlag } from "./icons/Germany.svg";
import { ReactComponent as SpainFlag } from "./icons/Spain.svg";
import { ReactComponent as HungaryFlag } from "./icons/Hungary.svg";
import { useCallback, useState } from "react";
import Gallery from "react-photo-album";
import { City } from "./utils/city";
import { getCityPhotos } from "./utils/photos";
import { Box } from "./components/Box";
import ImageGallery from "react-image-gallery";

export default function HomePage() {
  const [currentCity, setCurrentCity] = useState<undefined | City>();
  const [galleryIsOpen, setGalleryIsOpen] = useState(false);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<undefined | number>();

  const openLightbox = useCallback(({ photo, index }: any) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  const visited = [
    {
      name: "Belgium",
      fill: "rgba(213, 48, 50, 0.4)",
      stroke: "rgba(213, 48, 50, 1)",
    },
    {
      name: "Spain",
      fill: "rgba(243, 159, 24, 0.4)",
      stroke: "rgba(243, 159, 24, 1)",
    },
    {
      name: "Italy",
      fill: "rgba(0, 86, 185, 0.4)",
      stroke: "rgba(0, 86, 185, 1)",
    },
    {
      name: "Hungary",
      fill: "rgba(217, 80, 48, 0.4)",
      stroke: "rgba(217, 80, 48, 1)",
    },
    {
      name: "Germany",
      fill: "rgba(49, 127, 67, 0.4)",
      stroke: "rgba(49, 127, 67, 1)",
    },
    {
      name: "United Kingdom",
      fill: "rgba(132, 195, 190, 0.4)",
      stroke: "rgba(132, 195, 190, 1)",
    },
  ];

  const getCountryFlag = (country: Country) => {
    switch (country) {
      case Country.Belgium:
        return <BelgiumFlag className="flag" />;
      case Country.England:
        return <EnglandFlag className="flag" />;
      case Country.Italy:
        return <ItalyFlag className="flag" />;
      case Country.Germany:
        return <GermanyFlag className="flag" />;
      case Country.Spain:
        return <SpainFlag className="flag" />;
      case Country.Hungary:
        return <HungaryFlag className="flag" />;
      default:
        return null;
    }
  };

  console.log(currentCity);
  console.log(currentImage);

  return (
    <div className="container">
      <MapChart
        visited={visited}
        markers={cities}
        getCountryFlag={getCountryFlag}
        onClick={(city) => {
          setCurrentCity(city);
          setGalleryIsOpen(true);
        }}
      />
      {galleryIsOpen && (
        <Box
          title={
            <>
              <p>{currentCity?.name}</p>
              {currentCity && getCountryFlag(currentCity.country)}
            </>
          }
          content={
            currentImage !== undefined ? (
              <ImageGallery
                lazyLoad={true}
                infinite={true}
                showIndex={true}
                showPlayButton={false}
                showThumbnails={false}
                startIndex={currentImage}
                items={getCityPhotos(currentCity?.name || "")}
                renderItem={(item: any) => {
                  if (item.video) {
                    return (
                      <video className="media" controls>
                        <source src={item.original} type="video/mp4" />
                      </video>
                    );
                  } else {
                    return <img className="media" src={item.original} alt="" />;
                  }
                }}
              />
            ) : (
              <Gallery
                photos={getCityPhotos(currentCity?.name || "").map((photo) => ({
                  src: photo.thumbnail,
                  width: photo.width,
                  height: photo.height,
                }))}
                onClick={openLightbox}
                layout="rows"
              />
            )
          }
          onClose={() => {
            setCurrentCity(undefined);
            setGalleryIsOpen(false);
            setCurrentImage(undefined);
          }}
        />
      )}
    </div>
  );
}

interface CarouselProps {
  photos: {
    src: string;
    width: number;
    height: number;
    video?: string;
  }[];
  index: number;
  next: () => void;
  previous: () => void;
  back: () => void;
}

function Carousel({ photos, index, next, previous, back }: CarouselProps) {
  const total = photos.length;

  // Take the previous and next photos
  const previousPhoto = index === 0 ? undefined : photos[index - 1];
  const currentPhoto = photos[index];
  const nextPhoto = photos[index + 1];

  const media = (photo: any) => {
    const isCurrent = photos.indexOf(photo) === index;
    const mediaClassName = isCurrent ? "media current" : "media";

    return photo.video ? (
      <video className={mediaClassName} controls>
        <source src={photo.video} type="video/mp4" />
      </video>
    ) : (
      <img className={mediaClassName} src={photo.src} alt="" />
    );
  };

  const slideTransform = -index * 100; // Calculate transform based on index

  return (
    <div className="carousel">
      <button onClick={previous}>Prev</button>
      <div
        className="previous"
        style={{ transform: `translateX(${slideTransform + 100}%)` }}
      >
        {previousPhoto && media(previousPhoto)}
      </div>
      <div
        className="current"
        onClick={next}
        style={{ transform: `translateX(${slideTransform}%)` }}
      >
        {currentPhoto && media(currentPhoto)}
      </div>
      <div
        className="next"
        style={{ transform: `translateX(${slideTransform - 100}%)` }}
      >
        {nextPhoto && media(nextPhoto)}
      </div>
      <button onClick={next}>Next</button>
    </div>
  );
}
