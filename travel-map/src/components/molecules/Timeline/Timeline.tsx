import "./Timeline.scss";

import { JSX, useMemo } from "react";

import { City, TransportMode, TripStop } from "@/core";
import {
  TRIP_DETAIL_FERRY_COMPANY_NAMES,
  TRIP_DETAIL_FLIGHT_COMPANY_NAMES,
  TripDetailTimelineItem,
} from "@/utils/tripDetailTimeline";

import { TimelineDayTripCard } from "./TimelineDayTripCard";
import { TimelineOriginNode } from "./TimelineOriginNode";
import { TimelineStayCard } from "./TimelineStayCard";
import { ExcursionItem, TimelineStayGroup } from "./TimelineStayGroup";
import {
  TimelineTransportConnector,
  TransportLeg,
} from "./TimelineTransportConnector";

interface TimelineProps {
  items: TripDetailTimelineItem[];
  showYear: boolean;
}

type IntermediateOrigin = { type: "origin"; city: City };
type IntermediateReturn = { type: "return"; city: City };
type IntermediateTransport = { type: "transport"; legs: TransportLeg[] };
type IntermediateStay = {
  type: "stay";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
};
type IntermediateDayTrip = {
  type: "day-trip";
  city: City;
  stop: TripStop;
  travelIdx: number;
  isNested: boolean;
  parentCity: City | null;
};

type IntermediateItem =
  | IntermediateOrigin
  | IntermediateReturn
  | IntermediateTransport
  | IntermediateStay
  | IntermediateDayTrip;

type SegmentOrigin = { type: "origin"; city: City; key: string };
type SegmentReturn = { type: "return"; city: City; key: string };
type SegmentTransport = {
  type: "transport";
  legs: TransportLeg[];
  key: string;
};
type SegmentDayTrip = {
  type: "day-trip";
  city: City;
  stop: TripStop;
  travelIdx: number;
  isNested: boolean;
  key: string;
  inboundTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    fromCity: City;
    isRoundTrip?: boolean;
  };
  returnTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    toCity: City;
  };
  chainBreakBefore: boolean;
};

type SegmentStay = {
  type: "stay";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
  key: string;
};
type SegmentStayGroup = {
  type: "stay-group";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
  excursions: ExcursionItem[];
  key: string;
};

type DisplaySegment =
  | SegmentOrigin
  | SegmentReturn
  | SegmentTransport
  | SegmentStay
  | SegmentStayGroup
  | SegmentDayTrip;

function collapseTransportChains(
  items: TripDetailTimelineItem[],
): IntermediateItem[] {
  const result: IntermediateItem[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];

    if (item.kind === "transport") {
      const legs: TransportLeg[] = [];

      while (i < items.length && items[i].kind === "transport") {
        const leg = items[i] as Extract<
          TripDetailTimelineItem,
          { kind: "transport" }
        >;
        const info =
          leg.flightInfo ??
          leg.ferryInfo ??
          leg.busInfo ??
          leg.trainInfo ??
          leg.carInfo;
        const company = leg.flightInfo
          ? TRIP_DETAIL_FLIGHT_COMPANY_NAMES[leg.flightInfo.company]
          : leg.ferryInfo
            ? TRIP_DETAIL_FERRY_COMPANY_NAMES[leg.ferryInfo.company]
            : undefined;

        legs.push({
          mode: leg.mode,
          from: leg.from,
          to: leg.to,
          company,
          distanceKm: info?.distanceKm ?? 0,
          durationMinutes: info?.durationMinutes ?? 0,
          via: leg.ferryInfo?.via,
          isRoundTrip: leg.isRoundTrip,
        });
        i++;

        const peek = items[i];
        if (
          peek?.kind === "base-stop" &&
          (peek as Extract<TripDetailTimelineItem, { kind: "base-stop" }>)
            .isLayover
        ) {
          i++;
        } else {
          break;
        }
      }

      result.push({ type: "transport", legs });
    } else if (item.kind === "base-stop") {
      if (!item.isLayover) {
        result.push({
          type: "stay",
          city: item.city,
          stop: item.stop,
          nights: item.nights,
          travelIdx: item.travelIdx,
        });
      }
      i++;
    } else if (item.kind === "day-trip") {
      result.push({
        type: "day-trip",
        city: item.city,
        stop: item.stop,
        travelIdx: item.travelIdx,
        isNested: item.isNested,
        parentCity: item.parentCity,
      });
      i++;
    } else if (item.kind === "origin") {
      result.push({ type: "origin", city: item.city });
      i++;
    } else if (item.kind === "return") {
      result.push({ type: "return", city: item.city });
      i++;
    } else {
      i++;
    }
  }

  return result;
}

function buildDisplaySegments(
  items: TripDetailTimelineItem[],
): DisplaySegment[] {
  const intermediate = collapseTransportChains(items);
  const raw: (
    | SegmentOrigin
    | SegmentReturn
    | SegmentTransport
    | SegmentStay
    | SegmentDayTrip
  )[] = [];
  let pendingDayTripTransport: SegmentDayTrip["inboundTransport"];

  let pendingDayTripTransportFrom: City | null = null;

  for (let i = 0; i < intermediate.length; i++) {
    const item = intermediate[i];

    if (item.type === "transport") {
      const prev = i > 0 ? intermediate[i - 1] : null;
      if (prev?.type === "day-trip" && prev.parentCity) {
        const finalDest = item.legs[item.legs.length - 1].to;
        if (finalDest.name === prev.parentCity.name) {
          const lastRaw = raw[raw.length - 1];
          if (lastRaw?.type === "day-trip") {
            const legs = item.legs;
            (lastRaw as SegmentDayTrip).returnTransport = {
              mode: legs[0].mode,
              distanceKm: legs.reduce((s, l) => s + l.distanceKm, 0),
              durationMinutes: legs.reduce((s, l) => s + l.durationMinutes, 0),
              toCity: legs[legs.length - 1].to,
            };
          }
          continue;
        }
      }

      const next = i + 1 < intermediate.length ? intermediate[i + 1] : null;
      const leadsToNestedDayTrip =
        next?.type === "day-trip" && (next as IntermediateDayTrip).isNested;
      if (leadsToNestedDayTrip) {
        const lastLeg = item.legs[item.legs.length - 1];
        if (
          lastLeg.mode === "car" ||
          lastLeg.mode === "bus" ||
          lastLeg.mode === "train"
        ) {
          pendingDayTripTransport = {
            mode: lastLeg.mode,
            distanceKm: lastLeg.distanceKm,
            durationMinutes: lastLeg.durationMinutes,
            fromCity: lastLeg.from,
            isRoundTrip: lastLeg.isRoundTrip,
          };
          pendingDayTripTransportFrom = lastLeg.from;
          continue;
        }
      }

      pendingDayTripTransportFrom = null;
      raw.push({ type: "transport", legs: item.legs, key: `transport-${i}` });
    } else if (item.type === "stay") {
      pendingDayTripTransport = undefined;
      pendingDayTripTransportFrom = null;
      raw.push({
        type: "stay",
        city: item.city,
        stop: item.stop,
        nights: item.nights,
        travelIdx: item.travelIdx,
        key: `stay-${item.city.name}-${item.travelIdx}`,
      });
    } else if (item.type === "day-trip") {
      const isNested = (item as IntermediateDayTrip).isNested;
      const parentCity = (item as IntermediateDayTrip).parentCity;
      const inboundTransport = isNested ? pendingDayTripTransport : undefined;

      const chainBreakBefore =
        !pendingDayTripTransportFrom ||
        !parentCity ||
        pendingDayTripTransportFrom.name === parentCity.name;

      pendingDayTripTransport = undefined;
      pendingDayTripTransportFrom = null;
      raw.push({
        type: "day-trip",
        city: item.city,
        stop: item.stop,
        travelIdx: item.travelIdx,
        isNested,
        key: `day-trip-${item.city.name}-${item.travelIdx}`,
        inboundTransport,
        chainBreakBefore,
      });
    } else if (item.type === "origin") {
      pendingDayTripTransportFrom = null;
      raw.push({ type: "origin", city: item.city, key: "origin" });
    } else if (item.type === "return") {
      raw.push({ type: "return", city: item.city, key: "return" });
    }
  }

  const merged: DisplaySegment[] = [];
  let j = 0;
  while (j < raw.length) {
    const seg = raw[j];
    if (seg.type === "stay") {
      const excursions: ExcursionItem[] = [];
      let k = j + 1;
      while (
        k < raw.length &&
        raw[k].type === "day-trip" &&
        (raw[k] as SegmentDayTrip).isNested
      ) {
        const exc = raw[k] as SegmentDayTrip;
        excursions.push({
          city: exc.city,
          travelIdx: exc.travelIdx,
          stop: exc.stop,
          key: exc.key,
          inboundTransport: exc.inboundTransport,
          returnTransport: exc.returnTransport,
          chainBreakBefore: exc.chainBreakBefore,
        });
        k++;
      }

      let forwardExitExc: ExcursionItem | null = null;
      const nextRaw = k < raw.length ? raw[k] : null;
      if (nextRaw?.type === "transport" && excursions.length > 0) {
        const firstLegFrom = (nextRaw as SegmentTransport).legs[0]?.from;
        const lastExc = excursions[excursions.length - 1];
        if (firstLegFrom && firstLegFrom.name === lastExc.city.name) {
          forwardExitExc = excursions.pop()!;
        }
      }

      if (excursions.length > 0) {
        merged.push({
          type: "stay-group",
          city: seg.city,
          stop: seg.stop,
          nights: seg.nights,
          travelIdx: seg.travelIdx,
          excursions,
          key: seg.key,
        });
      } else {
        merged.push({
          type: "stay",
          city: seg.city,
          stop: seg.stop,
          nights: seg.nights,
          travelIdx: seg.travelIdx,
          key: seg.key,
        });
      }
      j = k;

      if (forwardExitExc) {
        const tp = forwardExitExc.inboundTransport;
        if (tp) {
          merged.push({
            type: "transport",
            legs: [
              {
                mode: tp.mode,
                from: tp.fromCity,
                to: forwardExitExc.city,
                distanceKm: tp.distanceKm,
                durationMinutes: tp.durationMinutes,
              },
            ],
            key: `transport-promoted-${forwardExitExc.key}`,
          });
        }
        merged.push({
          type: "day-trip",
          city: forwardExitExc.city,
          stop: forwardExitExc.stop,
          travelIdx: forwardExitExc.travelIdx,
          isNested: false,
          key: `promoted-${forwardExitExc.key}`,
          inboundTransport: undefined,
          chainBreakBefore: true,
        });
      }
    } else {
      merged.push(seg);
      j++;
    }
  }

  return merged;
}

export function Timeline({ items, showYear }: TimelineProps): JSX.Element {
  const segments = useMemo(() => buildDisplaySegments(items), [items]);

  return (
    <div className="trip-detail__timeline">
      {segments.map((seg, idx) => {
        const animDelay = 0.08 + idx * 0.03;

        if (seg.type === "origin" || seg.type === "return") {
          return (
            <TimelineOriginNode
              animDelay={animDelay}
              city={seg.city}
              key={seg.key}
            />
          );
        }

        if (seg.type === "transport") {
          return (
            <TimelineTransportConnector
              animDelay={animDelay}
              key={seg.key}
              legs={seg.legs}
            />
          );
        }

        if (seg.type === "stay") {
          return (
            <TimelineStayCard
              animDelay={animDelay}
              city={seg.city}
              key={seg.key}
              nights={seg.nights}
              showYear={showYear}
              stop={seg.stop}
              travelIdx={seg.travelIdx}
            />
          );
        }

        if (seg.type === "stay-group") {
          return (
            <TimelineStayGroup
              animDelay={animDelay}
              city={seg.city}
              excursions={seg.excursions}
              key={seg.key}
              nights={seg.nights}
              showYear={showYear}
              stop={seg.stop}
              travelIdx={seg.travelIdx}
            />
          );
        }

        if (seg.type === "day-trip") {
          return (
            <TimelineDayTripCard
              animDelay={animDelay}
              city={seg.city}
              inboundTransport={seg.inboundTransport}
              isNested={seg.isNested}
              key={seg.key}
              showYear={showYear}
              stop={seg.stop}
              travelIdx={seg.travelIdx}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
