import { useLoaderData } from "react-router-dom";
import { City } from "../../../core";
import "./Gallery.scss";

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
  return <div className="gallery">{city.name + " " + travelIdx}</div>;
}
