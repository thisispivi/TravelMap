import { TripJson } from "@travelmap/core";

/**
 * One day of an itinerary, or the bucket for steps that have no date yet.
 * @property {string | null} date - The local date, null when unscheduled
 * @property {number[]} indexes - Positions of the steps that fall on this day
 */
export interface ItineraryDay {
  date: string | null;
  indexes: number[];
}

/**
 * Reads the day a step belongs to. A leg without its own dates belongs to the
 * day it departs, which is the day of the stop before it.
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @param {number} index - Position of the step
 * @returns {string | null} The day key, null when nothing dates the step
 */
function dayOf(steps: TripJson["steps"], index: number): string | null {
  const step = steps[index];
  if (!step) return null;
  if (step.type === "stop") return step.sDate ? step.sDate.slice(0, 10) : null;
  if (step.sDate) return step.sDate.slice(0, 10);

  for (let position = index - 1; position >= 0; position -= 1) {
    const previous = steps[position];
    if (previous?.type === "stop" && previous.eDate)
      return previous.eDate.slice(0, 10);
  }
  return null;
}

/**
 * Groups an itinerary into days without reordering it.
 * Grouping is consecutive rather than sorted, because the authored order is
 * the trip's truth: a rail that silently resequenced steps would hide exactly
 * the ordering mistakes the day headings exist to reveal.
 * @param {TripJson["steps"]} steps - Ordered itinerary steps
 * @returns {ItineraryDay[]} Days in itinerary order, unscheduled steps last
 */
export function groupByDay(steps: TripJson["steps"]): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const unscheduled: number[] = [];

  steps.forEach((_step, index) => {
    const date = dayOf(steps, index);
    if (date === null) {
      unscheduled.push(index);
      return;
    }
    const current = days.at(-1);
    if (current?.date === date) current.indexes.push(index);
    else days.push({ date, indexes: [index] });
  });

  return unscheduled.length > 0
    ? [...days, { date: null, indexes: unscheduled }]
    : days;
}

/**
 * Numbers a day within its trip, so a heading can read "Day 3" without the
 * component recomputing the offset.
 * @param {ItineraryDay[]} days - Days in itinerary order
 * @param {ItineraryDay} day - The day being numbered
 * @returns {number | null} The one-based day number, null when unscheduled
 */
export function dayNumber(
  days: ItineraryDay[],
  day: ItineraryDay,
): number | null {
  if (day.date === null) return null;
  return days.filter((entry) => entry.date !== null).indexOf(day) + 1;
}
