import { useEffect, useState } from "react";

type SizeType = {
  width: number;
  height: number;
};

export type ResponsiveType = {
  window: SizeType;
  inner: SizeType;
};

/**
 * Hook to detect the current window size
 * @returns {ResponsiveType} - Object containing the window size and the inner size
 */
export default function useResponsive(): ResponsiveType {
  const [windowCustom, setWindowCustom] = useState<SizeType>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const handleResize = () =>
    setWindowCustom({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    window: windowCustom,
    inner: { width: window.innerWidth, height: window.innerHeight },
  };
}
