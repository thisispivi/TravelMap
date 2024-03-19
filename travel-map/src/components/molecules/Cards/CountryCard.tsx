import { PropsWithChildren } from "react";
import useLanguage from "../../../hooks/language/language";
import "./CountryCard.scss";

interface CountryCardProps extends PropsWithChildren {
  className?: string;
  countryName: string;
}

export default function CountryCard({
  className = "",
  countryName,
  children,
}: CountryCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  return (
    <div className={`country-card ${className} ${countryName}`}>
      <div className="country-card__header">
        <h2>{t(`countries.${countryName}`)}</h2>
      </div>
      <div className="country-card__content">{children}</div>
    </div>
  );
}
