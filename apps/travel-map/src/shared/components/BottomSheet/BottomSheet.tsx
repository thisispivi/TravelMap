import "./BottomSheet.scss";

import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { panelSpring } from "@travelmap/ui/lib/motion";
import {
  animate,
  m,
  MotionStyle,
  PanInfo,
  useDragControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

import { SHEET_HALF_HIDDEN_SHARE, SHEET_PEEK_PX } from "./BottomSheet.metrics";

/** A resting height of the open sheet. */
type OpenSnap = "half" | "full";

/* How far a fling carries the sheet past where the finger let go, in seconds. */
const FLING_PROJECTION_S = 0.18;

/**
 * Properties accepted by the BottomSheet component.
 * @property {boolean} isOpen - Whether the sheet is open; closed leaves only its header
 * @property {(isOpen: boolean) => void} onOpenChange - Opens or collapses the sheet
 * @property {ReactNode} children - The sheet's scrolling content
 */
interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
}

/**
 * BottomSheet component
 * The phone home of the side panel: a sheet over the map that rests
 * collapsed, half open, or full, dragged by its handle so the content keeps
 * its own scrolling. The panel inside pads the end of its body by however
 * much of the sheet is below the screen, so everything stays reachable at
 * every height.
 * @component
 * @param {BottomSheetProps} props - The sheet props
 * @param {boolean} props.isOpen - Whether the sheet is open
 * @param {(isOpen: boolean) => void} props.onOpenChange - Opens or collapses the sheet
 * @param {ReactNode} props.children - The sheet's scrolling content
 * @returns {ReactNode} The bottom sheet
 */
export function BottomSheet({
  isOpen,
  onOpenChange,
  children,
}: BottomSheetProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [height, setHeight] = useState(() => window.innerHeight * 0.85);
  const [openSnap, setOpenSnap] = useState<OpenSnap>("half");
  /* Starts below the screen, so the first settle slides it into place. */
  const y = useMotionValue(height);
  const hidden = useTransform(y, (offset) => `${offset}px`);

  const offsets = {
    full: 0,
    half: height * SHEET_HALF_HIDDEN_SHARE,
    peek: Math.max(height - SHEET_PEEK_PX, 0),
  };
  const target = isOpen ? offsets[openSnap] : offsets.peek;

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const observer = new ResizeObserver(() => setHeight(sheet.offsetHeight));
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controls = animate(y, target, panelSpring);
    return () => controls.stop();
  }, [target, y]);

  /**
   * Settles a released drag on the resting height nearest to where a fling
   * would carry it.
   * @param {PointerEvent} _event - The pointer event that ended the drag
   * @param {PanInfo} info - The drag's velocity
   * @returns {void}
   */
  const handleDragEnd = (_event: PointerEvent, info: PanInfo): void => {
    const projected = y.get() + info.velocity.y * FLING_PROJECTION_S;
    const [nearest] = (["full", "half", "peek"] as const).toSorted(
      (first, second) =>
        Math.abs(offsets[first] - projected) -
        Math.abs(offsets[second] - projected),
    );
    if (nearest === "peek") {
      onOpenChange(false);
      animate(y, offsets.peek, panelSpring);
      return;
    }
    setOpenSnap(nearest);
    onOpenChange(true);
    animate(y, offsets[nearest], panelSpring);
  };

  /**
   * Steps the sheet through its heights from the handle: a collapsed sheet
   * opens half way, a half-open one rises to full height, and a full one
   * collapses. Dragging reaches the same heights, but a keyboard or switch
   * user has only this button.
   * @returns {void}
   */
  const handleToggle = (): void => {
    if (!isOpen) {
      setOpenSnap("half");
      onOpenChange(true);
    } else if (openSnap === "half") setOpenSnap("full");
    else onOpenChange(false);
  };

  return (
    <m.div
      className="bottom-sheet"
      drag="y"
      dragConstraints={{ bottom: offsets.peek, top: 0 }}
      dragControls={dragControls}
      dragElastic={0.06}
      dragListener={false}
      onDragEnd={handleDragEnd}
      ref={sheetRef}
      style={{ y }}
    >
      <div
        className="bottom-sheet__grip"
        onPointerDown={(event) => dragControls.start(event)}
      >
        <button
          aria-expanded={isOpen}
          aria-label={
            !isOpen
              ? t("sheet.expand")
              : openSnap === "half"
                ? t("sheet.expandFull")
                : t("sheet.collapse")
          }
          className="bottom-sheet__handle"
          onClick={handleToggle}
          type="button"
        />
      </div>
      {/*
       * How much of the sheet is below the screen, which the panel inside
       * adds to the end of its scrolling body so its last item stays reachable.
       * MotionStyle has no keys for custom properties, hence the cast.
       */}
      <m.div
        className="bottom-sheet__body"
        style={{ "--sheet-hidden": hidden } as MotionStyle}
      >
        {children}
      </m.div>
    </m.div>
  );
}
