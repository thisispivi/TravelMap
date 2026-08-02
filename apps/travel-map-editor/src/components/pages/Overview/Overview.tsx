import "./Overview.scss";

import CameraIcon from "@app/assets/icons/Camera.svg?react";
import CityIcon from "@app/assets/icons/City.svg?react";
import GlobeIcon from "@app/assets/icons/Globe.svg?react";
import MapIcon from "@app/assets/icons/Map.svg?react";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { ComponentType, ReactNode, SVGProps } from "react";
import { Link } from "react-router";

import { cities, countries, photos, trips } from "../../../core/dataset";
import { DatasetReport } from "../../../core/validation";

/**
 * One headline number describing the size of the dataset.
 * @property {ComponentType<SVGProps<SVGSVGElement>>} icon - Tile icon
 * @property {string} label - What is being counted
 * @property {number} value - The count
 */
interface Metric {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
}

/**
 * Overview component
 * Shows dataset size and validation results, or a first-run guide when the
 * fork has no data yet.
 * @component
 * @param {OverviewProps} props
 * @param {DatasetReport} props.report - Validation results for the dataset
 * @returns {ReactNode} The overview screen
 */
export function Overview({ report }: OverviewProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const metrics: Metric[] = [
    {
      icon: GlobeIcon,
      label: t("overview.countries"),
      value: countries.length,
    },
    { icon: CityIcon, label: t("overview.cities"), value: cities.length },
    { icon: MapIcon, label: t("overview.trips"), value: trips.length },
    {
      icon: CameraIcon,
      label: t("overview.photoManifests"),
      value: photos.length,
    },
  ];

  if (countries.length === 0)
    return (
      <main className="editor__screen">
        <header className="editor__header">
          <div>
            <p className="editor__eyebrow">{t("overview.gettingStarted")}</p>
            <h1>{t("overview.welcome")}</h1>
          </div>
        </header>
        <section className="editor-panel">
          <p className="editor-panel__hint">{t("overview.introHint")}</p>
          <ol className="overview__steps">
            <li>
              <Link to="/new/country">{t("overview.step1Link")}</Link>{" "}
              {t("overview.step1After")} <code>data/</code>.
            </li>
            <li>{t("overview.step2")}</li>
            <li>{t("overview.step3")}</li>
            <li>
              {t("overview.step4Before")}{" "}
              <Link to="/config">{t("overview.step4Link")}</Link>.
            </li>
          </ol>
          <p className="editor-panel__hint">{t("overview.photosHint")}</p>
        </section>
      </main>
    );
  return (
    <main className="editor__screen">
      <header className="editor__header">
        <div>
          <p className="editor__eyebrow">{t("overview.dataset")}</p>
          <h1>{t("overview.overview")}</h1>
        </div>
      </header>
      <div className="overview__metrics">
        {metrics.map((metric) => (
          <article className="overview__metric" key={metric.label}>
            <metric.icon aria-hidden="true" className="overview__metric-icon" />
            <p className="overview__metric-value">{metric.value}</p>
            <p className="overview__metric-label">{metric.label}</p>
          </article>
        ))}
      </div>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("overview.errors")}</h2>
        {report.errors.length > 0 ? (
          <ul className="editor-notice editor-notice--error">
            {report.errors.map((error) => (
              <li className="editor-notice__item" key={error}>
                {error}
              </li>
            ))}
          </ul>
        ) : (
          <p className="editor-notice editor-notice--success">
            {t("overview.loadsCleanly")}
          </p>
        )}
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("overview.warnings")}
          {report.warnings.length > 0 ? (
            <span className="editor__badge">{report.warnings.length}</span>
          ) : null}
        </h2>
        {report.warnings.length > 0 ? (
          <ul className="editor-notice editor-notice--warning">
            {report.warnings.map((warning) => (
              <li className="editor-notice__item" key={warning}>
                {warning}
              </li>
            ))}
          </ul>
        ) : (
          <p className="editor-panel__hint">{t("overview.nothingToReview")}</p>
        )}
      </section>
    </main>
  );
}

/**
 * Props for Overview.
 * @property {DatasetReport} report - Validation results for the dataset
 */
interface OverviewProps {
  report: DatasetReport;
}
