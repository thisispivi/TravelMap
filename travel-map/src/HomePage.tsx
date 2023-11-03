import { useState } from "react";
import Gallery from "react-photo-album";
import { orderedCities, visited } from "./utils/data";
import { getCityPhotos } from "./utils/photos";
import { Navbar, Tooltip } from "./components/organisms";
import { CustomImageGallery } from "./components/organisms";
import { Box, Footer } from "./components/organisms";
import { MapChart } from "./components/organisms";
import { useLanguage } from "./hooks/language";
import { useCitiesSelectors } from "./hooks/cities";

const urlPrefix = process.env.REACT_APP_BASE_URL || "";

export default function HomePage() {
  const { t, currentLanguage, changeLanguage } = useLanguage(["home"]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
    hoveredCity,
    currentCity,
    currentImage,
    openLightbox,
    closeLightbox,
    openBox,
    closeBox,
    handleMouseEnter,
    handleMouseLeave,
    setHoveredCity,
    setCurrentImage,
  } = useCitiesSelectors();

  return (
    <div className="container">
      <Navbar isDarkMode={isDarkMode} active={currentCity === undefined} />
      <MapChart
        visited={visited}
        markers={orderedCities}
        hoveredCity={hoveredCity}
        setHoveredCity={setHoveredCity}
        geoUrl={`https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json`}
        isDarkMode={isDarkMode}
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
          overflow="hidden"
          className={currentImage !== undefined ? "show-single" : "show-all"}
        >
          <div
            className="single-container"
            style={{
              overflow: "hidden",
            }}
          >
            <CustomImageGallery
              currentCity={currentCity}
              currentImage={currentImage}
              onBackClick={closeLightbox}
              baseUrl={urlPrefix}
              setCurrentImage={setCurrentImage}
            />
          </div>
          <div
            className="all-container"
            style={{
              overflowX: "hidden",
              overflowY: currentImage !== undefined ? "hidden" : "scroll",
            }}
          >
            <Gallery
              photos={getCityPhotos(currentCity?.name || "").map((photo) => ({
                src: `${urlPrefix}${photo.thumbnail}`,
                width: photo.width,
                height: photo.height,
              }))}
              onClick={openLightbox}
              layout="rows"
            />
          </div>
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
