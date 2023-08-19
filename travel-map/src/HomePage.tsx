import React, { useState, useCallback, useRef } from "react";
import Gallery from "react-photo-album";
import MapChart from "./components/MapChart";
import { Country } from "./utils/country";
import { cities } from "./utils/data";
import { ReactComponent as ItalyFlag } from "./icons/Italian.svg";
import { ReactComponent as EnglandFlag } from "./icons/England.svg";
import { ReactComponent as BelgiumFlag } from "./icons/Belgium.svg";
import { ReactComponent as GermanyFlag } from "./icons/Germany.svg";
import { ReactComponent as SpainFlag } from "./icons/Spain.svg";
import { ReactComponent as HungaryFlag } from "./icons/Hungary.svg";
import { City } from "./utils/city";
import { getCityPhotos } from "./utils/photos";
import { Box } from "./components/Box";
import { Tooltip } from "./components/Tooltip";
import { CustomImageGallery } from "./components/ImageGallery";
import { DarkModeToggle } from "./components/Toogle";

export default function HomePage() {
  const urlPrefix = "";

  // States
  const [hoveredCity, setHoveredCity] = useState<City | undefined>();
  const [currentCity, setCurrentCity] = useState<City | undefined>();
  const [galleryIsOpen, setGalleryIsOpen] = useState(false);
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

  // Close the tooltip and gallery box
  const closeBox = () => {
    setCurrentCity(undefined);
    setGalleryIsOpen(false);
    setCurrentImage(undefined);
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

  // List of visited countries with their styles
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

  // Function to get the flag component for a given country
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
      <DarkModeToggle />

      {/* Map Chart */}
      <MapChart
        visited={visited}
        markers={cities}
        hoveredCity={hoveredCity}
        setHoveredCity={setHoveredCity}
      />

      {/* Render tooltips for each city */}
      {cities.map(
        (city) =>
          !currentCity && (
            <Tooltip
              key={city.name}
              city={city}
              getCountryFlag={getCountryFlag}
              onClick={() => {
                setHoveredCity(undefined);
                setCurrentCity(city);
                setGalleryIsOpen(true);
              }}
              onMouseEnter={() => handleMouseEnter(city)}
              onMouseLeave={() => handleMouseLeave()}
            />
          )
      )}

      {/* Render gallery if it's open */}
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
            )
          }
          onClose={closeBox}
        />
      )}
    </div>
  );
}
