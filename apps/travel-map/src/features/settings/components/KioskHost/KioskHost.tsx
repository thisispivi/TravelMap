import "./KioskHost.scss";

import { mediaUrl, PublishedImage } from "@travelmap/core";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { AnimatePresence, m } from "framer-motion";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { AlbumSection } from "@/data/albums";
import { loadGallery } from "@/data/photos";

import {
  buildSlideOrder,
  chosenSections,
  KioskSettings,
  kioskStore,
  SlidePosition,
} from "../../lib/kiosk";

/* Activity that counts as someone using the app. */
const ACTIVITY_EVENTS = [
  "keydown",
  "pointerdown",
  "pointermove",
  "scroll",
  "touchstart",
  "wheel",
] as const;
const ACTIVITY_OPTIONS = { capture: true, passive: true } as const;

/**
 * A photo ready to show: decoded, so it never appears half drawn.
 * @property {number} position - Its place in the slide order
 * @property {PublishedImage} photo - The photo
 * @property {AlbumSection} section - The visit it was taken on
 */
interface Slide {
  position: number;
  photo: PublishedImage;
  section: AlbumSection;
}

/**
 * Finds the next photo that can be shown, starting at a position and going
 * round the order at most once. A video, a missing entry, or a photo that fails
 * to load is skipped, so one bad file never stops the show.
 * @param {SlidePosition[]} order - The slide order
 * @param {number} from - The position to start looking at
 * @returns {Promise<Slide | null>} The photo, or null when none in the order loads
 */
async function prepareSlide(
  order: SlidePosition[],
  from: number,
): Promise<Slide | null> {
  for (let tried = 0; tried < order.length; tried++) {
    const position = (from + tried) % order.length;
    const { section, index } = order[position]!;
    try {
      const photo = (await loadGallery(section.gallery))[index];
      if (!photo || photo.youtube) continue;
      const image = new Image();
      image.src = mediaUrl(photo.original);
      await image.decode();
      return { photo, position, section };
    } catch {
      /* A manifest or photo that will not load is passed over, as a video is. */
    }
  }
  return null;
}

/**
 * Properties accepted by the KioskSlideshow component.
 * @property {KioskSettings} settings - The kiosk preferences
 */
interface KioskSlideshowProps {
  settings: KioskSettings;
}

/**
 * KioskSlideshow component
 * The screensaver: trip photos one after another over the whole screen, each
 * decoded before it shows while only the next one loads behind it. The app
 * stays mounted underneath, so its route, map view and open panel are exactly
 * as they were when the slideshow goes. A tap, click or key press ends it and
 * is consumed, so it never reaches the control underneath; focus then returns
 * to where it was.
 * @component
 * @param {KioskSlideshowProps} props - The slideshow props
 * @param {KioskSettings} props.settings - The kiosk preferences
 * @returns {ReactNode} The slideshow over the app
 */
function KioskSlideshow({ settings }: KioskSlideshowProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const [order] = useState(() =>
    buildSlideOrder(chosenSections(settings), settings.order),
  );
  const [slide, setSlide] = useState<Slide | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const photoMs = Number(settings.photoSeconds) * 1000;

  useEffect(() => {
    let isActive = true;
    let timer = 0;
    let next = prepareSlide(order, 0);

    /**
     * Shows the photo already loading, starts loading the one after it, and
     * comes back when this one has had its time.
     * @returns {Promise<void>} Completion once the photo is on screen
     */
    async function advance(): Promise<void> {
      const ready = await next;
      if (!isActive) return;
      if (!ready) {
        kioskStore.reportNoPhotos();
        return;
      }
      setSlide(ready);
      next = prepareSlide(order, ready.position + 1);
      timer = window.setTimeout(advance, photoMs);
    }

    void advance();
    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [order, photoMs]);

  useEffect(() => {
    const returnTo =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    /* The top layer puts it over everything, popovers included, and makes the app inert. */
    const dialog = dialogRef.current;
    dialog?.showModal();

    /**
     * Ends the slideshow on any key, without the key doing anything else.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    function handleKeyDown(event: KeyboardEvent): void {
      event.preventDefault();
      event.stopImmediatePropagation();
      kioskStore.setShowing(false);
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      /* Closed first: focus cannot land in the app while a modal still makes it inert. */
      dialog?.close();
      returnTo?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      aria-label={t("settings.kiosk.slideshow")}
      className="kiosk-slideshow"
      ref={dialogRef}
    >
      <button
        aria-label={t("settings.kiosk.wake")}
        className="kiosk-slideshow__wake"
        onClick={() => kioskStore.setShowing(false)}
        type="button"
      >
        <AnimatePresence initial={false}>
          {slide ? (
            <m.img
              alt={slide.photo.alt ?? ""}
              animate={{ opacity: 1 }}
              className="kiosk-slideshow__photo"
              exit={{ opacity: 0 }}
              initial={{ opacity: settings.hasTransitions ? 0 : 1 }}
              key={slide.position}
              src={mediaUrl(slide.photo.original)}
              transition={{ duration: settings.hasTransitions ? 1 : 0 }}
            />
          ) : null}
        </AnimatePresence>
        {settings.hasCaptions && slide ? (
          <span className="kiosk-slideshow__caption">
            <span className="kiosk-slideshow__place">
              {slide.section.city.getLocalizedName(currLanguage)}
            </span>
            {slide.section.trip.getLocalizedTitle(currLanguage)}
          </span>
        ) : null}
      </button>
    </dialog>
  );
}

/**
 * KioskHost component
 * Runs kiosk mode for the whole app: while it is on, a stretch with no mouse,
 * touch, scroll or key activity brings the slideshow back. Mounted once by the
 * shell, it draws nothing until the slideshow shows.
 * @component
 * @returns {ReactNode} The slideshow when it is showing
 */
export function KioskHost(): ReactNode {
  const { isEnabled, isShowing, settings } = useSyncExternalStore(
    kioskStore.subscribe,
    kioskStore.read,
  );
  const idleMs = Number(settings.idleMinutes) * 60_000;

  useEffect(() => {
    if (!isEnabled || isShowing) return;
    let timer: number | undefined;

    /**
     * Starts the idle countdown again after any activity.
     * @returns {void}
     */
    function handleActivity(): void {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => kioskStore.setShowing(true), idleMs);
    }

    handleActivity();
    ACTIVITY_EVENTS.forEach((type) =>
      window.addEventListener(type, handleActivity, ACTIVITY_OPTIONS),
    );
    return () => {
      window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((type) =>
        window.removeEventListener(type, handleActivity, ACTIVITY_OPTIONS),
      );
    };
  }, [idleMs, isEnabled, isShowing]);

  return isShowing ? <KioskSlideshow settings={settings} /> : null;
}
