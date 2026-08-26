import "./JourneyRow.scss";

import { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";

import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatBearing, Reckoning } from "@/shared/lib/bearings";
import { classNames } from "@/shared/lib/classNames";
import { formatDistance } from "@/shared/lib/format";

/**
 * Properties accepted by the JourneyRow component.
 * @property {Reckoning} entry - The measured journey the row prints
 * @property {boolean} [showReach] - Whether the distance is printed instead of the dates
 */
interface JourneyRowProps {
  entry: Reckoning;
  showReach?: boolean;
}

/**
 * JourneyRow component
 * One journey in the record. The stroke at its head is angled to the journey's
 * real bearing, so a column of rows reads as a field of directions before any
 * of the words are read, and pointing at a row draws that journey's thread on
 * the plate beside it.
 * @component
 * @param {JourneyRowProps} props - The journey row props
 * @param {Reckoning} props.entry - The measured journey the row prints
 * @param {boolean} [props.showReach=false] - Whether the distance replaces the dates
 * @returns {ReactNode} The journey row
 */
export function JourneyRow({
  entry,
  showReach = false,
}: JourneyRowProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const { focusedTrip, setFocusedTrip, setSelectedTrip } = useMapInteraction();
  const { trip } = entry;
  const title = trip.getLocalizedTitle(lang);
  const countries = trip.getCountriesVisited();
  const isFocused = focusedTrip?.id === trip.id;

  return (
    <li className="journey-row">
      <Link
        aria-label={t("tripCard.openTrip", { trip: title })}
        className={classNames(
          "journey-row__link",
          isFocused && "journey-row__link--focused",
        )}
        onBlur={() => setFocusedTrip(null)}
        onClick={() => setSelectedTrip(trip)}
        onFocus={() => setFocusedTrip(trip)}
        onMouseEnter={() => setFocusedTrip(trip)}
        onMouseLeave={() => setFocusedTrip(null)}
        to={`/trip/${trip.id}`}
      >
        <span
          aria-hidden
          className="journey-row__bearing"
          style={{ "--bearing": entry.bearing } as CSSProperties}
        />

        <span className="journey-row__body">
          <span className="journey-row__title">{title}</span>
          <span className="journey-row__meta">
            <span className="journey-row__flags">
              {countries.map((country) => (
                <CountryFlag
                  className="journey-row__flag"
                  countryId={country.id}
                  key={country.id}
                />
              ))}
            </span>
            <span className="journey-row__reading figure">
              {showReach
                ? formatDistance(entry.distanceKm, lang)
                : formatDateRangeShort({
                    sDateInput: trip.sDate,
                    eDateInput: trip.eDate,
                    locale: lang,
                    includeWeekday: false,
                    showYear: false,
                  })}
            </span>
            <span className="journey-row__degrees reading">
              {formatBearing(entry.bearing)}
            </span>
          </span>
        </span>

        {trip.backgroundImgSource ? (
          <span className="journey-row__plate">
            <img
              alt=""
              className="journey-row__plate-img"
              loading="lazy"
              src={trip.backgroundImgSource}
            />
          </span>
        ) : null}
      </Link>
    </li>
  );
}
