// import { City } from "../../../core";
// import * as THREE from "three";
// import { Tween, Easing } from "@tweenjs/tween.js";
// import "./Marker.scss";
// import { useLoader } from "@react-three/fiber";
// import { SVGLoader } from "three/examples/jsm/Addons.js";
// import futureMarker from "../../../assets/icons/FutureMarker.svg";
// import marker from "../../../assets/icons/Marker.svg";

// interface MarkerProps {
//   city: City;
//   isFuture?: boolean;
//   transitionDuration?: number;
//   setCurrHoveredCity: (city: City | null) => void;
// }

// /**
//  * Marker component
//  *
//  * The marker component is used to display a marker. It is used in the map.
//  *
//  * @component
//  *
//  * @param {MarkerProps} props - The props of the component
//  * @param {City} props.city - The city of the marker
//  * @param {boolean} [props.isFuture] - The is future of the marker
//  * @param {number} [props.transitionDuration] - The transition duration of the marker
//  * @param {(city: City | null) => void} props.setCurrHoveredCity - The set current hovered city
//  * @returns {JSX.Element} - The marker
//  */
// export default function Marker({
//   city,
//   isFuture,
//   transitionDuration = 150,
//   setCurrHoveredCity,
// }: MarkerProps): JSX.Element {
//   const { paths } = useLoader(SVGLoader, isFuture ? futureMarker : marker);
//   const getMaterial = (color: string) =>
//     new THREE.MeshBasicMaterial({
//       color,
//       side: THREE.DoubleSide,
//       depthWrite: false,
//     });

//   const group = new THREE.Group();
//   paths.forEach((path, i) => {
//     const shapes = SVGLoader.createShapes(path);
//     shapes.forEach((shape) => {
//       const geometry = new THREE.ShapeGeometry(shape);
//       const mesh = new THREE.Mesh(
//         geometry,
//         getMaterial(i === 0 ? "#ff0000" : "#0000ff")
//       );
//       mesh.position.set(city.coordinates[0], city.coordinates[1], 0);
//       mesh.scale.set(0.005, -0.005, 1);
//       group.add(mesh);
//     });
//   });

//   return (
//     <>
//       {group.children.map((child, index) => (
//         <primitive
//           key={index}
//           className="marker"
//           onPointerDown={() => setCurrHoveredCity(city)}
//           object={child}
//         />
//       ))}
//     </>
//   );
// }
