import "./CoordinatePicker.scss";

import { createMapStyle, MAP_THEMES } from "@app/features/map/lib/mapTheme";
import { ReactNode, useMemo } from "react";
import Map, {
  MapLayerMouseEvent,
  Marker,
  NavigationControl,
} from "react-map-gl/maplibre";

import { WorldLayers } from "../WorldLayers/WorldLayers";

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
        dragRotate={false}
        initialViewState={{ latitude, longitude, zoom: 4 }}
        mapStyle={mapStyle}
        maxPitch={0}
        onClick={(event: MapLayerMouseEvent) =>
          onChange([event.lngLat.lng, event.lngLat.lat])
        }
        renderWorldCopies={false}
      >
        <WorldLayers theme={theme} />
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
