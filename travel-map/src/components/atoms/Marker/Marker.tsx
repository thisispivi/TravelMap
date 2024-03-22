import { City } from "../../../core";
import * as THREE from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import "./Marker.scss";

interface MarkerProps {
  city: City;
  isFuture?: boolean;
  transitionDuration?: number;
}

export default function Marker({
  city,
  isFuture,
  transitionDuration = 150,
}: MarkerProps): JSX.Element {
  const map = new THREE.TextureLoader().load(
    isFuture ? "FutureMarker.svg" : "Marker.svg",
  );
  const material = new THREE.SpriteMaterial({
    map,
    color: 0xffffff,
    sizeAttenuation: false,
  });

  const sprite = new THREE.Sprite(material);

  sprite.position.set(city.coordinates[0], city.coordinates[1], 0);
  sprite.center.set(0.5, 0.5);

  const defaultScale = { x: 0.027, y: 0.08 };
  const hoverScale = { x: 0.033, y: 0.1 };
  sprite.scale.set(defaultScale.x, defaultScale.y, 1);

  const handleMouseEnter = () => {
    new Tween(sprite.scale)
      .to(hoverScale, transitionDuration)
      .easing(Easing.Quadratic.Out)
      .start();
  };

  const handleMouseLeave = () => {
    new Tween(sprite.scale)
      .to(defaultScale, transitionDuration)
      .easing(Easing.Quadratic.Out)
      .start();
  };

  return (
    <primitive
      object={sprite}
      className="marker"
      onPointerEnter={handleMouseEnter} // Add event listener for mouse enter
      onPointerLeave={handleMouseLeave} // Add event listener for mouse leave
    />
  );
}

// import { City } from "../../../core";
// import * as THREE from "three";
// import "./Marker.scss";

// interface MarkerProps {
//   city: City;
//   isFuture?: boolean;
// }

// /**
//  * Marker component for the map
//  *
//  * The marker component is used to display a marker on the map.
//  *
//  * @component
//  *
//  * @param {MarkerProps} props - The props of the component
//  * @param {City} props.city - City object
//  * @param {boolean} [props.isFuture=false] - If the marker is for a future city
//  * @returns {JSX.Element} - Marker component
//  */
// export default function Marker({ city, isFuture }: MarkerProps): JSX.Element {
//   const map = new THREE.TextureLoader().load(
//     isFuture ? "FutureMarker.svg" : "Marker.svg"
//   );
//   const material = new THREE.SpriteMaterial({
//     map,
//     color: 0xffffff,
//     sizeAttenuation: false,
//   });

//   const sprite = new THREE.Sprite(material);

//   sprite.position.set(city.coordinates[0], city.coordinates[1], 0);
//   sprite.center.set(0.5, 0.5);

//   type Scale = { x: number; y: number };
//   const defaultScale = { x: 0.027, y: 0.08 };
//   const hoverScale = { x: 0.033, y: 0.1 };
//   sprite.scale.set(defaultScale.x, defaultScale.y, 1);

//   const handleScaleChange = (targetScale: Scale, duration: number) => {
//     const nSteps = 200;
//     const stepX = (targetScale.x - sprite.scale.x) / nSteps;
//     const stepY = (targetScale.y - sprite.scale.y) / nSteps;
//     const interval = duration / nSteps;

//     for (let i = 0; i < nSteps; i++) {
//       setTimeout(() => {
//         sprite.scale.set(sprite.scale.x + stepX, sprite.scale.y + stepY, 1);
//       }, i * interval);
//     }
//   };
//   const handleMouseEnter = () => handleScaleChange(hoverScale, 100);
//   const handleMouseLeave = () => handleScaleChange(defaultScale, 100);

//   return (
//     <primitive
//       object={sprite}
//       onPointerEnter={handleMouseEnter}
//       onPointerLeave={handleMouseLeave}
//       className="marker"
//     />
//   );
// }
