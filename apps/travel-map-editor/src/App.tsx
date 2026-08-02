import "./App.scss";

import MoonFilledIcon from "@app/assets/icons/MoonFilled.svg?react";
import SunFilledIcon from "@app/assets/icons/SunFilled.svg?react";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { useThemeDetector } from "@app/shared/hooks/useThemeDetector";
import { classNames } from "@app/shared/lib/classNames";
import { ReactNode } from "react";
import { Link, Route, Routes, useParams } from "react-router";

import { DataFile } from "./data/store";
import { Library } from "./features/library/components/Library/Library";
import { CommandPalette } from "./features/palette/components/CommandPalette/CommandPalette";
import { CityScreen } from "./features/places/components/CityScreen/CityScreen";
import { CountryScreen } from "./features/places/components/CountryScreen/CountryScreen";
import { SettingsScreen } from "./features/settings/components/SettingsScreen/SettingsScreen";
import { Workspace } from "./features/workspace/components/Workspace/Workspace";
import { useDataset } from "./shared/hooks/useDataset";

/**
 * Finds an editor document by its stable identifier.
 * @param {DataFile<T>[]} documents - Candidate data files
 * @param {string} [id] - Entity identifier from the route
 * @returns {DataFile<T> | undefined} The matching source file
 */
function findById<T extends { id: string }>(
  documents: DataFile<T>[],
  id?: string,
): DataFile<T> | undefined {
  return documents.find(({ value }) => value.id === id);
}

/**
 * MissingDocument component
 * Explains that a route points at a document the dataset no longer has.
 * @component
 * @returns {ReactNode} The not-found screen
 */
function MissingDocument(): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <main className="editor__screen">
      <div className="editor__empty">
        <p className="editor__eyebrow">{t("app.nothingHere")}</p>
        <h1>{t("app.notFound")}</h1>
        <p>{t("app.notFoundHint")}</p>
        <Link className="editor-button editor-button--primary" to="/">
          {t("app.backToOverview")}
        </Link>
      </div>
    </main>
  );
}

/**
 * TripRoute component
 * Opens the workspace for the trip named in the route. The workspace is keyed
 * by dataset path so switching trips starts a fresh draft and history rather
 * than carrying one trip's undo stack into another.
 * @component
 * @param {TripRouteProps} props
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @returns {ReactNode} The workspace or a not-found message
 */
function TripRoute({ isDarkTheme }: TripRouteProps): ReactNode {
  const file = findById(useDataset().trips, useParams().id);
  return file ? (
    <Workspace file={file} isDarkTheme={isDarkTheme} key={file.path} />
  ) : (
    <MissingDocument />
  );
}

/**
 * Props for TripRoute.
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 */
interface TripRouteProps {
  isDarkTheme: boolean;
}

/**
 * CityRoute component
 * Resolves the city id in the route to its document.
 * @component
 * @param {CityRouteProps} props
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @returns {ReactNode} The city screen or a not-found message
 */
function CityRoute({ isDarkTheme }: CityRouteProps): ReactNode {
  const file = findById(useDataset().cities, useParams().id);
  return file ? (
    <CityScreen file={file} isDarkTheme={isDarkTheme} key={file.path} />
  ) : (
    <MissingDocument />
  );
}

/**
 * Props for CityRoute.
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 */
interface CityRouteProps {
  isDarkTheme: boolean;
}

/**
 * CountryRoute component
 * Resolves the country id in the route to its document.
 * @component
 * @returns {ReactNode} The country screen or a not-found message
 */
function CountryRoute(): ReactNode {
  const file = findById(useDataset().countries, useParams().id);
  return file ? (
    <CountryScreen file={file} key={file.path} />
  ) : (
    <MissingDocument />
  );
}

/**
 * SettingsRoute component
 * Opens the site configuration, which exists whether or not the fork has a
 * file for it yet.
 * @component
 * @returns {ReactNode} The settings screen
 */
function SettingsRoute(): ReactNode {
  return <SettingsScreen file={useDataset().config} key="site-config" />;
}

/**
 * App component
 * The editor shell. Everything is one of two things: the library of trips, or
 * the workspace for one of them. Documents that exist to support a trip are
 * reachable but never the starting point.
 * @component
 * @returns {ReactNode} The local editor UI
 */
export function App(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  return (
    <div
      className={classNames(
        "editor",
        isDarkTheme ? "editor--dark" : "editor--light",
      )}
    >
      <button
        aria-label={t(isDarkTheme ? "nav.switchToLight" : "nav.switchToDark")}
        className="editor__theme-toggle"
        onClick={handleDarkModeSwitch}
        type="button"
      >
        {isDarkTheme ? (
          <SunFilledIcon aria-hidden="true" />
        ) : (
          <MoonFilledIcon aria-hidden="true" />
        )}
      </button>
      <CommandPalette />
      <Routes>
        <Route element={<Library />} path="/" />
        <Route element={<SettingsRoute />} path="/settings" />
        <Route
          element={<TripRoute isDarkTheme={isDarkTheme} />}
          path="/trip/:id"
        />
        <Route
          element={<CityRoute isDarkTheme={isDarkTheme} />}
          path="/places/cities/:id"
        />
        <Route element={<CountryRoute />} path="/places/countries/:id" />
        <Route element={<MissingDocument />} path="*" />
      </Routes>
    </div>
  );
}
