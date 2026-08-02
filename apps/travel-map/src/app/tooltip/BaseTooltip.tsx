import { ReactNode, useEffect, useRef } from "react";
import { Tooltip, TooltipRefProps } from "react-tooltip";

/**
 * BaseTooltip component
 * Global `react-tooltip` instance used for all `data-tooltip-id="base-tooltip"`
 * anchors. Automatically closes when the window loses focus or the tab becomes
 * hidden to prevent stale tooltips after context switches.
 * @component
 * @returns {ReactNode} The shared tooltip element
 */
export function BaseTooltip(): ReactNode {
  const tooltipRef = useRef<TooltipRefProps>(null);

  useEffect(() => {
    /**
     * Closes the global tooltip immediately.
     * @returns {void}
     */
    const closeTooltip = (): void => {
      tooltipRef.current?.close({ delay: 0 });
    };

    /**
     * Closes the tooltip when its browser tab becomes hidden.
     * @returns {void}
     */
    const handleVisibilityChange = (): void => {
      if (document.hidden) closeTooltip();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", closeTooltip);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", closeTooltip);
    };
  }, []);

  return (
    <Tooltip
      className="tooltip"
      delayShow={300}
      globalCloseEvents={{ clickOutsideAnchor: true, escape: true }}
      id="base-tooltip"
      noArrow
      opacity={1}
      ref={tooltipRef}
    />
  );
}
