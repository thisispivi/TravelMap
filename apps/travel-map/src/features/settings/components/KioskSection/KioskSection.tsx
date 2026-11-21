import "./KioskSection.scss";

import { Button } from "@travelmap/ui/components/Button/Button";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { MonitorPlay, MonitorX } from "lucide-react";
import { ReactNode, useSyncExternalStore } from "react";

import { tripAlbums } from "@/data/albums";
import { SegmentedControl } from "@/shared/components/SegmentedControl/SegmentedControl";

import {
  chosenSections,
  IDLE_MINUTES,
  KioskSettings,
  kioskStore,
  PHOTO_SECONDS,
  SLIDE_ORDERS,
  TRIP_SELECTIONS,
} from "../../lib/kiosk";
import { SettingsSection } from "../SettingsSection/SettingsSection";

/* The on/off preferences, each one checkbox. */
const TOGGLES = [
  "hasCaptions",
  "hasTransitions",
  "isFullscreen",
  "restoresOnReload",
] as const satisfies readonly (keyof KioskSettings)[];

/**
 * Starts kiosk mode, in full screen when the operator asked for it. Full screen
 * is only ever a request: a browser that refuses it, or a reader who leaves it,
 * still gets the slideshow in the window.
 * @param {boolean} isFullscreen - Whether to ask for full screen
 * @returns {void}
 */
function startKiosk(isFullscreen: boolean): void {
  kioskStore.enable();
  if (isFullscreen && !document.fullscreenElement)
    document.documentElement.requestFullscreen().catch((error: unknown) => {
      console.info(
        "Full screen was refused; the slideshow runs in the window.",
        error,
      );
    });
}

/**
 * Turns kiosk mode off and leaves the full screen it may have entered.
 * @returns {void}
 */
function stopKiosk(): void {
  kioskStore.disable();
  if (document.fullscreenElement) void document.exitFullscreen();
}

/**
 * KioskSection component
 * Kiosk mode for a touchscreen or a display: how long the app waits before the
 * trip-photo slideshow comes back, how the slideshow runs, and which trips it
 * shows. Every choice is remembered on this device; the mode itself starts off
 * on a fresh visit unless the operator asks for it to come back after a reload.
 * @component
 * @returns {ReactNode} The kiosk settings
 */
export function KioskSection(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { settings, isEnabled, hasNoPhotos } = useSyncExternalStore(
    kioskStore.subscribe,
    kioskStore.read,
  );
  const chosenTrips = new Set(settings.tripIds);
  const photoCount = chosenSections(settings).reduce(
    (sum, { gallery }) => sum + gallery.count,
    0,
  );

  /**
   * Adds a trip to the slideshow or takes it out.
   * @param {string} tripId - The trip
   * @param {boolean} isChosen - Whether the slideshow shows it
   * @returns {void}
   */
  function handleTripChange(tripId: string, isChosen: boolean): void {
    kioskStore.setSettings({
      tripIds: isChosen
        ? [...settings.tripIds, tripId]
        : settings.tripIds.filter((id) => id !== tripId),
    });
  }

  return (
    <SettingsSection title={t("settings.kiosk.title")}>
      <p className="kiosk-section__hint">{t("settings.kiosk.hint")}</p>
      <div className="kiosk-section__setting">
        <span className="kiosk-section__label">{t("settings.kiosk.idle")}</span>
        <SegmentedControl
          id="kiosk-idle"
          label={t("settings.kiosk.idle")}
          onChange={(idleMinutes) => kioskStore.setSettings({ idleMinutes })}
          options={IDLE_MINUTES.map((value) => ({
            label: t("settings.kiosk.minutes", { count: Number(value) }),
            value,
          }))}
          value={settings.idleMinutes}
        />
      </div>
      <div className="kiosk-section__setting">
        <span className="kiosk-section__label">
          {t("settings.kiosk.photoTime")}
        </span>
        <SegmentedControl
          id="kiosk-photo-time"
          label={t("settings.kiosk.photoTime")}
          onChange={(photoSeconds) => kioskStore.setSettings({ photoSeconds })}
          options={PHOTO_SECONDS.map((value) => ({
            label: t("settings.kiosk.seconds", { count: Number(value) }),
            value,
          }))}
          value={settings.photoSeconds}
        />
      </div>
      <div className="kiosk-section__setting">
        <span className="kiosk-section__label">
          {t("settings.kiosk.order")}
        </span>
        <SegmentedControl
          id="kiosk-order"
          label={t("settings.kiosk.order")}
          onChange={(order) => kioskStore.setSettings({ order })}
          options={SLIDE_ORDERS.map((value) => ({
            label: t(`settings.kiosk.orders.${value}`),
            value,
          }))}
          value={settings.order}
        />
      </div>
      <div className="kiosk-section__setting">
        <span className="kiosk-section__label">
          {t("settings.kiosk.trips")}
        </span>
        <SegmentedControl
          id="kiosk-trips"
          label={t("settings.kiosk.trips")}
          onChange={(selection) => kioskStore.setSettings({ selection })}
          options={TRIP_SELECTIONS.map((value) => ({
            label: t(`settings.kiosk.selections.${value}`),
            value,
          }))}
          value={settings.selection}
        />
        {settings.selection === "selected" ? (
          <ul className="kiosk-section__trips">
            {tripAlbums.map(({ trip, album }) => (
              <li key={trip.id}>
                <label className="kiosk-section__check">
                  <input
                    checked={chosenTrips.has(trip.id)}
                    className="kiosk-section__input"
                    onChange={(event) =>
                      handleTripChange(trip.id, event.target.checked)
                    }
                    type="checkbox"
                  />
                  {trip.getLocalizedTitle(currLanguage)}
                  <span className="kiosk-section__count">
                    {t("settings.kiosk.photos", { count: album.count })}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="kiosk-section__toggles">
        {TOGGLES.map((toggle) => (
          <label className="kiosk-section__check" key={toggle}>
            <input
              checked={settings[toggle]}
              className="kiosk-section__input"
              onChange={(event) =>
                kioskStore.setSettings({ [toggle]: event.target.checked })
              }
              type="checkbox"
            />
            {t(`settings.kiosk.toggles.${toggle}`)}
          </label>
        ))}
      </div>
      {photoCount === 0 || hasNoPhotos ? (
        <p className="kiosk-section__warning" role="status">
          {t("settings.kiosk.noPhotos")}
        </p>
      ) : null}
      {isEnabled ? (
        <Button className="kiosk-section__action" onClick={stopKiosk}>
          <MonitorX aria-hidden="true" />
          {t("settings.kiosk.disable")}
        </Button>
      ) : (
        <Button
          className="kiosk-section__action"
          disabled={photoCount === 0}
          onClick={() => startKiosk(settings.isFullscreen)}
          variant="primary"
        >
          <MonitorPlay aria-hidden="true" />
          {t("settings.kiosk.enable")}
        </Button>
      )}
    </SettingsSection>
  );
}
