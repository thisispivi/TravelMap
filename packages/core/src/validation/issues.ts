import type { TripJson } from "../schema";

/** How badly an authoring problem affects the published site. */
export type IssueSeverity = "blocking" | "warning" | "suggestion";

/**
 * What an issue is about, so an editor can select the subject across its panes
 * instead of leaving the reader to find it. Kept as a serializable union so an
 * issue can travel through a URL or a CI report unchanged.
 */
export type IssueSubject =
  | { kind: "trip"; tripId: string }
  | { kind: "step"; tripId: string; index: number }
  | { kind: "city"; cityId: string }
  | { kind: "country"; countryId: string }
  | { kind: "config" };

/**
 * A concrete, reversible repair for an issue.
 * @property {string} label - Short imperative describing the repair
 * @property {(trip: TripJson) => TripJson} apply - Returns a repaired copy
 */
export interface IssueFix {
  label: string;
  apply: (trip: TripJson) => TripJson;
}

/**
 * One authoring problem, expressed once and rendered in several places.
 * `code` and `params` are the canonical form so a host can translate; `message`
 * carries plain English for hosts without translations, such as a CI check.
 * @property {string} code - Stable identifier, also the translation key suffix
 * @property {IssueSeverity} severity - How badly the problem affects the site
 * @property {IssueSubject} subject - What the issue is about
 * @property {string} path - Dataset-relative path of the offending document
 * @property {string} message - Untranslated fallback description
 * @property {Record<string, string | number>} [params] - Translation parameters
 * @property {IssueFix} [fix] - An available repair
 */
export interface Issue {
  code: string;
  severity: IssueSeverity;
  subject: IssueSubject;
  path: string;
  message: string;
  params?: Record<string, string | number>;
  fix?: IssueFix;
}

/**
 * Reports whether any issue would stop the public app from building.
 * @param {Issue[]} issues - Issues to inspect
 * @returns {boolean} Whether at least one issue is blocking
 */
export function hasBlockingIssue(issues: Issue[]): boolean {
  return issues.some((issue) => issue.severity === "blocking");
}

/**
 * Counts issues per severity so a summary can be rendered without regrouping.
 * @param {Issue[]} issues - Issues to count
 * @returns {Record<IssueSeverity, number>} Count for every severity
 */
export function countBySeverity(
  issues: Issue[],
): Record<IssueSeverity, number> {
  return issues.reduce<Record<IssueSeverity, number>>(
    (counts, issue) => ({
      ...counts,
      [issue.severity]: counts[issue.severity] + 1,
    }),
    { blocking: 0, suggestion: 0, warning: 0 },
  );
}

/**
 * Reports whether two subjects point at the same thing, so a selection can be
 * compared without the caller reaching into the union's shape.
 * @param {IssueSubject | null} first - First subject
 * @param {IssueSubject | null} second - Second subject
 * @returns {boolean} Whether both subjects are equivalent
 */
export function isSameSubject(
  first: IssueSubject | null,
  second: IssueSubject | null,
): boolean {
  if (!first || !second || first.kind !== second.kind) return false;
  switch (first.kind) {
    case "trip":
      return first.tripId === (second as typeof first).tripId;
    case "step":
      return (
        first.tripId === (second as typeof first).tripId &&
        first.index === (second as typeof first).index
      );
    case "city":
      return first.cityId === (second as typeof first).cityId;
    case "country":
      return first.countryId === (second as typeof first).countryId;
    case "config":
      return true;
  }
}
