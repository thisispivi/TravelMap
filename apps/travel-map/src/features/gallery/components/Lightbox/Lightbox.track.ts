import { panelSpring } from "@travelmap/ui/lib/motion";
import {
  animate,
  AnimationPlaybackControls,
  MotionValue,
  PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { dragPosition, swipeTarget } from "../../lib/swipe";

/* A gesture is horizontal or vertical once the finger has moved this far. */
const AXIS_LOCK_PX = 8;

/*
 * The track's position is in slides, so a spring's default rest thresholds,
 * meant for pixels, would stop it visibly short of the slide.
 */
const REST_DELTA = 0.002;
const REST_SPEED = 0.02;

/**
 * The gesture the finger is making: not yet known, moving the track, or
 * something the browser or nothing should handle instead.
 */
type GestureMode = "undecided" | "paging" | "ignored";

/**
 * Inputs of the useLightboxTrack hook.
 * @property {number} count - How many photos the album has
 * @property {(index: number) => void} onSettled - Called when the track comes to rest on another photo
 * @property {number} urlIndex - The photo the URL names
 */
interface UseLightboxTrackProps {
  count: number;
  onSettled: (index: number) => void;
  urlIndex: number;
}

/**
 * What the useLightboxTrack hook returns.
 * @property {(index: number) => void} goTo - Animates to a photo of the album
 * @property {(event: PointerEvent, info: PanInfo) => void} handlePan - Moves the track under the finger
 * @property {(event: PointerEvent, info: PanInfo) => void} handlePanEnd - Settles the track once the finger lifts
 * @property {(event: ReactPointerEvent) => void} handlePointerDown - Gives up paging when a second finger lands
 * @property {number} index - The photo shown, whose neighbours are mounted beside it
 * @property {boolean} isMoving - Whether the track is being dragged or is settling
 * @property {boolean} isZoomed - Whether the page is pinched in, so the browser owns every gesture
 * @property {(delta: number) => void} step - Animates relative to the photo shown or being settled on
 * @property {RefObject<HTMLDivElement | null>} trackRef - The track element
 * @property {MotionValue<string>} x - The track's horizontal transform
 */
interface UseLightboxTrackReturn {
  goTo: (index: number) => void;
  handlePan: (event: PointerEvent, info: PanInfo) => void;
  handlePanEnd: (event: PointerEvent, info: PanInfo) => void;
  handlePointerDown: (event: ReactPointerEvent) => void;
  index: number;
  isMoving: boolean;
  isZoomed: boolean;
  step: (delta: number) => void;
  trackRef: RefObject<HTMLDivElement | null>;
  x: MotionValue<string>;
}

/**
 * Drives the lightbox's slide track. Every slide sits at its album position
 * and the track slides beneath the stage, so nothing has to be re-centred when
 * the photo changes. The position is a motion value in slides, as a percentage
 * needs no measuring on resize, and neither a drag nor a settle renders React:
 * the shown photo and then the URL change only once the track has come to rest,
 * and a URL changed from outside moves the track.
 * @param {UseLightboxTrackProps} props - The hook's inputs
 * @param {number} props.count - How many photos the album has
 * @param {(index: number) => void} props.onSettled - Called when the track comes to rest on another photo
 * @param {number} props.urlIndex - The photo the URL names
 * @returns {UseLightboxTrackReturn} The track's state, transform and handlers
 */
export function useLightboxTrack({
  count,
  onSettled,
  urlIndex,
}: UseLightboxTrackProps): UseLightboxTrackReturn {
  const position = useMotionValue(urlIndex);
  const x = useTransform(position, (value) => `${-value * 100}%`);
  const isReduced = useReducedMotion() ?? false;
  /*
   * The photo shown is the URL's, except from arrival until the URL has caught
   * up. An override only holds for the URL it was set against, so a URL changed
   * from outside wins without anything having to reset it.
   */
  const [override, setOverride] = useState<{
    forUrl: number;
    index: number;
  } | null>(null);
  const index = override?.forUrl === urlIndex ? override.index : urlIndex;
  const [isMoving, setIsMoving] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const settlingRef = useRef<AnimationPlaybackControls>(null);
  const settlingToRef = useRef<number>(null);
  const requestedIndexRef = useRef(urlIndex);
  const gestureRef = useRef<{
    centre: number;
    grabbedAt: number;
    mode: GestureMode;
    width: number;
  }>({ centre: urlIndex, grabbedAt: urlIndex, mode: "undecided", width: 1 });

  useEffect(() => {
    if (urlIndex === requestedIndexRef.current) return;
    requestedIndexRef.current = urlIndex;
    settlingRef.current?.stop();
    settlingToRef.current = null;
    position.set(urlIndex);
  }, [position, urlIndex]);

  useEffect(() => () => settlingRef.current?.stop(), []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    /**
     * Notes whether the page is pinched in beyond its resting scale.
     * @returns {void}
     */
    const handleResize = (): void => setIsZoomed(viewport.scale > 1.01);

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Moves the track to a photo. Only the shown photo and its neighbours are
   * mounted, so a target further away becomes the shown photo at once, with the
   * track jumping to the mounted slide nearest its current place.
   * @param {number} target - The photo to come to rest on
   * @param {number} [velocity] - The track's speed to start from, in slides a second
   * @returns {void}
   */
  const settle = (target: number, velocity = 0): void => {
    settlingRef.current?.stop();
    settlingToRef.current = target;
    if (Math.abs(target - index) > 1) {
      position.set(Math.min(target + 1, Math.max(target - 1, position.get())));
      setOverride({ forUrl: urlIndex, index: target });
    }

    /**
     * Shows the photo the track came to rest on and tells the URL, if it is
     * somewhere new.
     * @returns {void}
     */
    const arrive = (): void => {
      settlingToRef.current = null;
      setIsMoving(false);
      setOverride({ forUrl: urlIndex, index: target });
      if (target === requestedIndexRef.current) return;
      requestedIndexRef.current = target;
      onSettled(target);
    };

    if (isReduced) {
      position.set(target);
      arrive();
      return;
    }
    setIsMoving(true);
    settlingRef.current = animate(position, target, {
      ...panelSpring,
      onComplete: arrive,
      onStop: () => setIsMoving(false),
      restDelta: REST_DELTA,
      restSpeed: REST_SPEED,
      velocity,
    });
  };

  /**
   * Animates to a photo of the album, if there is one at that index.
   * @param {number} target - The photo's album index
   * @returns {void}
   */
  const goTo = (target: number): void => {
    const heading = settlingToRef.current ?? index;
    if (target >= 0 && target < count && target !== heading) settle(target);
  };

  /**
   * Animates relative to where the track is heading, so a quick second press
   * counts from the photo the first one chose.
   * @param {number} delta - How many photos to move by
   * @returns {void}
   */
  const step = (delta: number): void =>
    goTo((settlingToRef.current ?? index) + delta);

  /**
   * Decides what a new gesture is once it has moved far enough to tell, then
   * keeps the track under the finger for as long as it is paging. Touch input
   * that turns out vertical is taken by the browser, which cancels the
   * pointer; the lock is what stops a mouse doing the same diagonal. A slide
   * caught while settling counts as having arrived.
   * @param {PointerEvent} _event - The pointer event
   * @param {PanInfo} info - The gesture so far
   * @param {PanInfo["offset"]} info.offset - How far the pointer has moved
   * @returns {void}
   */
  const handlePan = (_event: PointerEvent, { offset }: PanInfo): void => {
    const gesture = gestureRef.current;
    if (gesture.mode === "undecided") {
      const across = Math.abs(offset.x);
      const along = Math.abs(offset.y);
      if (Math.max(across, along) < AXIS_LOCK_PX) return;
      gesture.mode = across > along && !isZoomed ? "paging" : "ignored";
      if (gesture.mode === "paging") {
        settlingRef.current?.stop();
        gesture.centre = settlingToRef.current ?? index;
        gesture.grabbedAt = position.get();
        gesture.width = trackRef.current?.clientWidth ?? 1;
        settlingToRef.current = null;
        setOverride({ forUrl: urlIndex, index: gesture.centre });
        setIsMoving(true);
      }
    }
    if (gesture.mode !== "paging") return;
    position.set(
      dragPosition({
        count,
        grabbedAt: gesture.grabbedAt,
        index: gesture.centre,
        moved: -offset.x / gesture.width,
      }),
    );
  };

  /**
   * Settles on the photo a released swipe chose, carrying the finger's speed
   * into the spring. A pointer the browser took back chooses nothing.
   * @param {PointerEvent} event - The pointer event that ended the gesture
   * @param {PanInfo} info - The whole gesture
   * @param {PanInfo["offset"]} info.offset - How far the pointer moved
   * @param {PanInfo["velocity"]} info.velocity - How fast it was moving at the end
   * @returns {void}
   */
  const handlePanEnd = (
    event: PointerEvent,
    { offset, velocity }: PanInfo,
  ): void => {
    const gesture = gestureRef.current;
    const wasPaging = gesture.mode === "paging";
    gesture.mode = "undecided";
    if (!wasPaging) return;

    if (event.type === "pointercancel") settle(gesture.centre);
    else
      settle(
        swipeTarget({
          count,
          index: gesture.centre,
          offset: offset.x,
          velocity: velocity.x,
        }),
        -velocity.x / gesture.width,
      );
  };

  /**
   * Gives up paging as soon as a second finger lands, leaving the pinch to the
   * browser. The first finger goes on reporting, so its gesture stays ignored
   * until it lifts.
   * @param {ReactPointerEvent} event - The pointer that landed
   * @returns {void}
   */
  const handlePointerDown = (event: ReactPointerEvent): void => {
    if (event.isPrimary) return;
    if (gestureRef.current.mode === "paging") settle(gestureRef.current.centre);
    gestureRef.current.mode = "ignored";
  };

  return {
    goTo,
    handlePan,
    handlePanEnd,
    handlePointerDown,
    index,
    isMoving,
    isZoomed,
    step,
    trackRef,
    x,
  };
}
