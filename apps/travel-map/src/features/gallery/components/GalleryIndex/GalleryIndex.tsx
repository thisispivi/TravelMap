import "./GalleryIndex.scss";

import { EmptyState } from "@travelmap/ui/components/EmptyState/EmptyState";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDateRangeShort } from "@travelmap/ui/i18n/date";
import { staggerItem, staggerList } from "@travelmap/ui/lib/motion";
import { m } from "framer-motion";
import { ReactNode } from "react";
import { useNavigate } from "react-router";

import { tripAlbums } from "@/data/albums";
import { TripPhotoCard } from "@/shared/components/TripPhotoCard/TripPhotoCard";

const totalPhotos = tripAlbums.reduce((sum, { album }) => sum + album.count, 0);

/**
 * GalleryIndex component
 * Every trip that has photos, newest first, as a grid of the same cards the
 * trip list uses, with the number of photos where those show the nights. Opening
 * one shows its album.
 * @component
 * @returns {ReactNode} The gallery index page
 */
export function GalleryIndex(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();

  return (
    <PanelFrame
      header={
        <PanelHeader
          subtitle={t("gallery.summary", {
            photos: totalPhotos.toLocaleString(currLanguage),
            trips: tripAlbums.length,
          })}
          surface="page"
          title={t("gallery.title")}
        />
      }
    >
      <div className="gallery-index">
        {tripAlbums.length === 0 ? (
          <EmptyState message={t("gallery.empty")} />
        ) : (
          <m.ul
            animate="visible"
            className="gallery-index__grid"
            initial="hidden"
            variants={staggerList}
          >
            {tripAlbums.map(({ trip, album }) => (
              <m.li
                className="gallery-index__item"
                key={trip.id}
                variants={staggerItem}
              >
                <TripPhotoCard
                  meta={`${formatDateRangeShort({
                    eDateInput: trip.eDate,
                    locale: currLanguage,
                    sDateInput: trip.sDate,
                  })} · ${t("gallery.photoCount", { count: album.count })}`}
                  onOpen={() =>
                    navigate(`/gallery/trip/${encodeURIComponent(trip.id)}`)
                  }
                  trip={trip}
                />
              </m.li>
            ))}
          </m.ul>
        )}
      </div>
    </PanelFrame>
  );
}
