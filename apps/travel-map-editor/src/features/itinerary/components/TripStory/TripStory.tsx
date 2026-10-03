import "./TripStory.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { daysBetween, TripJson, TripMoveJson } from "@travelmap/core";
import {
  BedDouble,
  Flag,
  House,
  MapPinPlus,
  Navigation,
  Trash2,
} from "lucide-react";
import { ReactNode, useState } from "react";

import { DatasetSnapshot } from "../../../../data/store";
import { Combobox } from "../../../../shared/components/Combobox/Combobox";
import { useConfirm } from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { DatePicker } from "../../../../shared/components/DatePicker/DatePicker";
import {
  NumberField,
  TextField,
} from "../../../../shared/components/Fields/Fields";
import { LocalizedNames } from "../../../../shared/components/LocalizedNames/LocalizedNames";
import { cityOptions } from "../../../places/lib/placeOptions";
import { Selection } from "../../../workspace/Workspace.state";
import {
  chainOrigins,
  currentCityId,
  PlaceRequest,
  removeLeg,
  removeStep,
  replaceStep,
  stayHere,
  updateLeg,
} from "../../lib/itinerary";
import { LegEditor } from "../LegEditor/LegEditor";
import { StayCard } from "../StayCard/StayCard";

/**
 * Properties accepted by the TripDetails component.
 * @property {TripJson} trip - The trip being edited
 * @property {(next: TripJson, isMergeable?: boolean) => void} onChange - Edit callback
 */
interface TripDetailsProps {
  trip: TripJson;
  onChange: (next: TripJson, isMergeable?: boolean) => void;
}

/**
 * TripDetails component
 * The trip's own fields — name, translations, cover — kept folded away,
 * because they are typed once while the itinerary below is edited often.
 * @component
 * @param {TripDetailsProps} props - The details props
 * @param {TripJson} props.trip - The trip being edited
 * @param {(next: TripJson, isMergeable?: boolean) => void} props.onChange - Edit callback
 * @returns {ReactNode} The folded trip details
 */
function TripDetails({ trip, onChange }: TripDetailsProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <details className="trip-story__details">
      <summary className="trip-story__details-summary">
        {t("story.tripDetails")}
      </summary>
      <div className="trip-story__details-body">
        <LocalizedNames
          canonicalHint={t("trip.canonicalHint")}
          label={t("trip.titles")}
          onChange={({ name, nameByLocale }) =>
            onChange(
              { ...trip, title: name, titleByLocale: nameByLocale },
              true,
            )
          }
          value={{ name: trip.title, nameByLocale: trip.titleByLocale }}
        />
        <DatePicker
          hint={t("story.endHint")}
          label={t("trip.end")}
          onChange={(eDate) =>
            eDate ? onChange({ ...trip, eDate }) : undefined
          }
          value={trip.eDate}
          withTime={false}
        />
        <TextField
          hint={t("trip.coverImageHint")}
          label={t("trip.coverImage")}
          onChange={(coverImage) =>
            onChange({ ...trip, coverImage: coverImage || undefined }, true)
          }
          placeholder="/Trips/my-trip-2026.jpg"
          value={trip.coverImage ?? ""}
        />
        {trip.mapFocus ? (
          <button
            className="editor-button"
            onClick={() => onChange({ ...trip, mapFocus: undefined })}
            type="button"
          >
            {t("story.clearMapFocus")}
          </button>
        ) : null}
      </div>
    </details>
  );
}

/**
 * Properties accepted by the MoveCard component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {TripJson} trip - The trip being edited
 * @property {number} index - Position of the journey
 * @property {TripMoveJson} move - The journey
 * @property {number | undefined} openLeg - The ride whose form is open
 * @property {(leg: number | null) => void} onOpenLeg - Opens or closes a ride's form
 * @property {(next: TripJson) => void} onChange - Edit callback
 * @property {() => void} onAddStop - Asks for another place on this journey
 */
interface MoveCardProps {
  dataset: DatasetSnapshot;
  trip: TripJson;
  index: number;
  move: TripMoveJson;
  openLeg: number | undefined;
  onOpenLeg: (leg: number | null) => void;
  onChange: (next: TripJson) => void;
  onAddStop: () => void;
}

/**
 * MoveCard component
 * Getting from one bed to the next: one line per ride, with changes and
 * places seen along the way as further rides rather than separate stops.
 * @component
 * @param {MoveCardProps} props - The card props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {TripJson} props.trip - The trip being edited
 * @param {number} props.index - Position of the journey
 * @param {TripMoveJson} props.move - The journey
 * @param {number | undefined} props.openLeg - The ride whose form is open
 * @param {(leg: number | null) => void} props.onOpenLeg - Opens or closes a ride's form
 * @param {(next: TripJson) => void} props.onChange - Edit callback
 * @param {() => void} props.onAddStop - Asks for another place on this journey
 * @returns {ReactNode} The journey card
 */
function MoveCard({
  dataset,
  trip,
  index,
  move,
  openLeg,
  onOpenLeg,
  onChange,
  onAddStop,
}: MoveCardProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const origins = chainOrigins(trip, { index });
  const { confirm, confirmDialog } = useConfirm();
  const previous = trip.steps[index - 1];
  const date =
    move.legs[0]?.depart?.slice(0, 10) ??
    (previous?.type === "stay" ? previous.checkOut : trip.sDate.slice(0, 10));

  return (
    <section className="trip-story__move">
      {confirmDialog}
      <header className="trip-story__move-header">
        <Navigation aria-hidden="true" className="trip-story__move-icon" />
        <span className="trip-story__move-title">{t("story.travel")}</span>
        <button
          aria-label={t("story.removeJourney")}
          className="editor-button trip-story__remove"
          onClick={() =>
            confirm({
              confirmLabel: t("confirm.removeJourney.action"),
              isDanger: true,
              message: t("confirm.removeJourney.message"),
              onConfirm: () => onChange(removeStep(trip, index)),
              title: t("confirm.removeJourney.title"),
            })
          }
          type="button"
        >
          <Trash2 aria-hidden="true" />
        </button>
      </header>
      <ol className="trip-story__legs">
        {move.legs.map((leg, legIndex) => (
          <LegEditor
            dataset={dataset}
            date={(leg.arrive ?? leg.depart ?? date).slice(0, 10)}
            fromId={origins[legIndex] ?? trip.originCityId}
            isDayTrip={false}
            isOpen={openLeg === legIndex}
            isReturn={false}
            key={`${leg.toId}-${legIndex}`}
            leg={leg}
            onChange={(next) =>
              onChange(updateLeg(trip, { index, leg: legIndex }, next))
            }
            onRemove={() => onChange(removeLeg(trip, { index, leg: legIndex }))}
            onToggle={() => onOpenLeg(openLeg === legIndex ? null : legIndex)}
          />
        ))}
      </ol>
      <button
        className="editor-button trip-story__add"
        onClick={onAddStop}
        type="button"
      >
        <MapPinPlus aria-hidden="true" />
        {t("story.addStopOnTheWay")}
      </button>
    </section>
  );
}

/**
 * Properties accepted by the NextStep component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {TripJson} trip - The trip being edited
 * @property {(next: TripJson) => void} onChange - Edit callback
 * @property {(request: PlaceRequest) => void} onRequestPlace - Asks the author for a place
 * @property {() => void} onReturnHome - Ends the trip back at its origin
 */
interface NextStepProps {
  dataset: DatasetSnapshot;
  trip: TripJson;
  onChange: (next: TripJson) => void;
  onRequestPlace: (request: PlaceRequest) => void;
  onReturnHome: () => void;
}

/**
 * NextStep component
 * The one question the author answers to build a trip: what happened next?
 * After arriving somewhere they either slept there or kept travelling; after
 * a stay they travelled on or went home. Only the choices that make sense are
 * offered, so the trip cannot be built in an order that does not read.
 * @component
 * @param {NextStepProps} props - The panel props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {TripJson} props.trip - The trip being edited
 * @param {(next: TripJson) => void} props.onChange - Edit callback
 * @param {(request: PlaceRequest) => void} props.onRequestPlace - Asks the author for a place
 * @param {() => void} props.onReturnHome - Ends the trip back at its origin
 * @returns {ReactNode} The next-step panel
 */
function NextStep({
  dataset,
  trip,
  onChange,
  onRequestPlace,
  onReturnHome,
}: NextStepProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [nights, setNights] = useState<number | undefined>(1);
  const last = trip.steps.at(-1);
  const hereId = currentCityId(trip);
  const here =
    dataset.cities.find(({ value }) => value.id === hereId)?.value.name ??
    hereId;
  const isHome = hereId === trip.originCityId && trip.steps.length > 0;

  return (
    <section className="trip-story__next">
      <h3 className="trip-story__next-title">
        {isHome
          ? t("story.backHome", { city: here })
          : t("story.whatNext", { city: here })}
      </h3>
      <div className="trip-story__next-actions">
        {last?.type === "move" && !isHome ? (
          <div className="trip-story__stay-here">
            <NumberField
              label={t("story.howManyNights")}
              min={0}
              onChange={setNights}
              value={nights}
            />
            <button
              className="editor-button editor-button--primary"
              onClick={() => onChange(stayHere(trip, nights ?? 0))}
              type="button"
            >
              <BedDouble aria-hidden="true" />
              {t("story.sleepHere", { city: here })}
            </button>
          </div>
        ) : null}
        <button
          className="editor-button editor-button--primary"
          onClick={() => onRequestPlace({ kind: "travel" })}
          type="button"
        >
          <Navigation aria-hidden="true" />
          {last?.type === "move"
            ? t("story.travelOn", { city: here })
            : t("story.travelTo", { city: here })}
        </button>
        {trip.steps.length > 0 && !isHome ? (
          <button
            className="editor-button"
            onClick={onReturnHome}
            type="button"
          >
            <House aria-hidden="true" />
            {t("story.returnHome")}
          </button>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Properties accepted by the TripStory component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {TripJson} trip - The trip being edited
 * @property {Selection} selection - What is selected
 * @property {(selection: Selection) => void} onSelect - Selection callback
 * @property {(next: TripJson, isMergeable?: boolean) => void} onChange - Edit callback
 * @property {(request: PlaceRequest) => void} onRequestPlace - Asks the author for a place
 * @property {() => void} onReturnHome - Ends the trip back at its origin
 */
interface TripStoryProps {
  dataset: DatasetSnapshot;
  trip: TripJson;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onChange: (next: TripJson, isMergeable?: boolean) => void;
  onRequestPlace: (request: PlaceRequest) => void;
  onReturnHome: () => void;
}

/**
 * TripStory component
 * The trip edited in the same shape the public page shows it: where it
 * started, each journey, each place slept with its day trips, and a single
 * "what happened next?" question at the end. Building a trip is answering that
 * question until the answer is "went home".
 * @component
 * @param {TripStoryProps} props - The story props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {TripJson} props.trip - The trip being edited
 * @param {Selection} props.selection - What is selected
 * @param {(selection: Selection) => void} props.onSelect - Selection callback
 * @param {(next: TripJson, isMergeable?: boolean) => void} props.onChange - Edit callback
 * @param {(request: PlaceRequest) => void} props.onRequestPlace - Asks the author for a place
 * @param {() => void} props.onReturnHome - Ends the trip back at its origin
 * @returns {ReactNode} The editable trip story
 */
export function TripStory({
  dataset,
  trip,
  selection,
  onSelect,
  onChange,
  onRequestPlace,
  onReturnHome,
}: TripStoryProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const selected = selection.kind === "step" ? selection : undefined;

  /**
   * Opens one ride's form, or closes it, by moving the selection.
   * @param {number} index - Position of the step
   * @param {number | undefined} outing - Position of the day trip
   * @param {number | null} leg - The ride, or null to close
   * @returns {void}
   */
  const openLeg = (
    index: number,
    outing: number | undefined,
    leg: number | null,
  ): void =>
    onSelect(
      leg === null
        ? { index, kind: "step" }
        : {
            index,
            kind: "step",
            leg,
            ...(outing === undefined ? {} : { outing }),
          },
    );

  return (
    <div className="trip-story">
      <TripDetails onChange={onChange} trip={trip} />

      <section className="trip-story__start">
        <Flag aria-hidden="true" className="trip-story__move-icon" />
        <Combobox
          label={t("story.startedIn")}
          onChange={(originCityId) => onChange({ ...trip, originCityId })}
          options={cityOptions(dataset)}
          value={trip.originCityId}
        />
        <DatePicker
          label={t("story.startedOn")}
          onChange={(sDate) =>
            sDate ? onChange({ ...trip, sDate }) : undefined
          }
          value={trip.sDate}
          withTime={false}
        />
      </section>

      {trip.steps.map((step, index) =>
        step.type === "stay" ? (
          <StayCard
            dataset={dataset}
            firstNight={daysBetween(trip.sDate, step.checkIn) + 1}
            key={`stay-${step.cityId}-${step.checkIn}-${index}`}
            onAddDayTrip={() => onRequestPlace({ index, kind: "dayTrip" })}
            onAddPlace={(outing) =>
              onRequestPlace({ index, kind: "addToChain", outing })
            }
            onChange={(next) => onChange(replaceStep(trip, index, next))}
            onOpenLeg={(outing, leg) => openLeg(index, outing, leg)}
            onRemove={() => onChange(removeStep(trip, index))}
            openLeg={
              selected?.index === index &&
              selected.outing !== undefined &&
              selected.leg !== undefined
                ? { leg: selected.leg, outing: selected.outing }
                : undefined
            }
            stay={step}
          />
        ) : (
          <MoveCard
            dataset={dataset}
            index={index}
            key={`move-${step.legs[0]?.toId}-${index}`}
            move={step}
            onAddStop={() => onRequestPlace({ index, kind: "addToChain" })}
            onChange={onChange}
            onOpenLeg={(leg) => openLeg(index, undefined, leg)}
            openLeg={
              selected?.index === index && selected.outing === undefined
                ? selected.leg
                : undefined
            }
            trip={trip}
          />
        ),
      )}

      <NextStep
        dataset={dataset}
        onChange={onChange}
        onRequestPlace={onRequestPlace}
        onReturnHome={onReturnHome}
        trip={trip}
      />
    </div>
  );
}
