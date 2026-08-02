import "./ValidationTray.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { countBySeverity, Issue, TripJson } from "@travelmap/core";
import { ReactNode } from "react";

import { DocumentChange } from "../../../../data/store";
import { PreviewFrame } from "../../../preview/components/PreviewFrame/PreviewFrame";
import { Selection } from "../../../workspace/Workspace.state";

/** Which tray is currently open beneath the workspace. */
export type TrayTab = "validation" | "changes" | "preview" | "closed";

/**
 * Turns an issue into the sentence the author reads, preferring a translation
 * of its code and falling back to the plain-English message the rule carries.
 * @param {Issue} issue - The issue to describe
 * @param {(key: string, options: object) => string} translate - Translator
 * @returns {string} The message to show
 */
function describe(
  issue: Issue,
  translate: (key: string, options: object) => string,
): string {
  return translate(`issues.${issue.code}`, {
    ...issue.params,
    defaultValue: issue.message,
  });
}

/**
 * IssueRow component
 * One problem, with the repair beside it when the rule offers one.
 * @component
 * @param {IssueRowProps} props
 * @param {Issue} props.issue - The problem to show
 * @param {(() => void) | undefined} props.onApplyFix - Applies the repair
 * @param {() => void} props.onSelect - Selects the issue's subject
 * @returns {ReactNode} The issue row
 */
function IssueRow({ issue, onApplyFix, onSelect }: IssueRowProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <li
      className={classNames(
        "validation-tray__issue",
        `validation-tray__issue--${issue.severity}`,
      )}
    >
      <button
        className="validation-tray__issue-button"
        onClick={onSelect}
        type="button"
      >
        {describe(issue, t as (key: string, options: object) => string)}
      </button>
      {onApplyFix && issue.fix ? (
        <button className="editor-button" onClick={onApplyFix} type="button">
          {issue.fix.label}
        </button>
      ) : null}
    </li>
  );
}

/**
 * Props for IssueRow.
 * @property {Issue} issue - The problem to show
 * @property {(() => void) | undefined} onApplyFix - Applies the repair
 * @property {() => void} onSelect - Selects the issue's subject
 */
interface IssueRowProps {
  issue: Issue;
  onApplyFix: (() => void) | undefined;
  onSelect: () => void;
}

/**
 * ValidationTray component
 * The workspace's status strip, and the two trays behind it. Validation is
 * always visible as a count rather than hidden until a save is attempted,
 * because a problem found while typing costs a keystroke to fix and the same
 * problem found at commit time costs an investigation.
 * @component
 * @param {ValidationTrayProps} props
 * @param {DocumentChange[]} props.changes - What this session has written
 * @param {Issue[]} props.issues - Live validation for the trip
 * @param {(fix: NonNullable<Issue["fix"]>) => void} props.onApplyFix - Applies a repair
 * @param {(tab: TrayTab) => void} props.onChangeTab - Opens or closes a tray
 * @param {(selection: Selection) => void} props.onSelect - Selection callback
 * @param {TrayTab} props.tab - Which tray is open
 * @param {TripJson} props.trip - The trip being edited
 * @returns {ReactNode} The tray region
 */
export function ValidationTray({
  changes,
  issues,
  onApplyFix,
  onChangeTab,
  onSelect,
  tab,
  trip,
}: ValidationTrayProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const counts = countBySeverity(issues);
  return (
    <section aria-label={t("tray.title")} className="validation-tray">
      <div className="validation-tray__bar">
        <p aria-live="polite" className="validation-tray__status">
          {counts.blocking > 0
            ? t("tray.blockingSummary", { count: counts.blocking })
            : t("tray.cleanSummary")}
          {counts.warning > 0
            ? ` · ${t("tray.warningSummary", { count: counts.warning })}`
            : ""}
        </p>
        <div className="validation-tray__tabs">
          <button
            aria-pressed={tab === "validation"}
            className="editor-button"
            onClick={() =>
              onChangeTab(tab === "validation" ? "closed" : "validation")
            }
            type="button"
          >
            {t("tray.validation")}
          </button>
          <button
            aria-pressed={tab === "changes"}
            className="editor-button"
            onClick={() =>
              onChangeTab(tab === "changes" ? "closed" : "changes")
            }
            type="button"
          >
            {t("tray.changes", { count: changes.length })}
          </button>
          <button
            aria-pressed={tab === "preview"}
            className="editor-button"
            onClick={() =>
              onChangeTab(tab === "preview" ? "closed" : "preview")
            }
            type="button"
          >
            {t("tray.preview")}
          </button>
        </div>
      </div>
      {tab === "validation" ? (
        <div className="validation-tray__panel">
          {issues.length === 0 ? (
            <p className="editor-panel__hint">
              {t("tray.noIssues", { steps: trip.steps.length })}
            </p>
          ) : (
            <ul className="validation-tray__issues">
              {issues.map((issue, index) => (
                <IssueRow
                  issue={issue}
                  key={`${issue.code}-${index}`}
                  onApplyFix={
                    issue.fix ? () => onApplyFix(issue.fix!) : undefined
                  }
                  onSelect={() =>
                    onSelect(
                      issue.subject.kind === "step"
                        ? { index: issue.subject.index, kind: "step" }
                        : { kind: "trip" },
                    )
                  }
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {tab === "preview" ? (
        <div className="validation-tray__panel">
          <PreviewFrame tripId={trip.id} />
        </div>
      ) : null}
      {tab === "changes" ? (
        <div className="validation-tray__panel">
          {changes.length === 0 ? (
            <p className="editor-panel__hint">{t("tray.noChanges")}</p>
          ) : (
            <>
              <ul className="validation-tray__changes">
                {changes.map((change) => (
                  <li className="validation-tray__change" key={change.path}>
                    <span className="validation-tray__change-kind">
                      {t(`tray.change.${change.change}`)}
                    </span>
                    <code>{change.path}</code>
                  </li>
                ))}
              </ul>
              <p className="editor-panel__hint">{t("tray.commitHint")}</p>
              <code className="validation-tray__command">
                git add data &amp;&amp; git commit -m &quot;Update{" "}
                {trip.title || trip.id}&quot;
              </code>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Props for ValidationTray.
 * @property {DocumentChange[]} changes - What this session has written
 * @property {Issue[]} issues - Live validation for the trip
 * @property {(fix: NonNullable<Issue["fix"]>) => void} onApplyFix - Applies a repair
 * @property {(tab: TrayTab) => void} onChangeTab - Opens or closes a tray
 * @property {(selection: Selection) => void} onSelect - Selection callback
 * @property {TrayTab} tab - Which tray is open
 * @property {TripJson} trip - The trip being edited
 */
interface ValidationTrayProps {
  changes: DocumentChange[];
  issues: Issue[];
  onApplyFix: (fix: NonNullable<Issue["fix"]>) => void;
  onChangeTab: (tab: TrayTab) => void;
  onSelect: (selection: Selection) => void;
  tab: TrayTab;
  trip: TripJson;
}
