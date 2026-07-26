import "./PanelLoading.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect } from "react";

import { Loading } from "../../atoms/Loading/Loading";
import { setPanelLoadingVisible } from "./panelLoadingState";

/**
 * Represents a panel loading variant.
 */
type PanelLoadingVariant = "side" | "bottom";

const sidePanelMotion = {
  animate: { scale: 1, x: 0 },
  initial: { scale: 0.98, x: "-120%" },
  transition: { duration: 0.22, ease: [0.35, 0, 0.25, 1] },
} as const;

/**
 * Properties accepted by the PanelLoading component.
 * @property {PanelLoadingVariant} variant - The variant
 */
interface PanelLoadingProps {
  variant: PanelLoadingVariant;
}

/**
 * PanelLoading component
 * Suspense fallback for a panel whose page chunk is still loading: the glass
 * surface of the panel with a spinner in the middle of it. The side variant
 * slides in on its own, the bottom one is already inside the animated bottom
 * panel and only fills it.
 * @component
 * @param {PanelLoadingProps} props
 * @param {PanelLoadingVariant} props.variant - Which panel geometry to occupy
 * @returns {ReactNode} The loading panel
 */
export function PanelLoading({ variant }: PanelLoadingProps): ReactNode {
  useEffect(() => {
    setPanelLoadingVisible(true);
    return () => {
      setPanelLoadingVisible(false);
    };
  }, []);

  if (variant === "bottom") {
    return (
      <div className="panel-loading panel-loading--bottom">
        <Loading />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={sidePanelMotion.animate}
        className="panel-loading panel-loading--side"
        initial={sidePanelMotion.initial}
        transition={sidePanelMotion.transition}
      >
        <Loading />
      </m.div>
    </LazyMotion>
  );
}
