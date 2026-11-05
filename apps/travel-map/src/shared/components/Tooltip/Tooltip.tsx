import "./Tooltip.scss";

import { classNames } from "@travelmap/ui/lib/classNames";
import { menuVariants } from "@travelmap/ui/lib/motion";
import { remToPx } from "@travelmap/ui/lib/rem";
import { AnimatePresence, m } from "framer-motion";
import {
  CSSProperties,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { TooltipTip } from "@/shared/hooks/useTooltip";

/** The gap between a trigger and its tooltip, and the least room to the window's edge, in rem. */
const GAP_REM = 0.5;

/**
 * Places the tooltip on its preferred side of its trigger, over it unless told
 * otherwise, or on the other side when the preferred one has no room, and
 * keeps it inside the window, which on a phone is often narrower than the
 * tooltip centred on a bar near its edge.
 * @param {DOMRect} anchor - The trigger's box
 * @param {number} width - The tooltip's own width
 * @param {number} height - The tooltip's own height
 * @param {boolean} isBelow - Whether it would rather sit under its trigger
 * @returns {CSSProperties} The fixed position
 */
function positionOf(
  anchor: DOMRect,
  width: number,
  height: number,
  isBelow: boolean,
): CSSProperties {
  const gap = remToPx(GAP_REM);
  const centre = anchor.left + anchor.width / 2;
  const left = Math.min(
    Math.max(centre - width / 2, gap),
    window.innerWidth - width - gap,
  );
  const above = anchor.top - height - gap;
  const below = anchor.bottom + gap;
  const roomBelow = window.innerHeight - below - gap;
  const fitsAbove = above >= gap;
  const fitsBelow = roomBelow >= height;
  /*
   * A tall card on a short phone may fit neither side. It then takes the side
   * with more room, pinned to the window's edge, and overlaps its trigger a
   * little rather than leave the window or run under the phone's tab bar.
   */
  const top =
    isBelow && fitsBelow
      ? below
      : fitsAbove
        ? above
        : fitsBelow
          ? below
          : anchor.top - gap > roomBelow
            ? gap
            : Math.max(gap, window.innerHeight - height - gap);
  return { left, top };
}

/**
 * Properties accepted by the TooltipBody component.
 * @property {ReactNode} title - What the tooltip is about
 * @property {string} [swatch] - The colour of the mark it describes, shown as a dot
 * @property {string[]} [lines] - Its figures, one to a line, each different
 */
interface TooltipBodyProps {
  title: ReactNode;
  swatch?: string;
  lines?: string[];
}

/**
 * TooltipBody component
 * The layout of a chart's tooltip: a title, with the colour dot of the mark
 * it describes, then its figures.
 * @component
 * @param {TooltipBodyProps} props - The body props
 * @param {ReactNode} props.title - What the tooltip is about
 * @param {string} [props.swatch] - The colour of the mark it describes
 * @param {string[]} [props.lines=[]] - Its figures
 * @returns {ReactNode} The body
 */
export function TooltipBody({
  title,
  swatch,
  lines = [],
}: TooltipBodyProps): ReactNode {
  /* CSSProperties has no keys for custom properties, hence the cast. */
  const swatchStyle = { "--tooltip-swatch": swatch } as CSSProperties;

  return (
    <>
      <p className="tooltip__title">
        {swatch ? (
          <span className="tooltip__swatch" style={swatchStyle} />
        ) : null}
        {title}
      </p>
      {lines.map((line) => (
        <p className="tooltip__line" key={line}>
          {line}
        </p>
      ))}
    </>
  );
}

/**
 * Properties accepted by the Tooltip component.
 * @property {TooltipTip | null} tip - What to show, from `useTooltip`
 * @property {boolean} [isCard] - Whether it holds a card with a picture, edge to edge, as the map's city card does
 * @property {boolean} [isBelow] - Whether it would rather sit under its trigger than over it
 */
interface TooltipProps {
  tip: TooltipTip | null;
  isCard?: boolean;
  isBelow?: boolean;
}

/**
 * Tooltip component
 * A small frosted card naming what is under the pointer or finger. It is
 * portalled to the body so no clipping ancestor cuts it off and its glass
 * blurs the page behind, and it is only seen: whatever it says is also on the
 * page or in its trigger's accessible name.
 * @component
 * @param {TooltipProps} props - The tooltip props
 * @param {TooltipTip | null} props.tip - What to show
 * @param {boolean} [props.isCard=false] - Whether it holds a card with a picture
 * @param {boolean} [props.isBelow=false] - Whether it would rather sit under its trigger
 * @returns {ReactNode} The tooltip
 */
export function Tooltip({
  tip,
  isCard = false,
  isBelow = false,
}: TooltipProps): ReactNode {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ height: 0, key: "", width: 0 });
  /*
   * framer-motion paints a style change a frame late, so a tooltip drawn at its
   * unmeasured size would flash beside its trigger and then slide into place.
   * It stays hidden until it has been measured for this trigger.
   */
  const isMeasured = size.key === tip?.key;

  useLayoutEffect(() => {
    const element = tooltipRef.current;
    if (!element || !tip) return;
    setSize({
      height: element.offsetHeight,
      key: tip.key,
      width: element.offsetWidth,
    });
  }, [tip]);

  return createPortal(
    <AnimatePresence>
      {tip ? (
        <m.div
          animate="animate"
          aria-hidden="true"
          className={classNames("tooltip", isCard && "tooltip--card")}
          exit="exit"
          initial="initial"
          key={tip.key}
          ref={tooltipRef}
          style={{
            ...positionOf(tip.anchor, size.width, size.height, isBelow),
            visibility: isMeasured ? "visible" : "hidden",
          }}
          variants={menuVariants}
        >
          {tip.content}
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
