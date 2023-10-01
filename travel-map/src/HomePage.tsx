import { useState, useCallback, useRef } from "react";
import Gallery from "react-photo-album";
import { orderedCities, visited } from "./utils/data";
import { City } from "./classes/City";
import { getCityPhotos } from "./utils/photos";
import { Tooltip } from "./components/organisms";
import { CustomImageGallery } from "./components/organisms";
import { useTranslation } from "react-i18next";
import { Box, Footer } from "./components/organisms";
import { MapChart } from "./components/organisms";
import { Logo } from "./components/atoms";

const urlPrefix = "";

export default function HomePage() {
  const { i18n, t } = useTranslation(["home"]);
  const currentLanguage = i18n.language;
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const [isDarkMode, setIsDarkMode] = useState(true);

  // States
  const [hoveredCity, setHoveredCity] = useState<City | undefined>();
  const [currentCity, setCurrentCity] = useState<City | undefined>();
  const [currentImage, setCurrentImage] = useState<number | undefined>();

  // Create a ref to hold a timeout ID
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Open the lightbox for an image
  const openLightbox = useCallback(({ index }: { index: number }) => {
    setCurrentImage(index);
  }, []);

  // Close the lightbox
  const closeLightbox = () => {
    setCurrentImage(undefined);
  };

  // Open the tooltip and gallery box
  const openBox = (city: City) => {
    setHoveredCity(undefined);
    setCurrentCity(city);
  };

  // Close the tooltip and gallery box
  const closeBox = () => {
    if (currentCity) {
      setCurrentCity(undefined);
      setCurrentImage(undefined);
    }
  };

  const handleMouseEnter = (city: City) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCity(city);
    hoverTimeoutRef.current = setTimeout(() => {
      if (hoveredCity === city) {
        setHoveredCity(undefined);
      }
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  return (
    <div className="container">
      <Logo urlPrefix={urlPrefix} isDarkMode={isDarkMode} />
      <MapChart
        visited={visited}
        markers={orderedCities}
        hoveredCity={hoveredCity}
        setHoveredCity={setHoveredCity}
        geoUrl={`${urlPrefix}map.json`}
      />
      {orderedCities.map(
        (city) =>
          !currentCity && (
            <Tooltip
              key={city.name}
              city={city}
              onClick={openBox}
              onMouseEnter={() => handleMouseEnter(city)}
              onMouseLeave={() => handleMouseLeave()}
              t={t}
            />
          )
      )}
      {currentCity && (
        <Box
          city={currentCity}
          onClose={closeBox}
          overflow={currentImage !== undefined ? "hidden" : "auto"}
        >
          {currentImage !== undefined ? (
            <CustomImageGallery
              currentCity={currentCity}
              currentImage={currentImage}
              onBackClick={closeLightbox}
              baseUrl={urlPrefix}
            />
          ) : (
            <Gallery
              photos={getCityPhotos(currentCity?.name || "").map((photo) => ({
                src: `${urlPrefix}${photo.thumbnail}`,
                width: photo.width,
                height: photo.height,
              }))}
              onClick={openLightbox}
              layout="rows"
            />
          )}
        </Box>
      )}
      <Footer
        setDarkMode={setIsDarkMode}
        active={currentCity === undefined}
        changeLanguage={changeLanguage}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
