import "./Plate.scss";
import "maplibre-gl/dist/maplibre-gl.css";

import { LngLatBounds } from "maplibre-gl";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import MapGL, { Layer, type MapRef, Source } from "react-map-gl/maplibre";

import { cityTime, recordCities } from "@/data/record";
import { useReading } from "@/shared/context/Reading.context";

import { MAP_STYLES, MAP_THEMES } from "../../lib/mapTheme";
import { toStayPoints, toUnwrappedRoute } from "../../lib/plateData";
import { PlateLayers } from "./PlateLayers";

const CAMERA_DURATION_MS = 1100;
const EDGE_PADDING_PX = 56;
const WHOLE_RECORD_PADDING_PX = 24;

/**
 * Plate component
 * The ground the record is read against. It is a locator, not a control: it
 * carries no buttons, no tooltip and no selectable marker, because everything
 * worth selecting lives in the column beside it. What it draws is always an
 * answer to the same question — where is the time being read right now.
 * @component
 * @returns {ReactNode} The map plate
 */
export function Plate(): ReactNode {
  const { isDark, locus } = useReading();
  const mapRef = useRef<MapRef>(null);
  const ground = isDark ? "dark" : "light";
  const theme = MAP_THEMES[ground];
  const stayPoints = useMemo(() => toStayPoints(recordCities, cityTime), []);
  const route = useMemo(
    () => (locus?.route ? toUnwrappedRoute(locus.route) : null),
    [locus],
  );

  /* The camera answers the reading rather than the pointer: framing whatever
     the reader is on, and pulling back to the whole record when they are not on
     anything in particular. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const cities = locus?.cities ?? recordCities;
    if (cities.length === 0) return;

    const bounds = cities.reduce(
      (box, city) => box.extend(city.coordinates),
      new LngLatBounds(cities[0].coordinates, cities[0].coordinates),
    );
    map.fitBounds(bounds, {
      duration: CAMERA_DURATION_MS,
      maxZoom: 7,
      padding: locus ? EDGE_PADDING_PX : WHOLE_RECORD_PADDING_PX,
    });
  }, [locus]);

  return (
    <div className="plate">
      <MapGL
        attributionControl={false}
        dragRotate={false}
        initialViewState={{ latitude: 25, longitude: 10, zoom: 1.4 }}
        mapStyle={MAP_STYLES[ground]}
        maxZoom={12}
        minZoom={0}
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
      >
        <PlateLayers theme={theme} />
        <Source data={stayPoints} id="record-stays" type="geojson">
          <Layer
            id="record-stays-dots"
            paint={{
              "circle-color": theme.cityLabel,
              "circle-opacity": 0.85,
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "weight"],
                0,
                1.5,
                1,
                9,
              ],
            }}
            type="circle"
          />
        </Source>
        {route ? (
          <Source data={route} id="record-route" type="geojson">
            <Layer
              id="record-route-line"
              paint={{
                "line-color": theme.cityLabel,
                "line-width": 1.5,
              }}
              type="line"
            />
          </Source>
        ) : null}
      </MapGL>
    </div>
  );
}
