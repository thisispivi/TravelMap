import "./PanelLoading.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect } from "react";

import { setPanelLoadingVisible } from "./PanelLoading.state";

/**
 * Which panel geometry the fallback occupies while a route chunk loads.
 */
type PanelLoadingVariant = "side" | "bottom";

const sidePanelMotion = {
  animate: { x: 0 },
  initial: { x: "-120%" },
  transition: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
} as const;

const SIDE_PLACEHOLDER_COUNT = 3;
const BOTTOM_PLACEHOLDER_COUNT = 6;

/**
 * Properties accepted by the PanelLoading component.
 * @property {PanelLoadingVariant} variant - Which panel geometry to occupy
 */
interface PanelLoadingProps {
  variant: PanelLoadingVariant;
}

/**
 * PanelLoading component
 * Suspense fallback for a panel whose route chunk is still loading. Instead of
 * a spinner it lays out placeholders in the shape the panel is about to take,
 * so the surface does not resize once the real content arrives. The side
 * variant slides in on its own; the bottom one already sits inside the
 * animated bottom panel and only fills it.
 * @component
 * @param {PanelLoadingProps} props - The panel loading props
 * @param {PanelLoadingVariant} props.variant - Which panel geometry to occupy
 * @returns {ReactNode} The loading placeholder
 */
export function PanelLoading({ variant }: PanelLoadingProps): ReactNode {
  useEffect(() => {
    setPanelLoadingVisible(true);
    return () => {
      setPanelLoadingVisible(false);
    };
  }, []);

  const count =
    variant === "bottom" ? BOTTOM_PLACEHOLDER_COUNT : SIDE_PLACEHOLDER_COUNT;
  const body = (
    <>
      <span className="panel-loading__title" />
      <div className="panel-loading__blocks">
        {Array.from({ length: count }, (_, index) => (
          <span className="panel-loading__block" key={index} />
        ))}
      </div>
    </>
  );

  if (variant === "bottom") {
    return <div className="panel-loading panel-loading--bottom">{body}</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={sidePanelMotion.animate}
        className="panel-loading panel-loading--side"
        initial={sidePanelMotion.initial}
        transition={sidePanelMotion.transition}
      >
        {body}
      </m.div>
    </LazyMotion>
  );
}
