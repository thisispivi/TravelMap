import { ReactNode, useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { visitedCountries } from "@/data/world";

import {
  CITY_LABEL_TIERS,
  cityLabelsGeoJson,
  countriesGeoJson,
  countryLabelsGeoJson,
} from "../../lib/mapData";
import { MapTheme, toOpaqueFill } from "../../lib/mapTheme";

const LABEL_FONT = ["Urbanist SemiBold"];

/**
 * Properties accepted by the map label layers.
 * @property {MapTheme} theme - The active map theme
 */
interface MapLabelsProps {
  theme: MapTheme;
}

/**
 * Properties accepted by the map's geographic layers.
 * @property {MapTheme} theme - The active map theme
 */
interface MapLayersProps {
  theme: MapTheme;
}

/**
 * MapLabels component
 * Renders country and city label layers using the active map theme.
 * @component
 * @param {MapLabelsProps} props
 * @param {MapTheme} props.theme - The active map theme
 * @returns {ReactNode} The themed map label layers
 */
function MapLabels({ theme }: MapLabelsProps): ReactNode {
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
            "text-color": theme.countryLabel,
            "text-halo-color": theme.countryLabelHalo,
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
              "text-color": theme.cityLabel,
              "text-halo-color": theme.cityLabelHalo,
              "text-halo-width": 1,
            }}
            type="symbol"
          />
        ))}
      </Source>
    </>
  );
}

/**
 * MapLayers component
 * Renders the country polygons, borders, and labels for the active map theme.
 * @component
 * @param {MapLayersProps} props
 * @param {MapTheme} props.theme - The active map theme
 * @returns {ReactNode} The themed geographic map layers
 */
export function MapLayers({ theme }: MapLayersProps): ReactNode {
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

  return (
    <>
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

      <MapLabels theme={theme} />
    </>
  );
}
