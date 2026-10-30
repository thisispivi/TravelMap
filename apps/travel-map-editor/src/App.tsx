import "./App.scss";

import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { useThemeDetector } from "@travelmap/ui/hooks/useThemeDetector";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router";

import { DataFile } from "./data/store";
import { Library } from "./features/library/components/Library/Library";
import { TransportCompanies } from "./features/library/components/TransportCompanies/TransportCompanies";
import { EditorMap } from "./features/map/components/EditorMap/EditorMap";
import { CommandPalette } from "./features/palette/components/CommandPalette/CommandPalette";
import { CityScreen } from "./features/places/components/CityScreen/CityScreen";
import { CountryScreen } from "./features/places/components/CountryScreen/CountryScreen";
import { PlacesIndex } from "./features/places/components/PlacesIndex/PlacesIndex";
import { SettingsScreen } from "./features/settings/components/SettingsScreen/SettingsScreen";
import { Workspace } from "./features/workspace/components/Workspace/Workspace";
import { EditorNav } from "./shared/components/EditorNav/EditorNav";
import { SaveChip } from "./shared/components/SaveChip/SaveChip";
import { useSaveStatus } from "./shared/context/SaveStatus.context";
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
        <Link className="button button--primary" to="/">
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
 * @returns {ReactNode} The workspace or a not-found message
 */
function TripRoute(): ReactNode {
  const file = findById(useDataset().trips, useParams().id);
  return file ? <Workspace file={file} key={file.path} /> : <MissingDocument />;
}

/**
 * PlacesRoute component
 * Opens the countries and cities lists.
 * @component
 * @returns {ReactNode} The places page
 */
function PlacesRoute(): ReactNode {
  return <PlacesIndex />;
}

/**
 * CityRoute component
 * Resolves the city id in the route to its document.
 * @component
 * @returns {ReactNode} The city screen or a not-found message
 */
function CityRoute(): ReactNode {
  const file = findById(useDataset().cities, useParams().id);
  return file ? (
    <CityScreen file={file} key={file.path} />
  ) : (
    <MissingDocument />
  );
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
 * The editor's shell, built like the site's: one map fills the window, the
 * rail runs down its left edge, and every screen opens in a frosted panel
 * beside the map. The map stays mounted while the panel changes, and each
 * screen tells it what to draw.
 * @component
 * @returns {ReactNode} The local editor UI
 */
export function App(): ReactNode {
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  const { status } = useSaveStatus();
  const panelRef = useRef<HTMLElement>(null);
  const [insetLeft, setInsetLeft] = useState(0);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(() =>
      setInsetLeft(panel.getBoundingClientRect().right),
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="editor">
      <EditorMap insetLeft={insetLeft} isDarkTheme={isDarkTheme} />
      <EditorNav
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleDarkModeSwitch}
      />
      <main className="editor__panel" ref={panelRef}>
        <Routes>
          <Route element={<Library />} path="/" />
          <Route element={<PlacesRoute />} path="/places" />
          <Route element={<CompaniesRoute />} path="/companies" />
          <Route element={<SettingsRoute />} path="/settings" />
          <Route element={<TripRoute />} path="/trip/:id" />
          <Route element={<CityRoute />} path="/places/cities/:id" />
          <Route element={<CountryRoute />} path="/places/countries/:id" />
          <Route element={<MissingDocument />} path="*" />
        </Routes>
      </main>
      {status ? (
        <div className="editor__status">
          <SaveChip
            error={status.error}
            onRetry={status.retry}
            savedAt={status.savedAt}
            state={status.state}
          />
        </div>
      ) : null}
      <CommandPalette />
    </div>
  );
}
