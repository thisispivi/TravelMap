import { City } from "../../../core";
import * as THREE from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import "./Marker.scss";

interface MarkerProps {
  city: City;
  isFuture?: boolean;
  transitionDuration?: number;
  setCurrHoveredCity: (city: City | null) => void;
}

/**
 * Marker component
 *
 * The marker component is used to display a marker. It is used in the map.
 *
 * @component
 *
 * @param {MarkerProps} props - The props of the component
 * @param {City} props.city - The city of the marker
 * @param {boolean} [props.isFuture] - The is future of the marker
 * @param {number} [props.transitionDuration] - The transition duration of the marker
 * @param {(city: City | null) => void} props.setCurrHoveredCity - The set current hovered city
 * @returns {JSX.Element} - The marker
 */
export default function Marker({
  city,
  isFuture,
  transitionDuration = 150,
  setCurrHoveredCity,
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
    setCurrHoveredCity(city);
  };

  const handleMouseLeave = () => {
    new Tween(sprite.scale)
      .to(defaultScale, transitionDuration)
      .easing(Easing.Quadratic.Out)
      .start();
    setCurrHoveredCity(null);
  };

  return (
    <primitive
      key={city.name}
      object={sprite}
      className="marker"
      onPointerEnter={handleMouseEnter}
      onPointerLeave={handleMouseLeave}
      onPointerDown={() => setCurrHoveredCity(city)}
    />
  );
}
