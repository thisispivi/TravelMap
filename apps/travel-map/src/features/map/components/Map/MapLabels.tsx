import { MapTheme } from "@travelmap/ui/map/lib/mapTheme";
import { ReactNode } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import {
  CITY_LABEL_TIERS,
  cityLabelsGeoJson,
  countryLabelsGeoJson,
} from "../../lib/mapData";

const LABEL_FONT = ["Google Sans Flex SemiBold"];

/**
 * Properties accepted by the map label layers.
 * @property {MapTheme} theme - The active map theme
 */
interface MapLabelsProps {
  theme: MapTheme;
}

/**
 * MapLabels component
 * The country and city names, drawn above the shared world layers in the
 * site's label font and ranked by population so the map never crowds.
 * @component
 * @param {MapLabelsProps} props
 * @param {MapTheme} props.theme - The active map theme
 * @returns {ReactNode} The themed map label layers
 */
export function MapLabels({ theme }: MapLabelsProps): ReactNode {
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
