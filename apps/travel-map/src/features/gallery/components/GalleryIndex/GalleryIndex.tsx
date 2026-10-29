import "./GalleryIndex.scss";

import { m } from "framer-motion";
import { Images } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router";

import { tripAlbums } from "@/data/albums";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CoverImage } from "@/shared/components/CoverImage/CoverImage";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { PanelFrame } from "@/shared/components/PanelFrame/PanelFrame";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { staggerItem, staggerList } from "@/shared/lib/motion";

const totalPhotos = tripAlbums.reduce((sum, { album }) => sum + album.count, 0);

/**
 * GalleryIndex component
 * Every trip that has photos, newest first, as a grid of covers with the
 * dates and the number of photos. Opening one shows its album.
 * @component
 * @returns {ReactNode} The gallery index page
 */
export function GalleryIndex(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();

  return (
    <PanelFrame
      header={
        <PageHeader
          subtitle={t("gallery.summary", {
            photos: totalPhotos.toLocaleString(currLanguage),
            trips: tripAlbums.length,
          })}
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
                <button
                  className="gallery-index__card"
                  onClick={() =>
                    navigate(`/gallery/trip/${encodeURIComponent(trip.id)}`)
                  }
                  type="button"
                >
                  <CoverImage
                    className="gallery-index__cover"
                    src={trip.backgroundImgSource}
                  />
                  <span className="gallery-index__count">
                    <Images
                      aria-hidden="true"
                      className="gallery-index__count-icon"
                    />
                    {album.count}
                  </span>
                  <span className="gallery-index__caption">
                    <span className="gallery-index__title">
                      {trip.getLocalizedTitle(currLanguage)}
                    </span>
                    <span className="gallery-index__dates">
                      {formatDateRangeShort({
                        eDateInput: trip.eDate,
                        locale: currLanguage,
                        sDateInput: trip.sDate,
                      })}
                    </span>
                  </span>
                </button>
              </m.li>
            ))}
          </m.ul>
        )}
      </div>
    </PanelFrame>
  );
}
