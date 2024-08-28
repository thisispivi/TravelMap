import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Tween, Easing } from "@tweenjs/tween.js";
import "./Marker.scss";
import { City } from "../../../core";

interface MarkerProps {
  city: City;
  isFuture?: boolean;
  transitionDuration?: number;
  setCurrHoveredCity: (city: City | null) => void;
}

export default function Marker({
  city,
  isFuture,
  transitionDuration = 150,
  setCurrHoveredCity,
}: MarkerProps): JSX.Element {
  const { camera } = useThree();

  useEffect(() => {
    const handleZoomChange = () => {
      console.log("Zoom changed");
    };

    const typedCamera = camera as THREE.OrthographicCamera;
    typedCamera.addEventListener("change", handleZoomChange);

    return () => {
      typedCamera.removeEventListener("change", handleZoomChange);
    };
  }, [camera]);

  const map = new THREE.TextureLoader().load(
    isFuture ? "FutureMarker.svg" : "Marker.svg"
  );
  const material = new THREE.SpriteMaterial({
    map,
    color: 0xffffff,
    sizeAttenuation: false,
  });

  const sprite = new THREE.Sprite(material);

  sprite.position.set(city.coordinates[0], city.coordinates[1], 0);
  sprite.center.set(0.5, 0.5);

  const defaultScale = { x: 0.27, y: 0.8 };
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
