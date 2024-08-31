import {
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { City } from "../../../core";
import "./Gallery.scss";
import PhotoAlbum from "react-photo-album";
import { memo, useMemo } from "react";
import { CloseButton, CountryFlag } from "../../atoms";
import { TravelSelector } from "../../molecules";
import { parameters } from "../../../utils/parameters";

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
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  const photos = useMemo(() => {
    return city.travels[travelIdx].photos.map((p) => ({
      src: parameters.isShowPhotos ? p.thumbnail : "",
      width: p.width,
      height: p.height,
    }));
  }, [city, travelIdx]);

  return (
    <div className="gallery">
      <div className="gallery__header">
        <h2>{city.name}</h2>
        <CountryFlag
          countryName={city.country.id}
          className={"gallery__header__flag"}
        />
        <TravelSelector
          cityName={city.name}
          travels={city.travels}
          selectedTravelIdx={travelIdx}
        />
        <CloseButton
          onClick={() => navigate(from === "map" ? "/" : "/?to=visited")}
        />
      </div>
      <div className={`gallery__content`}>
        <div className="gallery__content__photo-album" id="info-tab">
          <PhotoAlbum
            photos={photos}
            layout="rows"
            onClick={({ index }) => navigate(`./${index}`)}
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
});
