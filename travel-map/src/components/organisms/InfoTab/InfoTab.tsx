import "./InfoTab.scss";

import {
  JSX,
  PropsWithChildren,
  Suspense,
  useLayoutEffect,
  useRef,
} from "react";

import { useLocation } from "../../../hooks/location/location";
import { Loading } from "../../atoms";

interface InfoTabProps extends PropsWithChildren {
  className?: string;
}

/**
 * InfoTab component
 *
 * The info tab component is used to display some information on the
 * right of the left bar. It can display the future travels or the
 * visited cities and countries.
 *
 * When switching between tabs, a CSS keyframe animation plays a
 * close-then-open slide (600ms total). Opening/closing uses a 300ms
 * CSS transition.
 *
 * @component
 *
 * @param {InfoTabProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab
 * @returns {JSX.Element} - The info tab
 */
export function InfoTab({
  className = "",
  children,
}: InfoTabProps): JSX.Element {
  const { isInfoTabOpen, activeTab } = useLocation();
  const prevTabRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prevTab = prevTabRef.current;

    if (activeTab && prevTab && activeTab !== prevTab) {
      delete el.dataset.switching;
      void el.offsetWidth;
      el.dataset.switching = "";
    } else {
      delete el.dataset.switching;
    }

    prevTabRef.current = activeTab;
  }, [activeTab, isInfoTabOpen]);

  const handleAnimationEnd = () => {
    if (containerRef.current) {
      delete containerRef.current.dataset.switching;
    }
  };

  return (
    <div
      className={`info-tab ${className} ${isInfoTabOpen ? "info-tab--open" : ""}`}
      onAnimationEnd={handleAnimationEnd}
      ref={containerRef}
    >
      <Suspense
        fallback={
          <div className="centered">
            <Loading />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
