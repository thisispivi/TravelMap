import { useCallback, useEffect, useMemo, useState } from "react";

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

  const handleResize = useCallback(
    () => setSize({ width: window.innerWidth, height: window.innerHeight }),
    [],
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return useMemo(() => ({ window: size, inner: size }), [size]);
}
