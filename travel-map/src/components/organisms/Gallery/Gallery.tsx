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
import { PlayIcon } from "../../../assets";
import useLanguage from "../../../hooks/language/language";

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
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { city, travelIdx } = useLoaderData() as GalleryProps;
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  const photos = useMemo(() => {
    return city.travels[travelIdx].photos.map((p, i) => ({
      src: parameters.isShowPhotos ? p.thumbnail : "",
      width: p.width,
      height: p.height,
      youtube: p.youtube,
      index: i,
    }));
  }, [city, travelIdx]);

  return (
    <div className="gallery">
      <div className="gallery__header">
        <h2>{city.getName(t)}</h2>
        <CountryFlag
          className="gallery__header__flag"
          countryId={city.country.id}
        />
        <TravelSelector
          cityName={city.name}
          selectedTravelIdx={travelIdx}
          travels={city.travels}
        />
        <CloseButton
          onClick={() => navigate(from === "map" ? "/" : "/?to=visited")}
        />
      </div>
      <div className="gallery__content">
        <div className="gallery__content__photo-album" id="info-tab">
          <PhotoAlbum
            layout="rows"
            onClick={({ index }) => navigate(`./${index}`)}
            photos={photos}
            renderPhoto={({ photo, wrapperStyle, renderDefaultPhoto }) => (
              <div className="gallery__content__image" style={wrapperStyle}>
                {photo.youtube ? (
                  <>
                    <PlayIcon
                      className="gallery__content__image__play"
                      onClick={() => navigate(`./${photo.index}`)}
                    />
                    <div
                      className="gallery__content__image__gradient"
                      onClick={() => navigate(`./${photo.index}`)}
                    />
                  </>
                ) : null}
                {renderDefaultPhoto({ wrapped: true })}
              </div>
            )}
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
});
