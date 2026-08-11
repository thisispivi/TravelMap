import "./App.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { useThemeDetector } from "@app/shared/hooks/useThemeDetector";
import { classNames } from "@app/shared/lib/classNames";
import { ReactNode } from "react";
import { Link, Route, Routes, useParams } from "react-router";

import { DataFile } from "./data/store";
import { Library } from "./features/library/components/Library/Library";
import { TransportCompanies } from "./features/library/components/TransportCompanies/TransportCompanies";
import { CommandPalette } from "./features/palette/components/CommandPalette/CommandPalette";
import { CityScreen } from "./features/places/components/CityScreen/CityScreen";
import { CountryScreen } from "./features/places/components/CountryScreen/CountryScreen";
import { SettingsScreen } from "./features/settings/components/SettingsScreen/SettingsScreen";
import { Workspace } from "./features/workspace/components/Workspace/Workspace";
import { EditorNav } from "./shared/components/EditorNav/EditorNav";
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
 * CompaniesRoute component
 * Opens the transport-company catalogue from the persistent navigation.
 * @component
 * @returns {ReactNode} The company editor screen
 */
function CompaniesRoute(): ReactNode {
  return <TransportCompanies file={useDataset().config} />;
}

/**
 * App component
 * Provides persistent navigation around the dashboard, trip workspace,
 * supporting catalogues, and editor settings.
 * @component
 * @returns {ReactNode} The local editor UI
 */
export function App(): ReactNode {
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  return (
    <div
      className={classNames(
        "editor",
        isDarkTheme ? "editor--dark" : "editor--light",
      )}
    >
      <EditorNav
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleDarkModeSwitch}
      />
      <CommandPalette />
      <Routes>
        <Route element={<Library />} path="/" />
        <Route element={<CompaniesRoute />} path="/companies" />
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
