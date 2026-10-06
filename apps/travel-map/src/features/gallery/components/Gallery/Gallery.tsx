import "./Gallery.scss";
import "react-photo-album/rows.css";

import { mediaUrl } from "@travelmap/core";
import { ReactNode, useEffect, useRef, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import {
  Outlet,
  useLoaderData,
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router";

import PlayIcon from "@/assets/icons/Play.svg?react";
import { visitedTrips } from "@/data/world";
import { CloseButton } from "@/shared/components/CloseButton/CloseButton";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { readNavigationState } from "@/shared/lib/navigationState";
import { parameters } from "@/shared/lib/parameters";
import { getCityPhotoTravels } from "@/shared/lib/travelQueries";

import type { galleryLoader } from "../../loaders/Gallery.loader";
import { TravelSelector } from "../TravelSelector/TravelSelector";

/**
 * Gallery component
 * Masonry photo album for a single city travel. Renders thumbnails via
 * `react-photo-album` and navigates to the Lightbox on click. Supports
 * YouTube video previews with a play-button overlay.
 * @component
 * @returns {ReactNode} The gallery page
 */
export function Gallery(): ReactNode {
  const { currLanguage, t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { city, travel, travelIdx } = useLoaderData<typeof galleryLoader>();
  const { isLightbox } = useAppRoute();
  const { fromPath } = readNavigationState(routerLocation.state);
  const navigationState = fromPath ? { fromPath } : undefined;
  const photos = travel.photos.map((p, i) => ({
    src: parameters.isShowPhotos ? mediaUrl(p.thumbnail) : "",
    width: p.width,
    height: p.height,
    alt: p.alt ?? "",
    youtube: p.youtube,
    index: i,
  }));
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  /**
   * Recomputes whether the photo album overflows its container, so the
   * scrollable area only gets its overflow padding when it actually needs
   * a scrollbar.
   * @returns {void}
   */
  const checkOverflow = () => {
    const el = contentRef.current;
    if (el) setHasOverflow(el.scrollHeight > el.clientHeight);
  };
  const checkOverflowRef = useRef(checkOverflow);

  useEffect(() => {
    checkOverflowRef.current = checkOverflow;
  });

  useEffect(() => {
    /**
     * Rechecks gallery overflow after the browser viewport changes.
     * @returns {void}
     */
    const handleResize = (): void => checkOverflowRef.current();

    checkOverflowRef.current();
    const timeout = setTimeout(() => checkOverflowRef.current(), 500);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [travel]);
  return (
    <div className="gallery">
      <div className="gallery__header">
        <h2>{city.getLocalizedName(currLanguage)}</h2>
        <CountryFlag className="gallery__flag" countryId={city.country.id} />
        <TravelSelector
          cityName={city.name}
          navigationState={navigationState}
          selectedTravelIdx={travelIdx}
          travels={getCityPhotoTravels(city, visitedTrips)}
        />
        <CloseButton
          ariaLabel={t("close")}
          onClick={() => navigate(fromPath ?? "/")}
        />
      </div>
      <div className="gallery__content">
        <div
          className={classNames(
            "gallery__photo-album",
            hasOverflow && "gallery__photo-album--overflow",
          )}
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
                <div className="gallery__image">
                  <img
                    {...props}
                    alt={photo.alt || (photo.youtube ? t("playVideo") : "")}
                    className={props.className}
                  />
                  {/*
                   * The photo album already wraps each thumbnail in a button
                   * that opens it, so the play mark is decoration; a second
                   * button inside it would be invalid nested interactive markup.
                   */}
                  {photo.youtube ? (
                    <>
                      <span aria-hidden="true" className="gallery__play">
                        <PlayIcon />
                      </span>
                      <span aria-hidden="true" className="gallery__gradient" />
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
