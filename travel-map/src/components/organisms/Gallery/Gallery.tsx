import "./Gallery.scss";
import "react-photo-album/rows.css";

import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import {
  Outlet,
  useLoaderData,
  useLocation as useRouterLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useLocation } from "@/hooks/location/location";

import { PlayIcon } from "../../../assets";
import { City } from "../../../core";
import { visitedTrips } from "../../../data";
import { useLanguage } from "../../../hooks/language/language";
import { parameters } from "../../../utils/parameters";
import { getTravelByCityIndex } from "../../../utils/trips";
import { CloseButton, CountryFlag } from "../../atoms";
import { TravelSelector } from "../../molecules";

export interface GalleryProps {
  city: City;
  travelIdx: number;
}

type GalleryLocationState = {
  fromPath?: string;
};

/**
 * Gallery component
 *
 * Masonry photo album for a single city travel. Renders thumbnails via
 * `react-photo-album` and navigates to the Lightbox on click. Supports
 * YouTube video previews with a play-button overlay.
 *
 * @component
 *
 * @returns {JSX.Element} The gallery page
 */
export default function Gallery(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { city, travelIdx } = useLoaderData() as GalleryProps;
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const { isLightbox } = useLocation();
  const fromPath = (routerLocation.state as GalleryLocationState | null)
    ?.fromPath;
  const navigationState = fromPath ? { fromPath } : undefined;

  const travel = getTravelByCityIndex(city, travelIdx, visitedTrips);

  const photos = useMemo(
    () =>
      (travel?.photos ?? []).map((p, i) => ({
        src: parameters.isShowPhotos
          ? `${import.meta.env.VITE_CDN_PATH}${p.thumbnail}`
          : "",
        width: p.width,
        height: p.height,
        alt: p.alt ?? "",
        youtube: p.youtube,
        index: i,
      })),
    [travel?.photos],
  );

  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const checkOverflow = useCallback(() => {
    const el = contentRef.current;
    if (el) setHasOverflow(el.scrollHeight > el.clientHeight);
  }, []);

  useEffect(() => {
    checkOverflow();
    const timeout = setTimeout(checkOverflow, 500);
    window.addEventListener("resize", checkOverflow);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [checkOverflow, travel]);

  if (!travel) return <div className="gallery" />;

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
          navigationState={navigationState}
          selectedTravelIdx={travelIdx}
          travels={visitedTrips.flatMap((trip) => trip.getCityTravels(city))}
        />
        <CloseButton
          onClick={() => navigate(fromPath ?? (from === "map" ? "/" : "/"))}
        />
      </div>
      <div className="gallery__content">
        <div
          className={`gallery__content__photo-album ${hasOverflow ? "gallery__content__photo-album--overflow" : ""}`}
          id="gallery"
          ref={contentRef}
          style={{ visibility: isLightbox ? "hidden" : "visible" }}
        >
          <RowsPhotoAlbum
            onClick={({ index }) =>
              navigate(`./${index}`, { state: navigationState })
            }
            photos={photos}
            render={{
              image: (props, { photo }) => (
                <div className="gallery__content__image">
                  <img
                    {...props}
                    alt={photo.alt ?? ""}
                    className={`${props.className ?? ""}`}
                  />
                  {photo.youtube ? (
                    <>
                      <PlayIcon
                        className="gallery__content__image__play"
                        onClick={() =>
                          navigate(`./${photo.index}`, {
                            state: navigationState,
                          })
                        }
                      />
                      <button
                        aria-label={t("lightbox.youtubeVideo")}
                        className="gallery__content__image__gradient"
                        onClick={() =>
                          navigate(`./${photo.index}`, {
                            state: navigationState,
                          })
                        }
                        type="button"
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
