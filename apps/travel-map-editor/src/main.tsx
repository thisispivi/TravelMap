import "./styles.css";

import { ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Link, useLocation } from "react-router";

import { CityJson, CountryJson, TripJson } from "@travelmap/core";

/**
 * A dataset file loaded by Vite and saved back through the localhost middleware.
 * @property {string} path - Dataset-relative JSON path
 * @property {T} value - Parsed JSON value
 */
interface DataFile<T> {
  path: string;
  value: T;
}

/**
 * Dataset record with the stable identifier used by the editor routes.
 * @property {string} id - Stable entity identifier
 */
interface Identified {
  id: string;
}

/**
 * Normalizes Vite glob modules into editable dataset files.
 * @param {Record<string, { default: T }>} modules - Eager JSON modules
 * @param {string} prefix - Path segment before data/
 * @returns {DataFile<T>[]} Files sorted by dataset path
 */
function files<T>(
  modules: Record<string, { default: T }>,
  prefix: string,
): DataFile<T>[] {
  return Object.entries(modules)
    .map(([path, { default: value }]) => ({
      path: path.replace(prefix, ""),
      value,
    }))
    .sort((first, second) => first.path.localeCompare(second.path));
}

const countries = files<CountryJson>(
  import.meta.glob("../../../data/*/*.json", { eager: true }),
  "../../../data/",
);
const cities = files<CityJson>(
  import.meta.glob("../../../data/*/*/*.json", { eager: true }),
  "../../../data/",
);
const trips = files<TripJson>(
  import.meta.glob("../../../data/trips/*.json", { eager: true }),
  "../../../data/",
);
const photos = files<unknown>(
  import.meta.glob("../../../data/photos/**/*.json", { eager: true }),
  "../../../data/",
);
const config = files<unknown>(
  import.meta.glob("../../../data/site.config.json", { eager: true }),
  "../../../data/",
)[0];

/**
 * Writes an authored JSON value to the local dataset.
 * @param {string} path - Dataset-relative JSON path
 * @param {unknown} value - Parsed JSON to persist
 * @returns {Promise<void>} Completion once Vite has acknowledged the write
 */
async function writeData(path: string, value: unknown): Promise<void> {
  const response = await fetch("/__data/write", {
    body: JSON.stringify({ path, value }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error((await response.json()).error);
}

/**
 * Editable JSON document panel shared by all v1 editor routes.
 * @param {{ file: DataFile<unknown>; title: string }} props - Document and screen title
 * @returns {ReactNode} JSON editor with save feedback
 */
function JsonEditor({
  file,
  title,
}: {
  file: DataFile<unknown>;
  title: string;
}): ReactNode {
  const [text, setText] = useState(() => JSON.stringify(file.value, null, 2));
  const [message, setMessage] = useState("");

  /**
   * Saves valid JSON and lets Vite reload the editor's source-of-truth glob.
   * @returns {Promise<void>} Completion after the write request finishes
   */
  async function handleSave(): Promise<void> {
    try {
      await writeData(file.path, JSON.parse(text));
      setMessage("Saved. Reloading data…");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save JSON.");
    }
  }

  return (
    <main>
      <h1>{title}</h1>
      <p>{file.path}</p>
      <textarea
        aria-label={`${title} JSON`}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        value={text}
      />
      <p>{message}</p>
      <button onClick={handleSave} type="button">
        Save JSON
      </button>
    </main>
  );
}

/**
 * Finds an editor document from the final path segment.
 * @param {DataFile<T>[]} documents - Candidate data files
 * @param {string} id - Entity id
 * @returns {DataFile<T> | undefined} Matching document when present
 */
function findById<T extends Identified>(
  documents: DataFile<T>[],
  id: string,
): DataFile<T> | undefined {
  return documents.find((document) => document.value.id === id);
}

/**
 * Editor application with dataset navigation and route-specific JSON forms.
 * @returns {ReactNode} Local editor user interface
 */
function App(): ReactNode {
  const { pathname } = useLocation();
  const [, section = ""] = pathname.split("/");
  const id = pathname.split("/")[2];
  const document =
    section === "countries" && id ? findById(countries, id) :
    section === "cities" && id ? findById(cities, id) :
    section === "trips" && id ? findById(trips, id) :
    section === "config" ? config : undefined;

  return (
    <div className="editor">
      <nav>
        <Link to="/">Overview</Link>
        <Link to="/config">Config</Link>
      </nav>
      {document ? (
        <JsonEditor file={document} title={`${section.slice(0, -1) || "site"} editor`} />
      ) : (
        <main>
          <h1>Travel Map Editor</h1>
          <p>
            {countries.length} countries · {cities.length} cities · {trips.length} trips · {photos.length} photo manifests
          </p>
          <section>
            <h2>Countries</h2>
            {countries.map((file) => <Link key={file.path} to={`/countries/${file.value.id}`}>{file.value.name}</Link>)}
          </section>
          <section>
            <h2>Cities</h2>
            {cities.map((file) => <Link key={file.path} to={`/cities/${file.value.id}`}>{file.value.name}</Link>)}
          </section>
          <section>
            <h2>Trips</h2>
            {trips.map((file) => <Link key={file.path} to={`/trips/${file.value.id}`}>{file.value.title}</Link>)}
          </section>
        </main>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
