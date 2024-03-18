import { City, Country } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { ModeHandler } from "../../../hooks/mode/mode";
import "./InfoTabVisited.scss";

interface InfoTabVisitedProps {
  className?: string;
  modeHandler: ModeHandler;
  visitedCountries: Record<string, Country>;
  visitedCities: City[];
}

/**
 * InfoTabVisited component
 *
 * The info tab visited component is used to display the visited
 * cities and countries.
 *
 * @component
 *
 * @param {InfoTabVisitedProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab visited
 * @param {ModeHandler} props.modeHandler - The mode handler
 * @param {Record<string, Country>} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @returns {JSX.Element} - The info tab visited
 */
export default function InfoTabVisited({
  className = "",
}: InfoTabVisitedProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  return (
    <div className={`info-tab-visited ${className}`}>
      <div className="info-tab-visited__header">
        <h1>{t("visited.title")}</h1>
      </div>
      <div className="info-tab-visited__content">
        <p>
          I am planning to visit these countries in the visited. If you have any
          recommendations, feel free to reach out to me.
        </p>
      </div>
    </div>
  );
}
