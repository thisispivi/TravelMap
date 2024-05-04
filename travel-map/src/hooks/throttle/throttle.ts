import { useState, useEffect, useRef } from "react";

type Throttle = {
  status: boolean;
  delay: number;
};

/**
 * useThrottle hook
 *
 * The useThrottle hook is a custom hook that throttles the status change.
 * It will wait for the delay to pass before changing the status.
 *
 * @param {Throttle} data - The data that will be used to throttle the status
 * @param {boolean} data.status - The status to throttle
 * @param {number} data.delay - The delay to wait before changing the status
 * @returns {boolean} The throttled status
 */
export default function useThrottle({ status, delay }: Throttle): boolean {
  const [throttled, setThrottled] = useState(status);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    if (Date.now() - lastExecuted.current >= delay) {
      lastExecuted.current = Date.now();
      setThrottled(status);
    } else {
      const throttleTimer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottled(status);
      }, delay);

      return () => clearTimeout(throttleTimer);
    }
  }, [status, delay]);

  return throttled;
}
