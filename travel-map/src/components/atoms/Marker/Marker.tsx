import { City } from "../../../core";
import * as THREE from "three";

interface MarkerProps {
  city: City;
}

/**
 * Marker component for the map
 *
 * The marker component is used to display a marker on the map.
 *
 * @component
 *
 * @param {City} city - City object
 * @returns {JSX.Element} - Marker component
 */
export default function Marker({ city }: MarkerProps): JSX.Element {
  const map = new THREE.TextureLoader().load("Marker.svg");
  const material = new THREE.SpriteMaterial({
    map,
    color: 0xffffff,
    sizeAttenuation: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.05, 0.1, 1);
  sprite.position.set(city.coordinates[0], city.coordinates[1], 0);
  sprite.center.set(0.5, 0.5);
  return <primitive object={sprite} />;
}