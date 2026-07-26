import "./Overview.scss";

import CameraIcon from "@app/assets/icons/Camera.svg?react";
import CityIcon from "@app/assets/icons/City.svg?react";
import GlobeIcon from "@app/assets/icons/Globe.svg?react";
import MapIcon from "@app/assets/icons/Map.svg?react";
import { ComponentType, ReactNode, SVGProps } from "react";
import { Link } from "react-router";

import { cities, countries, photos, trips } from "../../../dataset";
import { DatasetReport } from "../../../validation";

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
  const metrics: Metric[] = [
    { icon: GlobeIcon, label: "Countries", value: countries.length },
    { icon: CityIcon, label: "Cities", value: cities.length },
    { icon: MapIcon, label: "Trips", value: trips.length },
    { icon: CameraIcon, label: "Photo manifests", value: photos.length },
  ];

  if (countries.length === 0)
    return (
      <main className="editor__screen">
        <header className="editor__header">
          <div>
            <p className="editor__eyebrow">Getting started</p>
            <h1>Welcome</h1>
          </div>
        </header>
        <section className="editor-panel">
          <p className="editor-panel__hint">
            This editor writes the JSON files the public site is built from.
            There is no data yet, so start here.
          </p>
          <ol className="overview__steps">
            <li>
              <Link to="/new/country">Create a country</Link> — its id becomes a
              folder under <code>data/</code>.
            </li>
            <li>Create a city inside it and place it on the map.</li>
            <li>
              Create a trip, then add stops and transport between your cities.
            </li>
            <li>
              Set your site name, locales, and home city in{" "}
              <Link to="/config">Configuration</Link>.
            </li>
          </ol>
          <p className="editor-panel__hint">
            Photos stay outside the editor: upload them with the Python
            uploader, then pick the generated manifest on a stop.
          </p>
        </section>
      </main>
    );
  return (
    <main className="editor__screen">
      <header className="editor__header">
        <div>
          <p className="editor__eyebrow">Dataset</p>
          <h1>Overview</h1>
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
        <h2 className="editor-panel__legend">Errors</h2>
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
            The dataset loads cleanly.
          </p>
        )}
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          Warnings
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
          <p className="editor-panel__hint">Nothing to review.</p>
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
