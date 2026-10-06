import { useEffect, useRef, useState } from "react";

/**
 * A viewport size in CSS pixels.
 * @property {number} width - The viewport width
 * @property {number} height - The viewport height
 */
type WindowSize = { width: number; height: number };

/**
 * Responsive viewport measurements returned by `useResponsive`.
 * @property {WindowSize} window - The browser window dimensions
 * @property {WindowSize} inner - The inner content dimensions
 */
export type ResponsiveType = { window: WindowSize; inner: WindowSize };

/**
 * Hook to detect the current window size.
 * @returns {ResponsiveType} Object containing `window` and `inner` size objects.
 */
export function useResponsive(): ResponsiveType {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  /**
   * Captures the current browser viewport dimensions.
   * @returns {void}
   */
  const handleResize = (): void =>
    setSize({ width: window.innerWidth, height: window.innerHeight });
  const handleResizeRef = useRef(handleResize);

  useEffect(() => {
    handleResizeRef.current = handleResize;
  });

  useEffect(() => {
    /**
     * Delegates window resize events through the latest resize callback.
     * @returns {void}
     */
    const handleWindowResize = (): void => handleResizeRef.current();

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return { window: size, inner: size };
}
