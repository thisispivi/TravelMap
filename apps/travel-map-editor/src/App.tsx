import "./App.scss";

import { useThemeDetector } from "@app/hooks/style/theme";
import { classNames } from "@app/utils/className";
import { ReactNode } from "react";
import { Link, Route, Routes, useParams } from "react-router";

import { Nav } from "./components/Nav/Nav";
import { CityScreen } from "./components/pages/CityScreen/CityScreen";
import { ConfigScreen } from "./components/pages/ConfigScreen/ConfigScreen";
import { CountryScreen } from "./components/pages/CountryScreen/CountryScreen";
import {
  CreateKind,
  CreateScreen,
} from "./components/pages/CreateScreen/CreateScreen";
import { Overview } from "./components/pages/Overview/Overview";
import { TripScreen } from "./components/pages/TripScreen/TripScreen";
import { cities, config, countries, DataFile, trips } from "./dataset";
import { reviewDataset } from "./validation";

// buildWorld walks the whole dataset, so it runs once per document load rather
// than on every render.
const report = reviewDataset();
const CREATE_KINDS: CreateKind[] = ["city", "trip"];

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
  return (
    <main className="editor__screen">
      <div className="editor__empty">
        <p className="editor__eyebrow">Nothing here</p>
        <h1>Not found</h1>
        <p>That document is not in the dataset.</p>
        <Link className="editor-button editor-button--primary" to="/">
          Back to overview
        </Link>
      </div>
    </main>
  );
}

/**
 * CountryRoute component
 * Resolves the country id in the route to its document.
 * @component
 * @returns {ReactNode} The country screen or a not-found message
 */
function CountryRoute(): ReactNode {
  const file = findById(countries, useParams().id);
  return file ? (
    <CountryScreen file={file} key={file.path} />
  ) : (
    <MissingDocument />
  );
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
  const file = findById(cities, useParams().id);
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
 * TripRoute component
 * Resolves the trip id in the route to its document.
 * @component
 * @returns {ReactNode} The trip screen or a not-found message
 */
function TripRoute(): ReactNode {
  const file = findById(trips, useParams().id);
  return file ? (
    <TripScreen file={file} key={file.path} />
  ) : (
    <MissingDocument />
  );
}

/**
 * CreateRoute component
 * Resolves the create route to a supported document kind.
 * @component
 * @returns {ReactNode} The create screen or a not-found message
 */
function CreateRoute(): ReactNode {
  const { kind } = useParams();
  return CREATE_KINDS.includes(kind as CreateKind) ? (
    <CreateScreen key={kind} kind={kind as CreateKind} />
  ) : (
    <MissingDocument />
  );
}

/**
 * App component
 * The editor shell: a filterable sidebar beside the active document screen,
 * themed with the same tokens and dark/light switch as the public site.
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
      <Nav
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleDarkModeSwitch}
        problemCount={report.errors.length}
      />
      <Routes>
        <Route element={<Overview report={report} />} path="/" />
        <Route element={<ConfigScreen file={config} />} path="/config" />
        <Route element={<CreateRoute />} path="/new/:kind" />
        <Route element={<CountryRoute />} path="/countries/:id" />
        <Route
          element={<CityRoute isDarkTheme={isDarkTheme} />}
          path="/cities/:id"
        />
        <Route element={<TripRoute />} path="/trips/:id" />
        <Route element={<MissingDocument />} path="*" />
      </Routes>
    </div>
  );
}
