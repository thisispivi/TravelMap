import "./NewTripDialog.scss";

import { formatLocalDate, toId, TripJson } from "@travelmap/core";
import { Button } from "@travelmap/ui/components/Button/Button";
import { Dialog } from "@travelmap/ui/components/Dialog/Dialog";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { MapPinPlus, Plus, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { idError, tripPath } from "@/data/paths";
import { DatasetSnapshot, saveDocument } from "@/data/store";
import { AddPlaceDialog } from "@/shared/components/AddPlaceDialog/AddPlaceDialog";
import { Combobox } from "@/shared/components/Combobox/Combobox";
import { DatePicker } from "@/shared/components/DatePicker/DatePicker";
import { TextField } from "@/shared/components/Fields/Fields";
import { useToast } from "@/shared/components/Toast/Toast";
import { cityOptions } from "@/shared/lib/placeOptions";

/**
 * NewTripDialog component
 * Creates a trip and opens its workspace. Dates default to today and the id is
 * derived from the title, so the shortest path is a title and one click; both
 * stay editable for the author who wants to decide them.
 * @component
 * @param {NewTripDialogProps} props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {() => void} props.onClose - Dismisses the dialog
 * @returns {ReactNode} The creation dialog
 */
export function NewTripDialog({
  dataset,
  onClose,
}: NewTripDialogProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const now = new Date();
  const today = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const [title, setTitle] = useState("");
  const [customId, setCustomId] = useState("");
  const [sDate, setSDate] = useState(today);
  const [originCityId, setOriginCityId] = useState(
    dataset.config.value.homeCityId ?? dataset.cities[0]?.value.id ?? "",
  );
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [message, setMessage] = useState("");

  const derivedId = title.trim()
    ? `${toId(title).toLowerCase()}-${sDate.slice(0, 4)}`
    : "";
  const id = customId || derivedId;
  const taken = dataset.trips.map(({ value }) => value.id);
  const idProblem = idError(id, taken);
  const problems = [
    ...(title.trim() ? [] : [t("createScreen.titleRequired")]),
    ...(originCityId ? [] : [t("createScreen.originRequired")]),
    ...(idProblem
      ? [t(`idProblem.${idProblem.code}`, { id: idProblem.id })]
      : []),
  ];

  /**
   * Writes the trip and opens its workspace, where the itinerary is built one
   * "travel to" or "stay here" at a time starting from the origin.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleCreate(): Promise<void> {
    if (problems.length > 0) return;
    const trip: TripJson = {
      id,
      title: title.trim(),
      sDate,
      eDate: sDate,
      originCityId,
      steps: [],
    };
    try {
      await saveDocument(tripPath(id), trip);
      showToast(t("toast.tripCreated"));
      onClose();
      await navigate(`/trip/${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("createScreen.createError");
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  }
  return (
    <Dialog
      actions={
        <>
          <Button
            disabled={problems.length > 0}
            onClick={handleCreate}
            variant="primary"
          >
            <Plus aria-hidden="true" />
            {t("createScreen.create")}
          </Button>
          <Button onClick={onClose}>
            <X aria-hidden="true" />
            {t("editorForm.cancel")}
          </Button>
          <output className="editor-form__message">{message}</output>
        </>
      }
      className="new-trip"
      onClose={onClose}
      size="small"
      title={t("createScreen.addA.trip")}
    >
      <TextField
        label={t("createScreen.title")}
        onChange={setTitle}
        placeholder={t("createScreen.tripTitlePlaceholder")}
        value={title}
      />
      <div className="new-trip__row">
        <Combobox
          label={t("createScreen.origin")}
          onChange={setOriginCityId}
          options={cityOptions(dataset)}
          value={originCityId}
        />
        <DatePicker
          label={t("createScreen.startDate")}
          onChange={(next) => setSDate(next ?? today)}
          value={sDate}
          withTime={false}
        />
      </div>
      <Button
        className="new-trip__add-place"
        onClick={() => setIsAddingPlace(true)}
      >
        <MapPinPlus aria-hidden="true" />
        {t("createScreen.originMissing")}
      </Button>
      {isAddingPlace ? (
        <AddPlaceDialog
          dataset={dataset}
          onClose={() => setIsAddingPlace(false)}
          onPlace={setOriginCityId}
          title={t("createScreen.origin")}
        />
      ) : null}
      <TextField
        hint={t("createScreen.tripIdHint")}
        label={t("createScreen.id")}
        onChange={setCustomId}
        placeholder={derivedId || "rome-trip-2026"}
        value={customId || derivedId}
      />
      {title && problems.length > 0 ? (
        <ul className="editor-notice editor-notice--error">
          {problems.map((problem) => (
            <li className="editor-notice__item" key={problem}>
              {problem}
            </li>
          ))}
        </ul>
      ) : null}
    </Dialog>
  );
}

/**
 * Props for NewTripDialog.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {() => void} onClose - Dismisses the dialog
 */
interface NewTripDialogProps {
  dataset: DatasetSnapshot;
  onClose: () => void;
}
