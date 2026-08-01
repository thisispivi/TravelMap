import "./CoordinatePicker.scss";

import countriesTopologyJson from "@app/assets/json/countries-50m.json";
import {
  createMapStyle,
  MAP_THEMES,
} from "@app/components/organisms/Map/mapTheme";
import type { FeatureCollection, Geometry } from "geojson";
import { ReactNode, useMemo } from "react";
import Map, {
  Layer,
  MapLayerMouseEvent,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

// The public app's world polygons, so the picker reads as the same map instead
// of a third-party tile style. Only fills and borders are drawn: labels would
// need the app's SDF glyphs, which the editor does not serve.
const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection;
}>;
const countriesGeoJson = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry>;

/**
 * CoordinatePicker component
 * Sets a city position by clicking the map, dragging the marker, or typing
 * exact values. Coordinates are ordered longitude then latitude to match the
 * dataset.
 * @component
 * @param {CoordinatePickerProps} props
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @param {(coordinates: [number, number]) => void} props.onChange - Position change callback
 * @param {[number, number]} props.value - Current longitude and latitude
 * @returns {ReactNode} The picker map
 */
export function CoordinatePicker({
  isDarkTheme,
  onChange,
  value,
}: CoordinatePickerProps): ReactNode {
  const theme = MAP_THEMES[isDarkTheme ? "dark" : "light"];
  const mapStyle = useMemo(() => createMapStyle(theme), [theme]);
  const [longitude, latitude] = value;
  return (
    <div className="coordinate-picker">
      <Map
        attributionControl={false}
        initialViewState={{ latitude, longitude, zoom: 4 }}
        mapStyle={mapStyle}
        onClick={(event: MapLayerMouseEvent) =>
          onChange([event.lngLat.lng, event.lngLat.lat])
        }
      >
        <Source data={countriesGeoJson} id="countries" type="geojson">
          <Layer
            id="country-fill"
            paint={{ "fill-color": theme.land }}
            type="fill"
          />
          <Layer
            id="country-border"
            paint={{ "line-color": theme.border, "line-width": 0.5 }}
            type="line"
          />
        </Source>
        <NavigationControl position="top-right" showCompass={false} />
        <Marker
          anchor="bottom"
          draggable
          latitude={latitude}
          longitude={longitude}
          onDragEnd={(event) => onChange([event.lngLat.lng, event.lngLat.lat])}
        >
          <span className="coordinate-picker__marker" />
        </Marker>
      </Map>
    </div>
  );
}

/**
 * Props for CoordinatePicker.
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 * @property {(coordinates: [number, number]) => void} onChange - Position change callback
 * @property {[number, number]} value - Current longitude and latitude
 */
interface CoordinatePickerProps {
  isDarkTheme: boolean;
  onChange: (coordinates: [number, number]) => void;
  value: [number, number];
}
