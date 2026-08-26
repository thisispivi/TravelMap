import "./Photographs.scss";
import "react-photo-album/rows.css";

import { Image } from "@travelmap/core";
import { ReactNode, useEffect, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import { useNavigate } from "react-router";

import { findJourney } from "@/data/record";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { Lightbox } from "../Lightbox/Lightbox";

const TARGET_ROW_HEIGHT = 180;

/**
 * Properties accepted by the photographs sheet.
 * @property {string | null} tripId - The journey the stay belongs to
 * @property {number} spanIndex - The stay's position in that journey
 */
interface PhotographsProps {
  tripId: string | null;
  spanIndex: number;
}

/**
 * Photographs component
 * The photographs one stay produced, shown on the plate rather than on a page
 * of their own, so the reader keeps their place in the record while looking at
 * what a stay actually looked like.
 * @component
 * @param {PhotographsProps} props - The photographs props
 * @param {string | null} props.tripId - The journey the stay belongs to
 * @param {number} props.spanIndex - The stay's position in that journey
 * @returns {ReactNode} The stay's photographs, or nothing when the stay has none
 */
export function Photographs({
  tripId,
  spanIndex,
}: PhotographsProps): ReactNode {
  const { t, currLanguage } = useLanguage(["record"]);
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const journey = findJourney(tripId ?? undefined);
  const span = journey?.entry.spans[spanIndex];
  const stay = span?.kind === "stay" ? span : undefined;

  /* Closing with Escape is the expected way out of anything that covers the
     plate, and the sheet is the only thing on screen that can be closed. */
  useEffect(() => {
    if (!stay) return;

    /**
     * Closes the sheet, or the lightbox when one is open above it.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      if (openIndex !== null) setOpenIndex(null);
      else navigate(`/journey/${tripId}`);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, openIndex, stay, tripId]);

  if (!stay || stay.photos.length === 0) return null;

  const photos = stay.photos.map((photo: Image) => ({
    src: photo.thumbnail,
    width: photo.width,
    height: photo.height,
    alt: photo.alt ?? "",
  }));

  return (
    <section
      aria-label={stay.city.getLocalizedName(currLanguage)}
      className="photographs"
    >
      <header className="photographs__head">
        <h2 className="photographs__place">
          {stay.city.getLocalizedName(currLanguage)}
        </h2>
        <span className="photographs__count figure">
          {t("record:photographs", { count: stay.photos.length })}
        </span>
        <button
          className="photographs__close"
          onClick={() => navigate(`/journey/${tripId}`)}
          type="button"
        >
          {t("record:close")}
        </button>
      </header>
      <div className="photographs__album">
        <RowsPhotoAlbum
          onClick={({ index }) => setOpenIndex(index)}
          photos={photos}
          targetRowHeight={TARGET_ROW_HEIGHT}
        />
      </div>
      {openIndex !== null ? (
        <Lightbox
          onClose={() => setOpenIndex(null)}
          photos={stay.photos}
          startIndex={openIndex}
        />
      ) : null}
    </section>
  );
}
