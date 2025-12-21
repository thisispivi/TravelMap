import {
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { City } from "../../../core";
import "./Gallery.scss";
import { RowsPhotoAlbum } from "react-photo-album";
import { JSX, useMemo } from "react";
import { CloseButton, CountryFlag } from "../../atoms";
import { TravelSelector } from "../../molecules";
import { parameters } from "../../../utils/parameters";
import { PlayIcon } from "../../../assets";
import useLanguage from "../../../hooks/language/language";
import "react-photo-album/rows.css";

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
export default function Gallery(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { city, travelIdx } = useLoaderData() as GalleryProps;
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  const travel = city.travels[travelIdx];

  const photos = useMemo(
    () =>
      travel.photos.map((p, i) => ({
        src: parameters.isShowPhotos
          ? `${import.meta.env.VITE_CDN_PATH}${p.thumbnail}`
          : "",
        width: p.width,
        height: p.height,
        youtube: p.youtube,
        index: i,
      })),
    [travel.photos],
  );

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
        <div className="gallery__content__photo-album" id="gallery">
          <RowsPhotoAlbum
            onClick={({ index }) => navigate(`./${index}`)}
            photos={photos}
            render={{
              image: (props, { photo }) => (
                <div className="gallery__content__image">
                  <img {...props} className={`${props.className ?? ""}`} />
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
                </div>
              ),
            }}
            rowConstraints={travel.rowConstraints}
            targetRowHeight={travel.targetRowHeight}
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
