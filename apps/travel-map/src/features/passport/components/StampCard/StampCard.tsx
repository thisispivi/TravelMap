import "./StampCard.scss";

import { Country } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { Coins, Globe, House, Stamp as StampIcon } from "lucide-react";
import { ReactNode } from "react";

import { currencyName, currencySymbol } from "@/shared/lib/currency";

import { PassportEntry } from "../../lib/passport";

/**
 * Properties accepted by the StampCard component.
 * @property {Country} country - The stamp's country
 * @property {PassportEntry[]} entries - Its entries, oldest first
 * @property {boolean} [isIssuing] - Whether it is the issuing country, which counts no entry as a visit
 */
interface StampCardProps {
  country: Country;
  entries: PassportEntry[];
  isIssuing?: boolean;
}

/**
 * StampCard component
 * What a stamp's tooltip shows, laid out as the map's city card: the picture of
 * the place first entered, the country's name and flag with what its drawing
 * shows, and a few facts as pills.
 * @component
 * @param {StampCardProps} props - The card props
 * @param {Country} props.country - The stamp's country
 * @param {PassportEntry[]} props.entries - Its entries, oldest first
 * @param {boolean} [props.isIssuing=false] - Whether it is the issuing country
 * @returns {ReactNode} The card
 */
export function StampCard({
  country,
  entries,
  isIssuing = false,
}: StampCardProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const description = t(`passport.emblems.${country.id}`, {
    defaultValue: "",
  });

  return (
    <div className="stamp-card">
      <CoverImage
        className="stamp-card__image"
        src={entries[0]?.city.getBackgroundImgSourceByIndex(0)}
      />
      <div className="stamp-card__body">
        <p className="stamp-card__title">
          {country.getLocalizedName(currLanguage)}
          <CountryFlag className="stamp-card__flag" countryId={country.id} />
        </p>
        {description ? (
          <p className="stamp-card__emblem">{description}</p>
        ) : null}
        <ul className="stamp-card__facts">
          {isIssuing ? (
            <li className="stamp-card__fact">
              <House aria-hidden="true" className="stamp-card__fact-icon" />
              {t("passport.issuing")}
            </li>
          ) : (
            <li className="stamp-card__fact">
              <StampIcon aria-hidden="true" className="stamp-card__fact-icon" />
              {t("passport.tooltip.entries", { count: entries.length })}
            </li>
          )}
          <li className="stamp-card__fact">
            <Globe aria-hidden="true" className="stamp-card__fact-icon" />
            {t(`continents.${country.continent}`)}
          </li>
          {country.currency ? (
            <li className="stamp-card__fact">
              <Coins aria-hidden="true" className="stamp-card__fact-icon" />
              {currencySymbol(country.currency, currLanguage)}{" "}
              {currencyName(country.currency, currLanguage)}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
