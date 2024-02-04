import { useEffect, useState } from "react";

/**
 * Hook that returns the current window size
 * @returns {number[]} - The current window size
 */
export default function useResize(): number[] {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const onResize = () => {
      requestAnimationFrame(() => {
        setSize([window.innerWidth, window.innerHeight]);
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}
