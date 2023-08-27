import React, { useState, useCallback, useRef } from "react";
import Gallery from "react-photo-album";
import MapChart from "./components/MapChart";
import { orderedCities, visited } from "./utils/data";
import { City } from "./utils/city";
import { getCityPhotos } from "./utils/photos";
import { Box } from "./components/Box";
import { Tooltip } from "./components/Tooltip";
import { CustomImageGallery } from "./components/ImageGallery";
import { DarkModeToggle } from "./components/Toogle";
import { LanguageDropdown } from "./components/Language";
import { useTranslation } from "react-i18next";
import { ReactComponent as ItalyFlag } from "./icons/Italian.svg";
import { ReactComponent as EnglandFlag } from "./icons/England.svg";
import { ReactComponent as BelgiumFlag } from "./icons/Belgium.svg";
import { ReactComponent as GermanyFlag } from "./icons/Germany.svg";
import { ReactComponent as SpainFlag } from "./icons/Spain.svg";
import { ReactComponent as HungaryFlag } from "./icons/Hungary.svg";

const urlPrefix = "TravelMap/";

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
  const [galleryClass, setGalleryClass] = useState("hidden");

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
    setGalleryClass("active");
    setHoveredCity(undefined);
    setCurrentCity(city);
  };

  // Close the tooltip and gallery box
  const closeBox = () => {
    if (currentCity) {
      setGalleryClass("closing");
      setTimeout(() => {
        setCurrentCity(undefined);
        setCurrentImage(undefined);
        setGalleryClass("hidden");
      }, 490);
    }
  };

  // Handle mouse enter on a city
  const handleMouseEnter = (city: City) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set the hovered city
    setHoveredCity(city);

    // Create a new timeout to clear the hover after 500ms
    hoverTimeoutRef.current = setTimeout(() => {
      // Check if a new city value has appeared within 500ms
      if (hoveredCity === city) {
        setHoveredCity(undefined);
      }
    }, 1000);
  };

  // Handle mouse leave on a city
  const handleMouseLeave = () => {
    // Clear the timeout when the mouse leaves
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Set the hovered city to undefined immediately
    setHoveredCity(undefined);
  };

  function getCountryFlag(id: string) {
    switch (id) {
      case "Belgium":
        return <BelgiumFlag className="flag" />;
      case "UnitedKingdom":
        return <EnglandFlag className="flag" />;
      case "Italy":
        return <ItalyFlag className="flag" />;
      case "Germany":
        return <GermanyFlag className="flag" />;
      case "Spain":
        return <SpainFlag className="flag" />;
      case "Hungary":
        return <HungaryFlag className="flag" />;
      default:
        return null;
    }
  }

  return (
    <div className="container">
      <img
        src={`${urlPrefix}logo-full-${isDarkMode ? "white" : "black"}.png`}
        alt="logo"
        className="logo"
      />

      <DarkModeToggle
        className={currentCity ? "hidden" : ""}
        setDarkMode={setIsDarkMode}
      />
      <LanguageDropdown
        currentLanguage={currentLanguage}
        onClick={changeLanguage}
        className={currentCity ? "hidden" : ""}
      />
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
              getCountryFlag={getCountryFlag}
              onClick={openBox}
              onMouseEnter={() => handleMouseEnter(city)}
              onMouseLeave={() => handleMouseLeave()}
              t={t}
            />
          )
      )}
      <Box
        title={
          <>
            <p>{currentCity?.name}</p>
            {currentCity && getCountryFlag(currentCity.country.id)}
          </>
        }
        className={galleryClass}
        onClose={closeBox}
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
    </div>
  );
}
