import { useEffect, useRef, useState } from "react";
type WindowSize = {
  width: number;
  height: number;
};
export type ResponsiveType = {
  window: WindowSize;
  inner: WindowSize;
};
/**
 * Hook to detect the current window size.
 *
 * @returns {ResponsiveType} Object containing `window` and `inner` size objects.
 */
export function useResponsive(): ResponsiveType {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const handleResize = () =>
    setSize({ width: window.innerWidth, height: window.innerHeight });
  const handleResizeRef = useRef(handleResize);

  useEffect(() => {
    handleResizeRef.current = handleResize;
  });

  useEffect(() => {
    const handleWindowResize = () => handleResizeRef.current();

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);
  return { window: size, inner: size };
}
