import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { ReactNode } from "react";
import { Link, Route, Routes, useParams } from "react-router";

import { DataFile } from "@/data/store";
import { TransportCompanies } from "@/features/companies/components/TransportCompanies/TransportCompanies";
import { CityScreen } from "@/features/places/components/CityScreen/CityScreen";
import { CountryScreen } from "@/features/places/components/CountryScreen/CountryScreen";
import { PlacesIndex } from "@/features/places/components/PlacesIndex/PlacesIndex";
import { SettingsScreen } from "@/features/settings/components/SettingsScreen/SettingsScreen";
import { Library } from "@/features/trips/components/Library/Library";
import { Workspace } from "@/features/trips/components/Workspace/Workspace";
import { useDataset } from "@/shared/hooks/useDataset";

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
 * EditorRoutes component
 * Picks the screen for the current URL: the trips, places, companies and
 * settings tabs, one trip, one city or one country, or a not-found page when
 * an id names no document.
 * @component
 * @returns {ReactNode} The screen for the current route
 */
export function EditorRoutes(): ReactNode {
  return (
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
  );
}
