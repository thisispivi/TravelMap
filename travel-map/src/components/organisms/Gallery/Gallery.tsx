import { useLoaderData, useNavigate } from "react-router-dom";
import { City } from "../../../core";
import "./Gallery.scss";
import PhotoAlbum from "react-photo-album";
import { memo, useMemo } from "react";
import { CloseButton, CountryFlag } from "../../atoms";
import { TravelSelector } from "../../molecules";

export interface GalleryProps {
  city: City;
  travelIdx: number;
}

/**
 * Gallery component
 *
 * The gallery component is used to display a gallery.
 *
 * @component
 *
 * @returns {JSX.Element} - The gallery
 */
export default memo(function Gallery(): JSX.Element {
  const navigate = useNavigate();
  const { city, travelIdx } = useLoaderData() as GalleryProps;

  const photos = useMemo(() => {
    return city.travels[travelIdx].photos.map((p) => ({
      src: p.thumbnail,
      width: p.width,
      height: p.height,
    }));
  }, [city, travelIdx]);

  return (
    <div className="gallery">
      <div className="gallery__header">
        <h1>{city.name}</h1>
        <CountryFlag
          countryName={city.country.id}
          className={"gallery__header__flag"}
        />
        <TravelSelector
          cityName={city.name}
          travels={city.travels}
          selectedTravelIdx={travelIdx}
        />
        <CloseButton onClick={() => navigate("/?to=visited")} />
      </div>
      <div className={`gallery__content`} id={"gallery"}>
        <PhotoAlbum photos={photos} layout="rows" />
      </div>
    </div>
  );
});
