import "./styles.css";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  buildWorld,
  CityJson,
  CountryJson,
  Image,
  TripJson,
  TripStopJson,
  TripTransportJson,
} from "@travelmap/core";
import { FormEvent, ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import Map, { MapLayerMouseEvent, Marker } from "react-map-gl/maplibre";
import { BrowserRouter, Link, useLocation } from "react-router";

/**
 * A dataset file loaded by Vite and saved through the localhost middleware.
 * @property {string} path - Dataset-relative JSON path
 * @property {T} value - Parsed JSON value
 */
interface DataFile<T> {
  path: string;
  value: T;
}

/**
 * Site settings which are useful to edit without exposing the public app's internals.
 * @property {{ name?: string; domain?: string; description?: string; author?: string; keywords?: string[] }} [site] - Site metadata
 * @property {string | null} [homeCityId] - Home city reference
 * @property {string[]} [livedCityIds] - Former-home city references
 * @property {string[]} [futureCityIds] - Planned city references
 * @property {{ defaultZoom: number; defaultMinZoom: number; defaultMaxZoom: number; defaultCenter: [number, number]; hoveredCityZoom: number; marker: { defaultScale: number; minScale: number; maxScale: number } }} [map] - Map settings
 * @property {{ groupByCitiesCutoffYear: number }} [trips] - Trip display settings
 * @property {Record<string, string[]>} [unescoSites] - UNESCO city references by country
 * @property {Record<string, { name: string; logo?: string }>} [companies] - Transport companies
 */
interface SiteConfig {
  site?: {
    name?: string;
    domain?: string;
    description?: string;
    author?: string;
    keywords?: string[];
  };
  homeCityId?: string | null;
  livedCityIds?: string[];
  futureCityIds?: string[];
  map?: {
    defaultZoom: number;
    defaultMinZoom: number;
    defaultMaxZoom: number;
    defaultCenter: [number, number];
    hoveredCityZoom: number;
    marker: { defaultScale: number; minScale: number; maxScale: number };
  };
  trips?: { groupByCitiesCutoffYear: number };
  unescoSites?: Record<string, string[]>;
  companies?: Record<string, { name: string; logo?: string }>;
}

/**
 * Converts Vite's eager JSON modules into stable, editable data files.
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
  import.meta.glob(
    ["../../../data/*/*.json", "!../../../data/trips/*.json"],
    { eager: true },
  ),
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
const photos = files<Image[]>(
  import.meta.glob("../../../data/photos/**/*.json", { eager: true }),
  "../../../data/",
);
const config = files<SiteConfig>(
  import.meta.glob("../../../data/site.config.json", { eager: true }),
  "../../../data/",
)[0];
const photoPaths = photos.map(({ path }) =>
  path.replace(/^photos\//, "").replace(/\.json$/, ""),
);
const companyIds = Object.keys(config.value.companies ?? {}).sort();
const locales = [
  ...new Set(
    [...countries, ...cities]
      .flatMap(({ value }) => Object.keys(value.nameByLocale ?? {}))
      .concat(
        trips.flatMap(({ value }) => Object.keys(value.titleByLocale ?? {})),
      ),
  ),
].sort();

/**
 * Persists an authored JSON value using the local-only Vite middleware.
 * @param {string} path - Dataset-relative JSON path
 * @param {unknown} value - Parsed JSON value to persist
 * @returns {Promise<void>} Completion once the write is acknowledged
 */
async function writeData(path: string, value: unknown): Promise<void> {
  const response = await fetch("/__data/write", {
    body: JSON.stringify({ path, value }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok)
    throw new Error(((await response.json()) as { error: string }).error);
}

/**
 * Validates dataset references and surfaces authoring mistakes on the overview.
 * @returns {string[]} Human-readable validation errors
 */
function validationErrors(): string[] {
  const photoIndex: Record<string, Image[]> = Object.fromEntries(
    photos.map(({ path, value }) => [
      path.replace(/^photos\//, "").replace(/\.json$/, ""),
      value,
    ]),
  );
  const errors: string[] = [];
  try {
    buildWorld({
      cities: cities.map(({ value }) => value),
      countries: countries.map(({ value }) => value),
      futureCityIds: config.value.futureCityIds,
      homeCityId: config.value.homeCityId,
      livedCityIds: config.value.livedCityIds,
      photos: photoIndex,
      trips: trips.map(({ value }) => value),
    });
  } catch (error) {
    errors.push(
      error instanceof Error
        ? error.message
        : "The dataset could not be built.",
    );
  }
  const usedCities = new Set(
    trips.flatMap(({ value }) =>
      value.steps.flatMap((step) =>
        step.type === "stop"
          ? [step.cityId]
          : [step.fromId, step.toId, ...(step.viaIds ?? [])],
      ),
    ),
  );
  cities
    .filter(({ value }) => !usedCities.has(value.id))
    .forEach(({ value }) =>
      errors.push(`City ${value.id} is not used by a trip.`),
    );
  trips
    .filter(({ value }) => value.steps.length === 0)
    .forEach(({ value }) =>
      errors.push(`Trip ${value.id} has no itinerary steps.`),
    );
  return errors;
}

/**
 * EditorForm component
 * Displays and saves a dataset form with consistent feedback.
 * @component
 * @param {object} props - Form content and persistence details
 * @param {ReactNode} props.children - Form fields
 * @param {DataFile<T>} props.file - Source JSON document
 * @param {(value: T) => T} props.onSave - Reads the latest draft value
 * @param {string} props.title - Screen title
 * @returns {ReactNode} Saveable form frame
 */
function EditorForm<T>({
  children,
  file,
  onSave,
  title,
}: {
  children: ReactNode;
  file: DataFile<T>;
  onSave: (value: T) => T;
  title: string;
}): ReactNode {
  const [message, setMessage] = useState("");

  /**
   * Saves the latest authored value to disk.
   * @param {FormEvent<HTMLFormElement>} event - Form submit event
   * @returns {Promise<void>} Completion after the write request
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    try {
      await writeData(file.path, onSave(file.value));
      setMessage("Saved. Vite will reload the dataset.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save the JSON file.",
      );
    }
  }
  return (
    <main>
      <h1>{title}</h1>
      <p className="path">{file.path}</p>
      <form onSubmit={handleSubmit}>
        {children}
        <footer>
          <button type="submit">Save changes</button>
          <output>{message}</output>
        </footer>
      </form>
    </main>
  );
}

/**
 * LocalizedNames component
 * Renders canonical and locale-specific name fields.
 * @component
 * @param {object} props - Localized field state
 * @param {string} props.label - Fieldset label
 * @param {{ name: string; nameByLocale?: Record<string, string> }} props.names - Current names
 * @param {string} props.names.name - Canonical name
 * @param {Record<string, string>} [props.names.nameByLocale] - Localized names
 * @param {(names: { name: string; nameByLocale?: Record<string, string> }) => void} props.onChange - Name update callback
 * @returns {ReactNode} Name inputs
 */
function LocalizedNames({
  label,
  names,
  onChange,
}: {
  label: string;
  names: { name: string; nameByLocale?: Record<string, string> };
  onChange: (names: {
    name: string;
    nameByLocale?: Record<string, string>;
  }) => void;
}): ReactNode {
  /**
   * Updates a localized text field.
   * @param {string} locale - Locale key or canonical marker
   * @param {string} value - New text
   * @returns {void}
   */
  function handleChange(locale: string, value: string): void {
    onChange(
      locale === "canonical"
        ? { ...names, name: value }
        : {
            ...names,
            nameByLocale: { ...names.nameByLocale, [locale]: value },
          },
    );
  }
  return (
    <fieldset>
      <legend>{label}</legend>
      <label>
        Canonical
        <input
          onChange={(event) => handleChange("canonical", event.target.value)}
          value={names.name}
        />
      </label>
      {locales.map((locale) => (
        <label key={locale}>
          {locale}
          <input
            onChange={(event) => handleChange(locale, event.target.value)}
            value={names.nameByLocale?.[locale] ?? ""}
          />
        </label>
      ))}
    </fieldset>
  );
}

/**
 * CountryEditor component
 * @component
 * @param {object} props - Country source file
 * @param {DataFile<CountryJson>} props.file - Country source file
 * @returns {ReactNode} Country editor screen
 */
function CountryEditor({ file }: { file: DataFile<CountryJson> }): ReactNode {
  const [value, setValue] = useState(file.value);
  return (
    <EditorForm
      file={file}
      onSave={() => value}
      title={`Country: ${value.name}`}
    >
      <LocalizedNames
        label="Names"
        names={value}
        onChange={(names) => setValue({ ...value, ...names })}
      />
      <fieldset>
        <legend>Classification</legend>
        <label>
          Continent
          <input
            onChange={(event) =>
              setValue({
                ...value,
                continent: event.target.value as CountryJson["continent"],
              })
            }
            value={value.continent}
          />
        </label>
        <label>
          Currency
          <input
            onChange={(event) =>
              setValue({
                ...value,
                currency: event.target.value as CountryJson["currency"],
              })
            }
            value={value.currency}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Map colour</legend>
        <label>
          Hue
          <input
            max="360"
            min="0"
            onChange={(event) =>
              setValue({
                ...value,
                color: { ...value.color, h: Number(event.target.value) },
              })
            }
            type="number"
            value={value.color.h}
          />
        </label>
        <label>
          Saturation
          <input
            max="100"
            min="0"
            onChange={(event) =>
              setValue({
                ...value,
                color: { ...value.color, s: Number(event.target.value) },
              })
            }
            type="number"
            value={value.color.s}
          />
        </label>
        <label>
          Lightness
          <input
            max="100"
            min="0"
            onChange={(event) =>
              setValue({
                ...value,
                color: { ...value.color, l: Number(event.target.value) },
              })
            }
            type="number"
            value={value.color.l}
          />
        </label>
        <span
          className="swatch"
          style={{
            background: `hsl(${value.color.h} ${value.color.s}% ${value.color.l}%)`,
          }}
        />
      </fieldset>
      <fieldset>
        <legend>Marker scale</legend>
        <label>
          Minimum scale
          <input
            min="0"
            onChange={(event) =>
              setValue({
                ...value,
                minMarkerScale: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            step="any"
            type="number"
            value={value.minMarkerScale ?? ""}
          />
        </label>
        <label>
          Maximum scale
          <input
            min="0"
            onChange={(event) =>
              setValue({
                ...value,
                maxMarkerScale: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            step="any"
            type="number"
            value={value.maxMarkerScale ?? ""}
          />
        </label>
      </fieldset>
    </EditorForm>
  );
}

/**
 * CityEditor component
 * @component
 * @param {object} props - City source file
 * @param {DataFile<CityJson>} props.file - City source file
 * @returns {ReactNode} City editor screen
 */
function CityEditor({ file }: { file: DataFile<CityJson> }): ReactNode {
  const [value, setValue] = useState(file.value);

  /**
   * Changes the city position after a map click or marker drag.
   * @param {[number, number]} coordinates - Longitude and latitude
   * @returns {void}
   */
  function setCoordinates(coordinates: [number, number]): void {
    setValue({ ...value, coordinates });
  }
  return (
    <EditorForm file={file} onSave={() => value} title={`City: ${value.name}`}>
      <LocalizedNames
        label="Names"
        names={value}
        onChange={(names) => setValue({ ...value, ...names })}
      />
      <fieldset>
        <legend>Location</legend>
        <label>
          Country
          <select
            onChange={(event) =>
              setValue({ ...value, countryId: event.target.value })
            }
            value={value.countryId}
          >
            {countries.map(({ value: country }) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Longitude
          <input
            onChange={(event) =>
              setCoordinates([Number(event.target.value), value.coordinates[1]])
            }
            step="any"
            type="number"
            value={value.coordinates[0]}
          />
        </label>
        <label>
          Latitude
          <input
            onChange={(event) =>
              setCoordinates([value.coordinates[0], Number(event.target.value)])
            }
            step="any"
            type="number"
            value={value.coordinates[1]}
          />
        </label>
        <label>
          Timezone
          <input
            list="timezones"
            onChange={(event) =>
              setValue({ ...value, timeZone: event.target.value })
            }
            value={value.timeZone}
          />
        </label>
        <datalist id="timezones">
          {Intl.supportedValuesOf("timeZone").map((timeZone) => (
            <option key={timeZone} value={timeZone} />
          ))}
        </datalist>
        <label>
          Population
          <input
            min="0"
            onChange={(event) =>
              setValue({
                ...value,
                population: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            type="number"
            value={value.population ?? ""}
          />
        </label>
        <label>
          Minimum marker scale
          <input
            min="0"
            onChange={(event) =>
              setValue({
                ...value,
                minMarkerScale: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            step="any"
            type="number"
            value={value.minMarkerScale ?? ""}
          />
        </label>
        <label className="checkbox">
          <input
            checked={value.isLived ?? false}
            onChange={(event) =>
              setValue({ ...value, isLived: event.target.checked || undefined })
            }
            type="checkbox"
          />
          Former home
        </label>
      </fieldset>
      <Map
        attributionControl={false}
        initialViewState={{
          latitude: value.coordinates[1],
          longitude: value.coordinates[0],
          zoom: 6,
        }}
        mapStyle="https://demotiles.maplibre.org/style.json"
        onClick={(event: MapLayerMouseEvent) =>
          setCoordinates([event.lngLat.lng, event.lngLat.lat])
        }
      >
        <Marker
          draggable
          latitude={value.coordinates[1]}
          longitude={value.coordinates[0]}
          onDragEnd={(event) =>
            setCoordinates([event.lngLat.lng, event.lngLat.lat])
          }
        />
      </Map>
      <fieldset>
        <legend>Background images</legend>
        <textarea
          aria-label="One CDN-relative image path per line"
          onChange={(event) =>
            setValue({
              ...value,
              backgroundImages: event.target.value.split("\n").filter(Boolean),
            })
          }
          value={(value.backgroundImages ?? []).join("\n")}
        />
      </fieldset>
    </EditorForm>
  );
}

/**
 * Updates a single ordered itinerary step without mutating the current trip.
 * @param {TripJson} trip - Current trip value
 * @param {number} index - Step index
 * @param {TripJson["steps"][number]} step - Replacement step
 * @returns {TripJson} Updated trip value
 */
function replaceStep(
  trip: TripJson,
  index: number,
  step: TripJson["steps"][number],
): TripJson {
  return {
    ...trip,
    steps: trip.steps.map((current, currentIndex) =>
      currentIndex === index ? step : current,
    ),
  };
}

/**
 * TripEditor component
 * @component
 * @param {object} props - Trip source file
 * @param {DataFile<TripJson>} props.file - Trip source file
 * @returns {ReactNode} Trip editor screen
 */
function TripEditor({ file }: { file: DataFile<TripJson> }): ReactNode {
  const [value, setValue] = useState(file.value);

  /**
   * Adds an empty stop at the end of the itinerary.
   * @returns {void}
   */
  function addStop(): void {
    setValue({
      ...value,
      steps: [
        ...value.steps,
        {
          type: "stop",
          cityId: cities[0]?.value.id ?? "",
          eDate: value.eDate,
          sDate: value.sDate,
        },
      ],
    });
  }

  /**
   * Adds an empty transport step at the end of the itinerary.
   * @returns {void}
   */
  function addTransport(): void {
    setValue({
      ...value,
      steps: [
        ...value.steps,
        {
          type: "transport",
          fromId: cities[0]?.value.id ?? "",
          mode: "train",
          toId: cities[0]?.value.id ?? "",
        },
      ],
    });
  }

  /**
   * Moves an itinerary step one position.
   * @param {number} index - Current position
   * @param {-1 | 1} direction - Move direction
   * @returns {void}
   */
  function moveStep(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= value.steps.length) return;
    const steps = [...value.steps];
    [steps[index], steps[target]] = [steps[target], steps[index]];
    setValue({ ...value, steps });
  }
  return (
    <EditorForm file={file} onSave={() => value} title={`Trip: ${value.title}`}>
      <LocalizedNames
        label="Titles"
        names={{ name: value.title, nameByLocale: value.titleByLocale }}
        onChange={({ name, nameByLocale }) =>
          setValue({ ...value, title: name, titleByLocale: nameByLocale })
        }
      />
      <fieldset>
        <legend>Trip details</legend>
        <label>
          Start
          <input
            onChange={(event) =>
              setValue({ ...value, sDate: event.target.value })
            }
            placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM"
            type="text"
            value={value.sDate}
          />
        </label>
        <label>
          End
          <input
            onChange={(event) =>
              setValue({ ...value, eDate: event.target.value })
            }
            placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM"
            type="text"
            value={value.eDate}
          />
        </label>
        <label>
          Origin
          <select
            onChange={(event) =>
              setValue({ ...value, originCityId: event.target.value })
            }
            value={value.originCityId}
          >
            {cities.map(({ value: city }) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Return city
          <select
            onChange={(event) =>
              setValue({ ...value, returnCityId: event.target.value })
            }
            value={value.returnCityId}
          >
            {cities.map(({ value: city }) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <section>
        <h2>Itinerary</h2>
        {value.steps.map((step, index) => (
          <StepEditor
            cities={cities}
            index={index}
            key={`${step.type}-${index}`}
            onChange={(next) => setValue(replaceStep(value, index, next))}
            onMove={moveStep}
            photoPaths={photoPaths}
            step={step}
          />
        ))}
        <p>
          <button onClick={addStop} type="button">
            Add stop
          </button>
          <button onClick={addTransport} type="button">
            Add transport
          </button>
        </p>
      </section>
    </EditorForm>
  );
}

/**
 * StepEditor component
 * Edits one stop or transport itinerary step.
 * @component
 * @param {object} props - Step editor state
 * @param {DataFile<CityJson>[]} props.cities - Available city documents
 * @param {number} props.index - Itinerary position
 * @param {(step: TripJson["steps"][number]) => void} props.onChange - Step update callback
 * @param {(index: number, direction: -1 | 1) => void} props.onMove - Step move callback
 * @param {string[]} props.photoPaths - Available photo manifest paths
 * @param {TripJson["steps"][number]} props.step - Current step
 * @returns {ReactNode} Itinerary step form
 */
function StepEditor({
  cities: cityFiles,
  index,
  onChange,
  onMove,
  photoPaths: paths,
  step,
}: {
  cities: DataFile<CityJson>[];
  index: number;
  onChange: (step: TripJson["steps"][number]) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  photoPaths: string[];
  step: TripJson["steps"][number];
}): ReactNode {
  const cityOptions = cityFiles.map(({ value }) => (
    <option key={value.id} value={value.id}>
      {value.name}
    </option>
  ));
  return (
    <fieldset className="step">
      <legend>
        {index + 1}. {step.type}
      </legend>
      <button onClick={() => onMove(index, -1)} type="button">
        ↑
      </button>
      <button onClick={() => onMove(index, 1)} type="button">
        ↓
      </button>
      {step.type === "stop" ? (
        <StopFields
          cities={cityOptions}
          onChange={onChange}
          photoPaths={paths}
          step={step}
        />
      ) : (
        <TransportFields cities={cityOptions} onChange={onChange} step={step} />
      )}
    </fieldset>
  );
}

/**
 * StopFields component
 * Renders fields unique to a stop step.
 * @component
 * @param {object} props - Stop step state
 * @param {ReactNode} props.cities - City select options
 * @param {(step: TripStopJson) => void} props.onChange - Step update callback
 * @param {string[]} props.photoPaths - Available photo manifest paths
 * @param {TripStopJson} props.step - Current stop
 * @returns {ReactNode} Stop fields
 */
function StopFields({
  cities: cityOptions,
  onChange,
  photoPaths: paths,
  step,
}: {
  cities: ReactNode;
  onChange: (step: TripStopJson) => void;
  photoPaths: string[];
  step: TripStopJson;
}): ReactNode {
  return (
    <>
      <label>
        City
        <select
          onChange={(event) =>
            onChange({ ...step, cityId: event.target.value })
          }
          value={step.cityId}
        >
          {cityOptions}
        </select>
      </label>
      <label>
        Start
        <input
          onChange={(event) => onChange({ ...step, sDate: event.target.value })}
          placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM"
          type="text"
          value={step.sDate}
        />
      </label>
      <label>
        End
        <input
          onChange={(event) => onChange({ ...step, eDate: event.target.value })}
          placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM"
          type="text"
          value={step.eDate}
        />
      </label>
      <label>
        Photo manifest
        <select
          onChange={(event) =>
            onChange({ ...step, photoPath: event.target.value || undefined })
          }
          value={step.photoPath ?? ""}
        >
          <option value="">No photos</option>
          {paths.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

/**
 * TransportFields component
 * Renders fields shared by every transport mode.
 * @component
 * @param {object} props - Transport step state
 * @param {ReactNode} props.cities - City select options
 * @param {(step: TripTransportJson) => void} props.onChange - Step update callback
 * @param {TripTransportJson} props.step - Current transport step
 * @returns {ReactNode} Transport fields
 */
function TransportFields({
  cities: cityOptions,
  onChange,
  step,
}: {
  cities: ReactNode;
  onChange: (step: TripTransportJson) => void;
  step: TripTransportJson;
}): ReactNode {
  return (
    <>
      <label>
        Mode
        <select
          onChange={(event) =>
            onChange({
              ...step,
              mode: event.target.value as TripTransportJson["mode"],
            })
          }
          value={step.mode}
        >
          {["plane", "ferry", "car", "train", "bus", "taxi", "walk"].map(
            (mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ),
          )}
        </select>
      </label>
      <label>
        From
        <select
          onChange={(event) =>
            onChange({ ...step, fromId: event.target.value })
          }
          value={step.fromId}
        >
          {cityOptions}
        </select>
      </label>
      <label>
        To
        <select
          onChange={(event) => onChange({ ...step, toId: event.target.value })}
          value={step.toId}
        >
          {cityOptions}
        </select>
      </label>
      <label>
        Departure
        <input
          onChange={(event) =>
            onChange({ ...step, sDate: event.target.value || undefined })
          }
          placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM"
          type="text"
          value={step.sDate ?? ""}
        />
      </label>
      <label>
        Arrival
        <input
          onChange={(event) =>
            onChange({ ...step, eDate: event.target.value || undefined })
          }
          placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM"
          type="text"
          value={step.eDate ?? ""}
        />
      </label>
      <label>
        Via cities
        <select
          multiple
          onChange={(event) =>
            onChange({
              ...step,
              viaIds: Array.from(
                event.target.selectedOptions,
                (option) => option.value,
              ),
            })
          }
          value={step.viaIds ?? []}
        >
          {cityOptions}
        </select>
      </label>
      <label>
        Distance km
        <input
          onChange={(event) =>
            onChange({
              ...step,
              distanceInKm: event.target.value
                ? Number(event.target.value)
                : undefined,
            })
          }
          type="number"
          value={step.distanceInKm ?? ""}
        />
      </label>
      <label>
        Duration minutes
        <input
          onChange={(event) =>
            onChange({
              ...step,
              durationMinutes: event.target.value
                ? Number(event.target.value)
                : undefined,
            })
          }
          type="number"
          value={step.durationMinutes ?? ""}
        />
      </label>
      <label className="checkbox">
        <input
          checked={step.roundTrip ?? false}
          onChange={(event) =>
            onChange({ ...step, roundTrip: event.target.checked || undefined })
          }
          type="checkbox"
        />
        Round trip
      </label>
      {step.mode === "plane" ? (
        <>
          <label>
            Airline
            <select
              onChange={(event) =>
                onChange({
                  ...step,
                  flight: {
                    ...step.flight,
                    company: event.target.value || undefined,
                  },
                })
              }
              value={step.flight?.company ?? ""}
            >
              <option value="">No airline</option>
              {companyIds.map((company) => (
                <option key={company} value={company}>
                  {config.value.companies?.[company]?.name ?? company}
                </option>
              ))}
            </select>
          </label>
          <label>
            Flight number
            <input
              onChange={(event) =>
                onChange({
                  ...step,
                  flight: {
                    ...step.flight,
                    number: event.target.value || undefined,
                  },
                })
              }
              value={step.flight?.number ?? ""}
            />
          </label>
          <label>
            Cabin class
            <input
              onChange={(event) =>
                onChange({
                  ...step,
                  flight: {
                    ...step.flight,
                    class: event.target.value || undefined,
                  },
                })
              }
              value={step.flight?.class ?? ""}
            />
          </label>
        </>
      ) : step.mode === "ferry" ? (
        <label>
          Ferry company
          <select
            onChange={(event) =>
              onChange({
                ...step,
                ferry: {
                  ...step.ferry,
                  company: event.target.value || undefined,
                },
              })
            }
            value={step.ferry?.company ?? ""}
          >
            <option value="">No ferry company</option>
            {companyIds.map((company) => (
              <option key={company} value={company}>
                {config.value.companies?.[company]?.name ?? company}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  );
}

/**
 * ConfigEditor component
 * @component
 * @param {object} props - Site configuration source file
 * @param {DataFile<SiteConfig>} props.file - Site configuration source file
 * @returns {ReactNode} Site settings screen
 */
function ConfigEditor({ file }: { file: DataFile<SiteConfig> }): ReactNode {
  const [value, setValue] = useState(file.value);
  const site = value.site ?? {};
  const map = value.map ?? {
    defaultCenter: [0, 0] as [number, number],
    defaultMaxZoom: 20,
    defaultMinZoom: 1,
    defaultZoom: 3,
    hoveredCityZoom: 8,
    marker: { defaultScale: 0.15, maxScale: 0.2, minScale: 0.05 },
  };
  return (
    <EditorForm file={file} onSave={() => value} title="Site configuration">
      <fieldset>
        <legend>Site metadata</legend>
        {["name", "domain", "description", "author"].map((key) => (
          <label key={key}>
            {key}
            <input
              onChange={(event) =>
                setValue({
                  ...value,
                  site: { ...site, [key]: event.target.value },
                })
              }
              value={(site[key as keyof typeof site] as string) ?? ""}
            />
          </label>
        ))}
        <label>
          Keywords (comma-separated)
          <input
            onChange={(event) =>
              setValue({
                ...value,
                site: {
                  ...site,
                  keywords: event.target.value
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
                },
              })
            }
            value={site.keywords?.join(", ") ?? ""}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>City roles</legend>
        <label>
          Home city
          <select
            onChange={(event) =>
              setValue({ ...value, homeCityId: event.target.value || null })
            }
            value={value.homeCityId ?? ""}
          >
            <option value="">None</option>
            {cities.map(({ value: city }) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Former homes
          <select
            multiple
            onChange={(event) =>
              setValue({
                ...value,
                livedCityIds: Array.from(
                  event.target.selectedOptions,
                  (option) => option.value,
                ),
              })
            }
            value={value.livedCityIds ?? []}
          >
            {cities.map(({ value: city }) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Future cities
          <select
            multiple
            onChange={(event) =>
              setValue({
                ...value,
                futureCityIds: Array.from(
                  event.target.selectedOptions,
                  (option) => option.value,
                ),
              })
            }
            value={value.futureCityIds ?? []}
          >
            {cities.map(({ value: city }) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Map defaults</legend>
        <label>
          Longitude
          <input
            onChange={(event) =>
              setValue({
                ...value,
                map: {
                  ...map,
                  defaultCenter: [
                    Number(event.target.value),
                    map.defaultCenter[1],
                  ],
                },
              })
            }
            step="any"
            type="number"
            value={map.defaultCenter[0]}
          />
        </label>
        <label>
          Latitude
          <input
            onChange={(event) =>
              setValue({
                ...value,
                map: {
                  ...map,
                  defaultCenter: [
                    map.defaultCenter[0],
                    Number(event.target.value),
                  ],
                },
              })
            }
            step="any"
            type="number"
            value={map.defaultCenter[1]}
          />
        </label>
        {[
          ["defaultZoom", "Default zoom"],
          ["defaultMinZoom", "Minimum zoom"],
          ["defaultMaxZoom", "Maximum zoom"],
          ["hoveredCityZoom", "Hovered-city zoom"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              onChange={(event) =>
                setValue({
                  ...value,
                  map: { ...map, [key]: Number(event.target.value) },
                })
              }
              step="any"
              type="number"
              value={map[key as keyof typeof map] as number}
            />
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Trip display</legend>
        <label>
          Group-by-cities cutoff year
          <input
            onChange={(event) =>
              setValue({
                ...value,
                trips: { groupByCitiesCutoffYear: Number(event.target.value) },
              })
            }
            type="number"
            value={value.trips?.groupByCitiesCutoffYear ?? ""}
          />
        </label>
      </fieldset>
    </EditorForm>
  );
}

/**
 * Finds an editor document by its stable JSON identifier.
 * @param {DataFile<T>[]} documents - Candidate data files
 * @param {string} id - Entity identifier
 * @returns {DataFile<T> | undefined} Matching source file
 */
function findById<T extends { id: string }>(
  documents: DataFile<T>[],
  id: string,
): DataFile<T> | undefined {
  return documents.find(({ value }) => value.id === id);
}

/**
 * App component
 * Editor application with overview and entity-specific routes.
 * @component
 * @returns {ReactNode} Local editor UI
 */
function App(): ReactNode {
  const { pathname } = useLocation();
  const [, section = "", id] = pathname.split("/");
  const country =
    section === "countries" && id ? findById(countries, id) : undefined;
  const city = section === "cities" && id ? findById(cities, id) : undefined;
  const trip = section === "trips" && id ? findById(trips, id) : undefined;
  const errors = validationErrors();
  return (
    <div className="editor">
      <nav>
        <Link to="/">Overview</Link>
        <Link to="/config">Config</Link>
        <h2>Countries</h2>
        {countries.map(({ path, value }) => (
          <Link key={path} to={`/countries/${value.id}`}>
            {value.name}
          </Link>
        ))}
        <h2>Cities</h2>
        {cities.map(({ path, value }) => (
          <Link key={path} to={`/cities/${value.id}`}>
            {value.name}
          </Link>
        ))}
        <h2>Trips</h2>
        {trips.map(({ path, value }) => (
          <Link key={path} to={`/trips/${value.id}`}>
            {value.title}
          </Link>
        ))}
      </nav>
      {country ? (
        <CountryEditor file={country} key={country.path} />
      ) : city ? (
        <CityEditor file={city} key={city.path} />
      ) : trip ? (
        <TripEditor file={trip} key={trip.path} />
      ) : section === "config" ? (
        <ConfigEditor file={config} />
      ) : (
        <main>
          <h1>Travel Map Editor</h1>
          <p>
            {countries.length} countries · {cities.length} cities ·{" "}
            {trips.length} trips · {photos.length} photo manifests
          </p>
          <h2>Validation</h2>
          {errors.length ? (
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : (
            <p>No dangling references, unused cities, or empty trips.</p>
          )}
        </main>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
