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
import { BackButtonWText, Button } from "./components/Button";
import { ReactComponent as DepartureIcon } from "./icons/Departure.svg";
import { ReactComponent as ArrivalIcon } from "./icons/Arrival.svg";
import { ReactComponent as PeopleIcon } from "./icons/People.svg";
import { Tooltip } from "./components/Tooltip";

export default function HomePage() {
  const [hoveredCity, setHoveredCity] = useState<undefined | City>();
  const [currentCity, setCurrentCity] = useState<undefined | City>();
  const [galleryIsOpen, setGalleryIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<undefined | number>();

  const openLightbox = useCallback(({ photo, index }: any) => {
    setCurrentImage(index);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(undefined);
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

  return (
    <div className="container">
      <MapChart
        visited={visited}
        markers={cities}
        hoveredCity={hoveredCity}
        setHoveredCity={setHoveredCity}
      />
      {cities.map((city) => (
        <>
          {!currentCity && (
            <Tooltip
              city={city}
              getCountryFlag={getCountryFlag}
              onClick={(city) => {
                setHoveredCity(undefined);
                setCurrentCity(city);
                setGalleryIsOpen(true);
              }}
            />
          )}
        </>
      ))}
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
                    return <img className="media" src={item.original} alt="" />;
                  }
                }}
                renderCustomControls={() => {
                  return (
                    <BackButtonWText
                      text="To gallery"
                      onClick={() => setCurrentImage(undefined)}
                    />
                  );
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
