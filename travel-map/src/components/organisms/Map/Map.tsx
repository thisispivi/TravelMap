import "./Map.scss";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  LngLatBounds,
  type PaddingOptions,
  type StyleSpecification,
} from "maplibre-gl";
import { ReactNode, use, useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  Layer,
  type MapRef,
  Popup,
  Source,
} from "react-map-gl/maplibre";

import { City, Trip } from "@/core";
import {
  futureCities,
  livedCities,
  visitedCities,
  visitedCountries,
} from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";
import { parameters } from "@/utils/parameters";

import { Button } from "../../atoms/Buttons/Button";
import { Loading } from "../../atoms/Loading/Loading";
import { Marker, MarkerVariant } from "../../atoms/Marker/Marker";
import { HomeContext } from "../../pages/Home/HomeContext";
import { RouteOverlay } from "../RouteOverlay/RouteOverlay";
import { MapTooltip } from "../Tooltip/TooltipMap";
import {
  CITY_LABEL_TIERS,
  cityLabelsGeoJson,
  countriesGeoJson,
  countryLabelsGeoJson,
  MAP_THEMES,
  toOpaqueFill,
} from "./mapData";

const HOVER_LEAVE_DELAY_MS = 300;
const CAMERA_DURATION_MS = 1100;
const MAPLIBRE_MIN_ZOOM = 0;
const MAPLIBRE_MAX_ZOOM = 12;
// How close fitBounds may go once a trip's stops collapse to a point. 5.25 left
// a lone city sitting in ~1400km of context; this matches the closest authored
// `mapFocus` for a one-city trip (Stockholm, 6.49).
const SINGLE_DESTINATION_ZOOM = 6.5;
const TOOLTIP_OFFSET_PX = 14;
const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-179, -72],
  [179, 74],
];
const GLYPHS_URL = "/glyphs/{fontstack}/{range}.pbf";
const LABEL_FONT = ["Urbanist SemiBold"];
// Matches the SCSS breakpoint where the panels stop sitting beside the map.
const SIDE_PANEL_BREAKPOINT_PX = 680;
// Panel offset (1rem) + width (25rem) + a 1rem gap.
const SIDE_PANEL_CLEARANCE_PX = 432;
const NAV_CLEARANCE_PX = 88;
const ZOOM_CONTROLS_CLEARANCE_PX = 64;
const MAP_EDGE_PADDING_PX = 24;
/** Trips are framed on where they actually went, not on the flight out of it. */
const HOME_COUNTRY_ID = parameters.birthCity.country.id;

const sortByCoordinates = (a: City, b: City) => {
  const [lonA, latA] = a.coordinates;
  const [lonB, latB] = b.coordinates;
  if (latA !== latB) return latA < latB ? 1 : -1;
  if (lonA !== lonB) return lonA < lonB ? -1 : 1;
  return 0;
};

const toMapLibreZoom = (zoom: number) => Math.log2(Math.max(zoom, 1)) + 1;

/**
 * The part of the canvas the camera is allowed to use.
 *
 * Wide screens carry the panel beside the map, so the whole left column is
 * reserved and the trip settles in the free space to its right. Below the
 * breakpoint the panel lies across the bottom instead and there is no free
 * column — every side gets the same padding and the trip settles in the middle
 * of the screen.
 *
 * @param {number} viewportWidth - Current canvas width in pixels
 * @param {boolean} isPanelOpen - Whether a panel is on screen at all
 * @returns {PaddingOptions} Padding for `flyTo` / `fitBounds`
 */
function getCameraPadding(
  viewportWidth: number,
  isPanelOpen: boolean,
): PaddingOptions {
  const hasSidePanel = viewportWidth >= SIDE_PANEL_BREAKPOINT_PX && isPanelOpen;

  if (!hasSidePanel) {
    return {
      top: MAP_EDGE_PADDING_PX,
      right: MAP_EDGE_PADDING_PX,
      bottom: MAP_EDGE_PADDING_PX,
      left: MAP_EDGE_PADDING_PX,
    };
  }

  return {
    top: NAV_CLEARANCE_PX,
    right: MAP_EDGE_PADDING_PX,
    bottom: ZOOM_CONTROLS_CLEARANCE_PX,
    left: SIDE_PANEL_CLEARANCE_PX,
  };
}

/**
 * The places the trip is actually about. Layovers and the home origin are left
 * out on purpose: including them frames Cagliari→Sydney instead of Australia.
 * A trip that went abroad is framed on the foreign stops alone for the same
 * reason — the night in Rome on the way to Japan would otherwise drag the
 * camera back across Europe. Trips that never left home keep every stop.
 */
function getTripBounds(trip: Trip): LngLatBounds | null {
  const cities = new globalThis.Map<string, City>();
  for (const destination of trip.destinations) {
    if (destination.isLayover) continue;
    cities.set(destination.city.name, destination.city);
  }

  const stops = Array.from(cities.values());
  const abroad = stops.filter((city) => city.country.id !== HOME_COUNTRY_ID);
  const framed = abroad.length > 0 ? abroad : stops;
  if (framed.length === 0) return null;

  return framed.reduce(
    (bounds, city) => bounds.extend(city.coordinates as [number, number]),
    new LngLatBounds(
      framed[0].coordinates as [number, number],
      framed[0].coordinates as [number, number],
    ),
  );
}

/** Every layover, origin and return city of a trip that has no marker yet. */
function getTripLayoverCities(trip: Trip, existing: City[]): City[] {
  const known = new Set(existing.map((city) => city.name));
  const layovers = new globalThis.Map<string, City>();
  const add = (city?: City) => {
    if (city && !known.has(city.name)) layovers.set(city.name, city);
  };

  for (const destination of trip.destinations) {
    if (destination.isLayover) add(destination.city);
  }
  for (const step of trip.steps) {
    if (step.type !== "transport") continue;
    add(step.from);
    add(step.to);
    for (const via of step.via ?? step.ferry?.via ?? []) add(via);
  }
  add(trip.origin?.city);
  add(trip.returnTo?.city);
  return Array.from(layovers.values());
}

interface MapMarkersProps {
  hoveredCity: City | null;
  layoverCities: City[];
  onHoverCity: (city: City | null) => void;
  onSelectCity: (city: City) => void;
}

function MapMarkers({
  hoveredCity,
  layoverCities,
  onHoverCity,
  onSelectCity,
}: MapMarkersProps): ReactNode {
  const groups: [City[], MarkerVariant][] = [
    [visitedCities, "visited"],
    [futureCities, "future"],
    [livedCities, "lived"],
    [layoverCities, "layover"],
  ];

  return (
    <>
      {groups.map(([cities, variant]) =>
        cities
          .toSorted(sortByCoordinates)
          .map((city) => (
            <Marker
              city={city}
              hoveredCity={hoveredCity}
              key={`${variant}-${city.name}`}
              onHoverCity={onHoverCity}
              onSelectCity={onSelectCity}
              variant={variant}
            />
          )),
      )}
    </>
  );
}

interface MapLabelsProps {
  cityLabel: string;
  cityLabelHalo: string;
  countryLabel: string;
  countryLabelHalo: string;
}

function MapLabels({
  cityLabel,
  cityLabelHalo,
  countryLabel,
  countryLabelHalo,
}: MapLabelsProps): ReactNode {
  return (
    <>
      <Source
        data={countryLabelsGeoJson}
        id="country-label-points"
        type="geojson"
      >
        <Layer
          id="country-labels"
          layout={{
            "text-field": ["upcase", ["get", "name"]],
            "text-font": LABEL_FONT,
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              1,
              9.45,
              6,
              12.6,
            ],
            "text-max-width": 9,
            "text-letter-spacing": 0.06,
          }}
          maxzoom={6.5}
          minzoom={1.1}
          paint={{
            "text-color": countryLabel,
            "text-halo-color": countryLabelHalo,
            "text-halo-width": 1,
            "text-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              1,
              0.48,
              2.5,
              0.72,
            ],
          }}
          type="symbol"
        />
      </Source>

      <Source data={cityLabelsGeoJson} id="city-label-points" type="geojson">
        {CITY_LABEL_TIERS.map((tier) => (
          <Layer
            filter={
              [
                "all",
                [">=", ["get", "population"], tier.minPopulation],
                ...(Number.isFinite(tier.maxPopulation)
                  ? [["<", ["get", "population"], tier.maxPopulation]]
                  : []),
              ] as never
            }
            id={`city-labels-${tier.id}`}
            key={tier.id}
            layout={{
              "symbol-sort-key": ["-", ["get", "population"]],
              "text-anchor": "top",
              "text-field": ["get", "name"],
              "text-font": LABEL_FONT,
              "text-offset": [0, 0.6],
              "text-optional": true,
              "text-padding": 5,
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                2,
                11.03,
                7,
                13.65,
              ],
            }}
            minzoom={tier.minZoom}
            paint={{
              "text-color": cityLabel,
              "text-halo-color": cityLabelHalo,
              "text-halo-width": 1,
            }}
            type="symbol"
          />
        ))}
      </Source>
    </>
  );
}

export function Map(): ReactNode {
  const { t } = useLanguage(["home"]);
  const {
    isDarkTheme,
    hoveredCity,
    setHoveredCity,
    mapPosition,
    selectedTrip,
    isPanelOpen,
    responsive,
  } = use(HomeContext)!;
  const { isTripDetail } = useLocation();
  const mapRef = useRef<MapRef>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pinnedCity, setPinnedCity] = useState<City | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const theme = MAP_THEMES[isDarkTheme ? "dark" : "light"];

  const mapStyle = useMemo<StyleSpecification>(
    () => ({
      version: 8,
      glyphs: GLYPHS_URL,
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": theme.ocean },
        },
      ],
    }),
    [theme.ocean],
  );

  const countryFillColor = useMemo(
    () =>
      [
        "match",
        ["get", "name"],
        ...visitedCountries.flatMap((country) => [
          country.id,
          toOpaqueFill(country.fillColor, theme.land),
        ]),
        theme.land,
      ] as never,
    [theme.land],
  );

  const appliedPosition = useRef(mapPosition);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;
    if (appliedPosition.current === mapPosition) return;
    appliedPosition.current = mapPosition;
    map.flyTo({
      center: mapPosition.center,
      zoom: toMapLibreZoom(mapPosition.zoom),
      padding: getCameraPadding(responsive.window.width, isPanelOpen),
      duration: CAMERA_DURATION_MS,
      essential: true,
    });
  }, [isLoaded, isPanelOpen, mapPosition, responsive.window.width]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded || !isTripDetail || !selectedTrip) return;
    const padding = getCameraPadding(responsive.window.width, isPanelOpen);
    if (selectedTrip.mapFocus) {
      map.flyTo({
        center: selectedTrip.mapFocus.center,
        zoom: toMapLibreZoom(selectedTrip.mapFocus.zoom),
        duration: CAMERA_DURATION_MS,
        essential: true,
        padding,
      });
      return;
    }
    const bounds = getTripBounds(selectedTrip);
    if (!bounds) return;
    map.fitBounds(bounds, {
      duration: CAMERA_DURATION_MS,
      essential: true,
      maxZoom: SINGLE_DESTINATION_ZOOM,
      padding,
    });
  }, [
    isLoaded,
    isPanelOpen,
    isTripDetail,
    responsive.window.width,
    selectedTrip,
  ]);

  const closeTooltip = () => {
    setPinnedCity(null);
    setHoveredCity(null);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTooltip();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  const handleHoverCity = (city: City | null) => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    if (city) {
      if (pinnedCity && pinnedCity.name !== city.name) setPinnedCity(null);
      setHoveredCity(city);
      return;
    }
    hoverLeaveTimer.current = setTimeout(() => {
      if (!pinnedCity) setHoveredCity(null);
    }, HOVER_LEAVE_DELAY_MS);
  };

  const handleSelectCity = (city: City) => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    const shouldClose = pinnedCity?.name === city.name;
    setPinnedCity(shouldClose ? null : city);
    setHoveredCity(shouldClose ? null : city);
  };

  const layoverCities =
    isTripDetail && selectedTrip
      ? getTripLayoverCities(selectedTrip, [
          ...visitedCities,
          ...futureCities,
          ...livedCities,
        ])
      : [];

  return (
    <div className="map-container">
      {!isLoaded ? (
        <div className="loading">
          <Loading />
        </div>
      ) : null}

      <MapGL
        attributionControl={false}
        dragRotate={false}
        initialViewState={{
          longitude: mapPosition.center[0],
          latitude: mapPosition.center[1],
          zoom: toMapLibreZoom(mapPosition.zoom),
        }}
        mapStyle={mapStyle}
        maxPitch={0}
        maxZoom={MAPLIBRE_MAX_ZOOM}
        minPitch={0}
        minZoom={MAPLIBRE_MIN_ZOOM}
        onClick={closeTooltip}
        onLoad={(event) => {
          try {
            event.target.setMaxBounds(MAP_MAX_BOUNDS);
          } catch (error) {
            console.error("Map.setMaxBounds failed", error);
          }
          setIsLoaded(true);
        }}
        ref={mapRef}
        renderWorldCopies={false}
        touchPitch={false}
      >
        <Source data={countriesGeoJson} id="countries" type="geojson">
          <Layer
            id="country-fill"
            paint={{ "fill-color": countryFillColor }}
            type="fill"
          />
          <Layer
            id="country-border"
            paint={{
              "line-color": theme.border,
              "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1],
              "line-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                1,
                0.35,
                4,
                1,
              ],
            }}
            type="line"
          />
        </Source>

        <RouteOverlay />

        <MapLabels
          cityLabel={theme.cityLabel}
          cityLabelHalo={theme.cityLabelHalo}
          countryLabel={theme.countryLabel}
          countryLabelHalo={theme.countryLabelHalo}
        />

        {isLoaded ? (
          <MapMarkers
            hoveredCity={hoveredCity}
            layoverCities={layoverCities}
            onHoverCity={handleHoverCity}
            onSelectCity={handleSelectCity}
          />
        ) : null}

        {hoveredCity ? (
          <Popup
            className="map-tooltip"
            closeButton={false}
            closeOnClick={false}
            latitude={hoveredCity.coordinates[1]}
            longitude={hoveredCity.coordinates[0]}
            maxWidth="none"
            offset={TOOLTIP_OFFSET_PX}
            onClose={closeTooltip}
          >
            <MapTooltip
              city={hoveredCity}
              onClose={closeTooltip}
              onHoverCity={handleHoverCity}
            />
          </Popup>
        ) : null}
      </MapGL>

      <div className="map-zoom-controls">
        <Button
          ariaLabel={t("map.zoomIn")}
          className="map-zoom-controls__button"
          onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
        >
          +
        </Button>
        <Button
          ariaLabel={t("map.zoomOut")}
          className="map-zoom-controls__button"
          onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
        >
          −
        </Button>
      </div>
    </div>
  );
}
