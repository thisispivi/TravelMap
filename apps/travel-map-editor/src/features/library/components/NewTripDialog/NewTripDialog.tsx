import "./NewTripDialog.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { formatLocalDate, TripJson } from "@travelmap/core";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { idError, toId, tripPath } from "../../../../data/paths";
import { DatasetSnapshot, saveDocument } from "../../../../data/store";
import { DatePicker } from "../../../../shared/components/DatePicker/DatePicker";
import { TextField } from "../../../../shared/components/Fields/Fields";

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
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const now = new Date();
  const today = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const [title, setTitle] = useState("");
  const [customId, setCustomId] = useState("");
  const [sDate, setSDate] = useState(today);
  const [eDate, setEDate] = useState(today);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const derivedId = title.trim()
    ? `${toId(title).toLowerCase()}-${sDate.slice(0, 4)}`
    : "";
  const id = customId || derivedId;
  const taken = dataset.trips.map(({ value }) => value.id);
  const problems = [
    ...(title.trim() ? [] : [t("createScreen.titleRequired")]),
    ...(sDate && eDate && eDate < sDate
      ? [t("createScreen.endBeforeStart")]
      : []),
    ...(idError(id, taken) ? [idError(id, taken)!] : []),
  ];

  /**
   * Writes the trip and opens its workspace. The trip starts with no stops and
   * no origin city, which the itinerary fills in as soon as one is added.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleCreate(): Promise<void> {
    if (problems.length > 0) return;
    const trip: TripJson = {
      id,
      title: title.trim(),
      sDate,
      eDate,
      originCityId: dataset.cities[0]?.value.id ?? "",
      returnCityId: dataset.cities[0]?.value.id ?? "",
      steps: [],
    };
    try {
      await saveDocument(tripPath(id), trip);
      onClose();
      await navigate(`/trip/${id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("createScreen.createError"),
      );
    }
  }
  return (
    <dialog
      aria-label={t("createScreen.addA.trip")}
      className="new-trip"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <h2 className="new-trip__title">{t("createScreen.addA.trip")}</h2>
      <TextField
        label={t("createScreen.title")}
        onChange={setTitle}
        placeholder="Rome Trip"
        value={title}
      />
      <div className="new-trip__row">
        <DatePicker
          label={t("trip.start")}
          onChange={(next) => setSDate(next ?? today)}
          value={sDate}
          withTime={false}
        />
        <DatePicker
          label={t("trip.end")}
          onChange={(next) => setEDate(next ?? today)}
          value={eDate}
          withTime={false}
        />
      </div>
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
      <footer className="new-trip__actions">
        <button
          className="editor-button editor-button--primary"
          disabled={problems.length > 0}
          onClick={handleCreate}
          type="button"
        >
          {t("createScreen.create")}
        </button>
        <button className="editor-button" onClick={onClose} type="button">
          {t("editorForm.cancel")}
        </button>
        <output className="editor-form__message">{message}</output>
      </footer>
    </dialog>
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
