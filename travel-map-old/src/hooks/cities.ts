import { useCallback, useState } from "react";
import { City } from "../core/classes/City";

export const useCitiesSelectors = () => {
  // States
  const [hoveredCity, setHoveredCity] = useState<City | undefined>();
  const [currentCity, setCurrentCity] = useState<City | undefined>();
  const [currentImage, setCurrentImage] = useState<number | undefined>();

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
    setHoveredCity(city);
  };

  const handleMouseLeave = () => {
    setHoveredCity(undefined);
  };

  return {
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
    setCurrentCity,
    setCurrentImage,
  };
};
