import { ReactNode } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { countriesGeoJson } from "../../lib/countries";
import { MapTheme } from "../../lib/mapTheme";

/**
 * Properties accepted by the WorldLayers component.
 * @property {MapTheme} theme - The active map theme
 * @property {unknown} [countryFill] - A MapLibre colour expression for the countries; plain land when absent
 */
interface WorldLayersProps {
  theme: MapTheme;
  countryFill?: unknown;
}

/**
 * WorldLayers component
 * The land and borders every map sits on, identical on the site and in the
 * editor so a trip looks the same while it is being authored as it does once
 * published. The site passes a fill that colours the countries it visited.
 * @component
 * @param {WorldLayersProps} props - The layer props
 * @param {MapTheme} props.theme - The active map theme
 * @param {unknown} [props.countryFill] - A colour expression for the countries
 * @returns {ReactNode} The country fill and border layers
 */
export function WorldLayers({
  theme,
  countryFill,
}: WorldLayersProps): ReactNode {
  return (
    <Source data={countriesGeoJson} id="countries" type="geojson">
      <Layer
        id="country-fill"
        /* MapLibre's expression types are not exported in a usable form. */
        paint={{ "fill-color": (countryFill ?? theme.land) as never }}
        type="fill"
      />
      <Layer
        id="country-border"
        paint={{
          "line-color": theme.border,
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 1, 0.35, 4, 1],
        }}
        type="line"
      />
    </Source>
  );
}
