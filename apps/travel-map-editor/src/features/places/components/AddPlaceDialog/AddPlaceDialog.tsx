import "./AddPlaceDialog.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { MapPinPlus, X } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

import { applyWrites, DatasetSnapshot } from "../../../../data/store";
import { Combobox } from "../../../../shared/components/Combobox/Combobox";
import {
  NumberField,
  TextField,
} from "../../../../shared/components/Fields/Fields";
import { timeZoneAt, WorldCity } from "../../lib/gazetteer";
import { planManualPlace, planPlace } from "../../lib/placeCreate";
import { cityOptions, countryOptions } from "../../lib/placeOptions";
import { PlaceImport } from "../PlaceImport/PlaceImport";
import { WorldCitySearch } from "../WorldCitySearch/WorldCitySearch";

/**
 * Checks that an authored point fits longitude and latitude bounds.
 * @param {number | undefined} longitude - Authored longitude
 * @param {number | undefined} latitude - Authored latitude
 * @returns {[number, number] | null} The storable point, or null when invalid
 */
function validPoint(
  longitude: number | undefined,
  latitude: number | undefined,
): [number, number] | null {
  const isValid =
    longitude !== undefined &&
    latitude !== undefined &&
    Math.abs(longitude) <= 180 &&
    Math.abs(latitude) <= 90;
  return isValid ? [longitude, latitude] : null;
}

/**
 * AddPlaceDialog component
 * Adds an existing or gazetteer-backed city to the itinerary. The dialog
 * previews any country and city files that will be created before applying
 * those writes.
 * @component
 * @param {AddPlaceDialogProps} props
 * @param {[number, number]} [props.coordinates] - A point the author clicked on the map
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {() => void} props.onClose - Dismisses the dialog
 * @param {(cityId: string) => void} props.onPlace - Called with the city to add
 * @returns {ReactNode} The place dialog
 */
export function AddPlaceDialog({
  coordinates,
  dataset,
  onClose,
  onPlace,
}: AddPlaceDialogProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [picked, setPicked] = useState<WorldCity | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualCountryId, setManualCountryId] = useState(
    dataset.countries[0]?.value.id ?? "",
  );
  const [longitude, setLongitude] = useState<number | undefined>(
    coordinates?.[0],
  );
  const [latitude, setLatitude] = useState<number | undefined>(
    coordinates?.[1],
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const plan = picked ? planPlace(dataset, picked) : null;

  /**
   * Writes whatever the chosen gazetteer entry implies, then hands the city to
   * the itinerary.
   * @returns {Promise<void>} Completion once the writes are acknowledged
   */
  async function handleConfirm(): Promise<void> {
    if (!plan) return;
    try {
      await applyWrites(plan.writes);
      onPlace(plan.cityId);
      onClose();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("addPlace.writeFailed"),
      );
    }
  }

  /**
   * Creates a city from authored coordinates when catalogue search is not
   * sufficient. The country remains explicit because the editor does not load
   * land polygons for reverse geocoding.
   * @returns {Promise<void>} Completion once the write is acknowledged
   */
  async function handleCreateManual(): Promise<void> {
    const manualCoordinates = validPoint(longitude, latitude);
    if (!manualCoordinates || !manualName.trim() || !manualCountryId) return;
    try {
      const timeZone = (await timeZoneAt(manualCoordinates)) ?? "UTC";
      const manual = planManualPlace(
        dataset,
        manualName.trim(),
        manualCountryId,
        manualCoordinates,
        timeZone,
      );
      await applyWrites(manual.writes);
      onPlace(manual.cityId);
      onClose();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("addPlace.writeFailed"),
      );
    }
  }
  return (
    <dialog
      aria-label={t("addPlace.title")}
      className="add-place"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <h2 className="add-place__title">{t("addPlace.title")}</h2>
      {dataset.cities.length > 0 ? (
        <Combobox
          hint={t("addPlace.existingHint")}
          label={t("addPlace.existing")}
          onChange={(cityId) => {
            if (!cityId) return;
            onPlace(cityId);
            onClose();
          }}
          options={cityOptions(dataset)}
          value=""
        />
      ) : null}
      <WorldCitySearch
        hint={t("addPlace.searchHint")}
        label={t("addPlace.search")}
        onSelect={setPicked}
      />
      {picked && !plan ? (
        <p className="editor-notice editor-notice--warning">
          <span className="editor-notice__item">
            {t("addPlace.countryNotOnMap")}
          </span>
        </p>
      ) : null}
      {plan ? (
        <div className="add-place__plan">
          <p className="add-place__plan-title">
            {plan.isExisting
              ? t("addPlace.reusesExisting", { city: plan.cityId })
              : t("addPlace.willCreateCity", { city: plan.cityId })}
          </p>
          {plan.createsCountry ? (
            <p className="editor-panel__hint">
              {t("addPlace.willCreateCountry", {
                country: plan.createsCountry,
              })}
            </p>
          ) : null}
          {!plan.isExisting && plan.nearbyCityId ? (
            <p className="editor-notice editor-notice--warning">
              <span className="editor-notice__item">
                {t("addPlace.nearbyDuplicate", { city: plan.nearbyCityId })}
              </span>
            </p>
          ) : null}
          <ul className="add-place__writes">
            {plan.writes.map((write) => (
              <li key={write.path}>
                <code>{write.path}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="add-place__manual">
        <p className="add-place__plan-title">{t("addPlace.manualTitle")}</p>
        <PlaceImport
          onImport={(place) => {
            setLongitude(place.coordinates[0]);
            setLatitude(place.coordinates[1]);
            if (place.name) setManualName(place.name);
          }}
        />
        <div className="editor-panel__row">
          <TextField
            label={t("addPlace.manualName")}
            onChange={setManualName}
            value={manualName}
          />
          <Combobox
            label={t("addPlace.manualCountry")}
            onChange={setManualCountryId}
            options={countryOptions(dataset)}
            value={manualCountryId}
          />
        </div>
        <div className="editor-panel__row">
          <NumberField
            label={t("cityScreen.longitude")}
            onChange={setLongitude}
            step="any"
            value={longitude}
          />
          <NumberField
            label={t("cityScreen.latitude")}
            onChange={setLatitude}
            step="any"
            value={latitude}
          />
        </div>
        <button
          className="editor-button"
          disabled={
            !manualName.trim() ||
            !manualCountryId ||
            !validPoint(longitude, latitude)
          }
          onClick={handleCreateManual}
          type="button"
        >
          <MapPinPlus aria-hidden="true" />
          {t("addPlace.createHere")}
        </button>
      </div>
      <footer className="add-place__actions">
        <button
          className="editor-button editor-button--primary"
          disabled={!plan}
          onClick={handleConfirm}
          type="button"
        >
          <MapPinPlus aria-hidden="true" />
          {t("addPlace.add")}
        </button>
        <button className="editor-button" onClick={onClose} type="button">
          <X aria-hidden="true" />
          {t("editorForm.cancel")}
        </button>
        <output className="editor-form__message">{message}</output>
      </footer>
    </dialog>
  );
}

/**
 * Props for AddPlaceDialog.
 * @property {[number, number]} [coordinates] - A point the author clicked on the map
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {() => void} onClose - Dismisses the dialog
 * @property {(cityId: string) => void} onPlace - Called with the city to add
 */
interface AddPlaceDialogProps {
  coordinates?: [number, number];
  dataset: DatasetSnapshot;
  onClose: () => void;
  onPlace: (cityId: string) => void;
}
