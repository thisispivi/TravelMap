import "./StayCard.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import {
  addDays,
  daysBetween,
  TripLegJson,
  TripStayJson,
} from "@travelmap/core";
import { BedDouble, MapPinPlus, Route, Trash2, X } from "lucide-react";
import { ReactNode } from "react";

import { DatasetSnapshot } from "../../../../data/store";
import { Combobox } from "../../../../shared/components/Combobox/Combobox";
import { useConfirm } from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { DatePicker } from "../../../../shared/components/DatePicker/DatePicker";
import { NumberField } from "../../../../shared/components/Fields/Fields";
import { PhotosField } from "../../../photos/components/PhotosField/PhotosField";
import { cityOptions } from "../../../places/lib/placeOptions";
import { LegEditor } from "../LegEditor/LegEditor";

/**
 * Properties accepted by the StayCard component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {TripStayJson} stay - Where the traveller slept
 * @property {number} firstNight - The trip night the stay starts on
 * @property {{ outing: number; leg: number } | undefined} openLeg - The day-trip ride whose form is open
 * @property {(stay: TripStayJson) => void} onChange - Edit callback
 * @property {() => void} onRemove - Removes the stay
 * @property {() => void} onAddDayTrip - Asks where a new day trip goes
 * @property {(outing: number) => void} onAddPlace - Asks for another place on a day trip
 * @property {(outing: number, leg: number | null) => void} onOpenLeg - Opens or closes a ride's form
 */
interface StayCardProps {
  dataset: DatasetSnapshot;
  stay: TripStayJson;
  firstNight: number;
  openLeg: { outing: number; leg: number } | undefined;
  onChange: (stay: TripStayJson) => void;
  onRemove: () => void;
  onAddDayTrip: () => void;
  onAddPlace: (outing: number) => void;
  onOpenLeg: (outing: number, leg: number | null) => void;
}

/**
 * StayCard component
 * A place slept in, edited the way it is read: which city, which night it
 * started, how many nights, its photos, and the day trips taken from it. The
 * check-out date is worked out from the nights, because "three nights" is
 * what a traveller remembers.
 * @component
 * @param {StayCardProps} props - The card props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {TripStayJson} props.stay - Where the traveller slept
 * @param {number} props.firstNight - The trip night the stay starts on
 * @param {{ outing: number; leg: number } | undefined} props.openLeg - The day-trip ride whose form is open
 * @param {(stay: TripStayJson) => void} props.onChange - Edit callback
 * @param {() => void} props.onRemove - Removes the stay
 * @param {() => void} props.onAddDayTrip - Asks where a new day trip goes
 * @param {(outing: number) => void} props.onAddPlace - Asks for another place on a day trip
 * @param {(outing: number, leg: number | null) => void} props.onOpenLeg - Opens or closes a ride's form
 * @returns {ReactNode} The stay card
 */
export function StayCard({
  dataset,
  stay,
  firstNight,
  openLeg,
  onChange,
  onRemove,
  onAddDayTrip,
  onAddPlace,
  onOpenLeg,
}: StayCardProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const nights = daysBetween(stay.checkIn, stay.checkOut);
  const city =
    dataset.cities.find(({ value }) => value.id === stay.cityId)?.value.name ??
    stay.cityId;
  const outings = stay.outings ?? [];
  const { confirm, confirmDialog } = useConfirm();

  /**
   * Replaces one day trip's chain of rides.
   * @param {number} outing - Position of the day trip
   * @param {TripLegJson[]} legs - The new chain
   * @returns {void}
   */
  const setLegs = (outing: number, legs: TripLegJson[]): void =>
    onChange({
      ...stay,
      outings: legs.length
        ? outings.map((candidate, position) =>
            position === outing ? { ...candidate, legs } : candidate,
          )
        : outings.filter((_unused, position) => position !== outing),
    });

  return (
    <section className="stay-card">
      {confirmDialog}
      <header className="stay-card__header">
        <BedDouble aria-hidden="true" className="stay-card__icon" />
        <div className="stay-card__heading">
          <h3 className="stay-card__title">
            {nights > 0
              ? t("story.sleptIn", { city })
              : t("story.dayIn", { city })}
          </h3>
          <p className="stay-card__nights">
            {nights === 0
              ? t("story.noNights")
              : nights === 1
                ? t("story.night", { from: firstNight })
                : t("story.nights", {
                    from: firstNight,
                    to: firstNight + nights - 1,
                  })}
          </p>
        </div>
        <button
          aria-label={t("story.removeStay", { city })}
          className="editor-button stay-card__remove"
          onClick={() =>
            confirm({
              confirmLabel: t("confirm.removeStay.action"),
              isDanger: true,
              message: t("confirm.removeStay.message"),
              onConfirm: onRemove,
              title: t("confirm.removeStay.title", { city }),
            })
          }
          type="button"
        >
          <Trash2 aria-hidden="true" />
        </button>
      </header>

      <div className="stay-card__fields">
        <Combobox
          label={t("stepFields.city")}
          onChange={(cityId) => onChange({ ...stay, cityId })}
          options={cityOptions(dataset)}
          value={stay.cityId}
        />
        <DatePicker
          label={t("story.checkIn")}
          onChange={(checkIn) =>
            checkIn
              ? onChange({
                  ...stay,
                  checkIn,
                  checkOut: addDays(checkIn, nights),
                })
              : undefined
          }
          value={stay.checkIn}
          withTime={false}
        />
        <NumberField
          hint={t("story.leftOn", { date: stay.checkOut })}
          label={t("story.howManyNights")}
          min={0}
          onChange={(next) =>
            onChange({ ...stay, checkOut: addDays(stay.checkIn, next ?? 0) })
          }
          value={nights}
        />
      </div>
      <PhotosField
        dataset={dataset}
        onChange={(photoPath) => onChange({ ...stay, photoPath })}
        photoPath={stay.photoPath}
        visit={{
          cityId: stay.cityId,
          eDate: stay.checkOut,
          sDate: stay.checkIn,
        }}
      />

      {outings.map((outing, outingIndex) => (
        <div
          className="stay-card__outing"
          key={`${outing.date}-${outingIndex}`}
        >
          <div className="stay-card__outing-header">
            <Route aria-hidden="true" className="stay-card__outing-icon" />
            <span className="stay-card__outing-title">
              {t("story.dayTrip")}
            </span>
            <DatePicker
              label={t("story.dayTripDate")}
              onChange={(date) =>
                date
                  ? onChange({
                      ...stay,
                      outings: outings.map((candidate, position) =>
                        position === outingIndex
                          ? { ...candidate, date }
                          : candidate,
                      ),
                    })
                  : undefined
              }
              value={outing.date}
              withTime={false}
            />
            <button
              aria-label={t("story.removeDayTrip")}
              className="editor-button stay-card__remove"
              onClick={() =>
                confirm({
                  confirmLabel: t("confirm.removeDayTrip.action"),
                  isDanger: true,
                  message: t("confirm.removeDayTrip.message"),
                  onConfirm: () => setLegs(outingIndex, []),
                  title: t("confirm.removeDayTrip.title", {
                    date: outing.date,
                  }),
                })
              }
              type="button"
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <ol className="stay-card__legs">
            {outing.legs.map((leg, legIndex) => (
              <LegEditor
                dataset={dataset}
                date={outing.date}
                fromId={
                  legIndex === 0 ? stay.cityId : outing.legs[legIndex - 1]!.toId
                }
                isDayTrip
                isOpen={Boolean(
                  openLeg?.outing === outingIndex && openLeg.leg === legIndex,
                )}
                isReturn={Boolean(
                  legIndex === outing.legs.length - 1 &&
                  leg.toId === stay.cityId,
                )}
                key={`${leg.toId}-${legIndex}`}
                leg={leg}
                onChange={(next) =>
                  setLegs(
                    outingIndex,
                    outing.legs.map((candidate, position) =>
                      position === legIndex ? next : candidate,
                    ),
                  )
                }
                onRemove={() =>
                  setLegs(
                    outingIndex,
                    outing.legs.filter(
                      (_unused, position) => position !== legIndex,
                    ),
                  )
                }
                onToggle={() =>
                  onOpenLeg(
                    outingIndex,
                    openLeg?.outing === outingIndex && openLeg.leg === legIndex
                      ? null
                      : legIndex,
                  )
                }
              />
            ))}
          </ol>
          <button
            className="editor-button stay-card__add"
            onClick={() => onAddPlace(outingIndex)}
            type="button"
          >
            <MapPinPlus aria-hidden="true" />
            {t("story.addPlaceToDayTrip")}
          </button>
        </div>
      ))}

      <button
        className="editor-button stay-card__add"
        onClick={onAddDayTrip}
        type="button"
      >
        <Route aria-hidden="true" />
        {t("story.addDayTrip", { city })}
      </button>
    </section>
  );
}
