import "./EmblemTooltip.scss";

import { menuVariants } from "@travelmap/ui/lib/motion";
import { remToPx } from "@travelmap/ui/lib/rem";
import { AnimatePresence, m } from "framer-motion";
import { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

/** The gap between a stamp and its tooltip, in rem. */
const GAP_REM = 0.5;

/** Less room than this above the stamp, in rem, and the tooltip shows below it. */
const MIN_ROOM_REM = 4;

/**
 * Centres the tooltip over its stamp, or under it when the stamp sits too close
 * to the top of the window.
 * @param {DOMRect} anchor - The stamp's box
 * @returns {CSSProperties} The fixed position
 */
function positionOf(anchor: DOMRect): CSSProperties {
  const gap = remToPx(GAP_REM);
  const left = anchor.left + anchor.width / 2;
  return anchor.top > remToPx(MIN_ROOM_REM)
    ? { bottom: window.innerHeight - anchor.top + gap, left }
    : { left, top: anchor.bottom + gap };
}

/**
 * Properties accepted by the EmblemTooltip component.
 * @property {DOMRect | null} anchor - The stamp's box while hovered or focused, `null` otherwise
 * @property {string} text - What the stamp's drawing shows
 */
interface EmblemTooltipProps {
  anchor: DOMRect | null;
  text: string;
}

/**
 * EmblemTooltip component
 * A frosted label naming what a stamp's drawing shows. It is portalled to the
 * body because the booklet's pages clip what they hold, and it is only seen:
 * the stamp carries the same words as its accessible description.
 * @component
 * @param {EmblemTooltipProps} props - The tooltip props
 * @param {DOMRect | null} props.anchor - The stamp's box while it shows
 * @param {string} props.text - What the drawing shows
 * @returns {ReactNode} The tooltip
 */
export function EmblemTooltip({ anchor, text }: EmblemTooltipProps): ReactNode {
  return createPortal(
    <AnimatePresence>
      {anchor ? (
        <m.p
          animate="animate"
          aria-hidden="true"
          className="emblem-tooltip"
          exit="exit"
          initial="initial"
          style={positionOf(anchor)}
          variants={menuVariants}
        >
          {text}
        </m.p>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
