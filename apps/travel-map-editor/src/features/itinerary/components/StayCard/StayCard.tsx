import "./StayCard.scss";

import { CountryFlag } from "@app/shared/components/CountryFlag/CountryFlag";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import {
  addDays,
  daysBetween,
  TripLegJson,
  TripStayJson,
} from "@travelmap/core";
import { MapPinPlus, Route, Trash2, X } from "lucide-react";
import { ReactNode } from "react";

import { DatasetSnapshot } from "../../../../data/store";
import { Combobox } from "../../../../shared/components/Combobox/Combobox";
import { useConfirm } from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { DatePicker } from "../../../../shared/components/DatePicker/DatePicker";
import { NumberField } from "../../../../shared/components/Fields/Fields";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { PhotosField } from "../../../photos/components/PhotosField/PhotosField";
import { cityOptions } from "../../../places/lib/placeOptions";
import { formatStoryDays } from "../../lib/storyDates";
import { LegEditor } from "../LegEditor/LegEditor";
import { StoryChapter } from "../StoryChapter/StoryChapter";

/**
 * Properties accepted by the StayCard component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {TripStayJson} stay - Where the traveller slept
 * @property {number} number - The chapter number shown in its badge
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
  number: number;
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
 * @param {number} props.number - The chapter number shown in its badge
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
  number,
  openLeg,
  onChange,
  onRemove,
  onAddDayTrip,
  onAddPlace,
  onOpenLeg,
}: StayCardProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["editor"]);
  const nights = daysBetween(stay.checkIn, stay.checkOut);
  const cityJson = dataset.cities.find(
    ({ value }) => value.id === stay.cityId,
  )?.value;
  const city = cityJson?.name ?? stay.cityId;
  const color = dataset.countries.find(
    ({ value }) => value.id === cityJson?.countryId,
  )?.value.color;
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
    <StoryChapter
      action={
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
      }
      color={color ? `hsl(${color.h} ${color.s}% ${color.l}%)` : undefined}
      eyebrow={`${t("story.nightsCount", { count: nights })} · ${formatStoryDays(stay.checkIn, stay.checkOut, lang)}`}
      kind="stay"
      number={number}
      title={
        <>
          {city}
          {cityJson ? (
            <CountryFlag
              className="stay-card__flag"
              countryId={cityJson.countryId}
              src={findWorldCountry(cityJson.countryId)?.flagUrl}
            />
          ) : null}
        </>
      }
    >
      {confirmDialog}
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
            <span className="stay-card__outing-title">
              {formatStoryDays(outing.date, outing.date, lang)} ·{" "}
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
    </StoryChapter>
  );
}
