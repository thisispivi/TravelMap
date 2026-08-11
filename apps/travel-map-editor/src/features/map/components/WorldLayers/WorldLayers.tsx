import { MapTheme } from "@app/features/map/lib/mapTheme";
import { ReactNode } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { countriesGeoJson } from "../../lib/worldPolygons";

/**
 * WorldLayers component
 * The land and border layers every editor map sits on, kept identical to the
 * public map's so a trip looks the same while it is being authored as it does
 * once published.
 * @component
 * @param {WorldLayersProps} props
 * @param {MapTheme} props.theme - The active map theme
 * @returns {ReactNode} The country fill and border layers
 */
export function WorldLayers({ theme }: WorldLayersProps): ReactNode {
  return (
    <Source data={countriesGeoJson} id="countries" type="geojson">
      <Layer
        id="country-fill"
        paint={{ "fill-color": theme.land }}
        type="fill"
      />
      <Layer
        id="country-border"
        paint={{
          "line-color": theme.border,
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1],
        }}
        type="line"
      />
    </Source>
  );
}

/**
 * Props for WorldLayers.
 * @property {MapTheme} theme - The active map theme
 */
interface WorldLayersProps {
  theme: MapTheme;
}
