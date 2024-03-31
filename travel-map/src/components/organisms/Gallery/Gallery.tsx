import { useLoaderData } from "react-router-dom";
import { City } from "../../../core";
import "./Gallery.scss";
import PhotoAlbum from "react-photo-album";
import { useMemo } from "react";

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
      <h1>{city.name}</h1>
      <div className={`gallery__content`} id={"gallery"}>
        <PhotoAlbum photos={photos} layout="rows" />
      </div>
    </div>
  );
}
