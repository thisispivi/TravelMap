// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   ZoomableGroup,
// } from "react-simple-maps";
// import { Country } from "../../../core/classes/Country";
// import { City } from "../../../core/classes/City";
// import { Marker } from "../../molecules";
// import "./Map.scss";
// import { useEffect, useState } from "react";

// interface MapChartProps {
//   visited?: Record<string, Country>;
//   markers?: City[];
//   hoveredCity?: City;
//   setHoveredCity: (city: City | undefined) => void;
//   geoUrl?: string;
//   isDarkMode?: boolean;
// }

// export default function MapChart({
//   visited = {},
//   markers = [],
//   hoveredCity,
//   setHoveredCity,
//   geoUrl = "",
//   isDarkMode = false,
// }: MapChartProps) {
//   const [, setWindowWidth] = useState(window.innerWidth);
//   const handleResize = () => setWindowWidth(window.innerWidth);
//   useEffect(() => {
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const [scaleFactor, setScaleFactor] = useState(10);

//   return (
//     <ComposableMap className="map" projection={"geoMercator"}>
//       <ZoomableGroup
//         maxZoom={100}
//         minZoom={1}
//         zoom={10}
//         center={[7, 49]}
//         onMove={({ zoom }) => setScaleFactor(zoom)}
//       >
//         <Geographies geography={geoUrl} style={{ pointerEvents: "none" }}>
//           {({ geographies }) =>
//             geographies.map((geo) => (
//               <Geography
//                 key={geo.rsmKey}
//                 geography={geo}
//                 className={
//                   visited[geo.properties.name.replace(" ", "")]
//                     ? "visited"
//                     : "not-visited"
//                 }
//                 strokeWidth={0.1}
//                 fill={
//                   visited[geo.properties.name.replace(" ", "")]
//                     ? visited[geo.properties.name.replace(" ", "")].fillColor
//                     : "#eaeaec"
//                 }
//                 stroke={
//                   visited[geo.properties.name.replace(" ", "")]
//                     ? visited[geo.properties.name.replace(" ", "")].borderColor
//                     : "#b7b7b9"
//                 }
//                 style={{
//                   default: { outline: "none" },
//                   hover: { outline: "none" },
//                   pressed: { outline: "none" },
//                 }}
//               />
//             ))
//           }
//         </Geographies>
//         {markers.map((city) => (
//           <Marker
//             key={city.name}
//             city={city}
//             hoveredCity={hoveredCity}
//             setHoveredCity={setHoveredCity}
//             scaleFactor={scaleFactor}
//             isDarkMode={isDarkMode}
//           />
//         ))}
//         <use xlinkHref={hoveredCity?.name + "-marker"} />
//       </ZoomableGroup>
//     </ComposableMap>
//   );
// }
export {};
