import "./Lightbox.scss";
import "react-image-gallery/styles/image-gallery.css";

import { Image } from "@travelmap/core";
import { ReactNode, useEffect, useRef } from "react";
import ImageGallery, { ImageGalleryProps } from "react-image-gallery";

import CloseIcon from "@/assets/icons/Close.svg?react";
import { useLanguage } from "@/shared/hooks/useLanguage";

/**
 * One slide handed to the underlying gallery, carrying the extra fields the
 * dataset attaches to a photograph.
 */
type LightboxItem = ImageGalleryProps["items"][number] & {
  youtube?: boolean;
  alt?: string;
};

/**
 * Properties accepted by the lightbox.
 * @property {Image[]} photos - The stay's photographs
 * @property {number} startIndex - The photograph to open on
 * @property {() => void} onClose - Dismisses the lightbox
 */
interface LightboxProps {
  photos: Image[];
  startIndex: number;
  onClose: () => void;
}

/**
 * Builds a complete embed URL for a video, accepting either a full URL or the
 * bare identifier the dataset usually stores.
 * @param {string} original - The stored URL or video identifier
 * @returns {string} The embed URL
 */
function toEmbedSrc(original: string): string {
  const normalized = original.replace(/^https:\//, "https://");
  if (/^https?:\/\//.test(normalized)) return normalized;

  return `${import.meta.env.VITE_YOUTUBE_PATH ?? "https://www.youtube.com/embed/"}${normalized}`;
}

/**
 * Renders a video embed for video slides and a plain image for the rest.
 * @param {LightboxItem} item - The slide to render
 * @returns {ReactNode} The rendered slide
 */
function renderSlide(item: LightboxItem): ReactNode {
  return item.youtube ? (
    <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="lightbox__video"
      src={toEmbedSrc(item.original)}
      title={item.alt ?? ""}
    />
  ) : (
    <img alt={item.alt ?? ""} className="lightbox__image" src={item.original} />
  );
}

/**
 * Lightbox component
 * One photograph at full size, over the sheet that listed it. It is deliberately
 * plain: the record does the talking, and a photograph shown large needs
 * nothing around it but a way out.
 * @component
 * @param {LightboxProps} props - The lightbox props
 * @param {Image[]} props.photos - The stay's photographs
 * @param {number} props.startIndex - The photograph to open on
 * @param {() => void} props.onClose - Dismisses the lightbox
 * @returns {ReactNode} The lightbox overlay
 */
export function Lightbox({
  photos,
  startIndex,
  onClose,
}: LightboxProps): ReactNode {
  const { t } = useLanguage(["record"]);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* Opening it as a modal rather than rendering an overlay is what gives the
     viewer focus trapping, Escape, inertness of the page behind it and the
     backdrop — all of which would otherwise have to be rebuilt by hand. */
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const items: LightboxItem[] = photos.map((photo) => ({
    original: photo.original,
    thumbnail: photo.thumbnail,
    alt: photo.alt ?? "",
    youtube: photo.youtube,
  }));

  return (
    <dialog
      aria-label={t("record:photographsOpen")}
      className="lightbox"
      onClose={onClose}
      ref={dialogRef}
    >
      <button
        aria-label={t("record:close")}
        className="lightbox__close"
        onClick={onClose}
        type="button"
      >
        <CloseIcon className="lightbox__icon" />
      </button>
      <ImageGallery
        items={items}
        renderItem={renderSlide}
        showFullscreenButton={false}
        showIndex
        showPlayButton={false}
        showThumbnails={false}
        startIndex={startIndex}
      />
    </dialog>
  );
}
