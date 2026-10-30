import "./TripPhotoCard.scss";

import { Trip } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { ReactNode } from "react";

/**
 * Properties accepted by the TripPhotoCard component.
 * @property {Trip} trip - The trip
 * @property {string} meta - The line under the title
 * @property {() => void} onOpen - Runs when the card is pressed
 */
interface TripPhotoCardProps {
  trip: Trip;
  meta: string;
  onOpen: () => void;
}

/**
 * TripPhotoCard component
 * A trip as its cover filling the card, with the title and a line of detail
 * printed over it and the flags of the countries it reached in a corner. The
 * trip list and the gallery both show trips this way.
 * @component
 * @param {TripPhotoCardProps} props - The card props
 * @param {Trip} props.trip - The trip
 * @param {string} props.meta - The line under the title
 * @param {() => void} props.onOpen - Runs when the card is pressed
 * @returns {ReactNode} The card
 */
export function TripPhotoCard({
  trip,
  meta,
  onOpen,
}: TripPhotoCardProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);

  return (
    <button className="trip-photo-card" onClick={onOpen} type="button">
      <CoverImage
        className="trip-photo-card__cover"
        src={trip.backgroundImgSource}
      />
      <span className="trip-photo-card__flags">
        {trip.getCountriesVisited().map((country) => (
          <CountryFlag
            className="trip-photo-card__flag"
            countryId={country.id}
            key={country.id}
          />
        ))}
      </span>
      <span className="trip-photo-card__caption">
        <span className="trip-photo-card__title">
          {trip.getLocalizedTitle(currLanguage)}
        </span>
        <span className="trip-photo-card__meta">{meta}</span>
      </span>
    </button>
  );
}
