import { useFrame } from "@react-three/fiber";
import TWEEN from "@tweenjs/tween.js";

/**
 * Tween component
 *
 * The tween component is used to update the tweens.
 *
 * @component
 *
 * @returns {null} - The tween component
 */
export default function Tween(): null {
  useFrame(() => TWEEN.update());
  return null;
}
