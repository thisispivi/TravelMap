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
import Carousel from "react-responsive-carousel";
import { City } from "./utils/city";
import { getCityPhotos } from "./utils/photos";
import { Box } from "./components/Box";

export default function HomePage() {
  const [currentCity, setCurrentCity] = useState<undefined | City>();
  const [galleryIsOpen, setGalleryIsOpen] = useState(false);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

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
  console.log(galleryIsOpen);

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
            <Gallery
              photos={getCityPhotos(currentCity?.name || "")}
              onClick={openLightbox}
              layout="rows"
            />
          }
          onClose={() => {
            setCurrentCity(undefined);
            setGalleryIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
