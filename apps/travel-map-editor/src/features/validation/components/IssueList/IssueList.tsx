import "./IssueList.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { Issue } from "@travelmap/core";
import { CircleAlert, Sparkles, TriangleAlert } from "lucide-react";
import { ReactNode } from "react";

import { describeIssue } from "../../lib/issues";

/**
 * SeverityIcon component
 * The mark of how serious a problem is: blocking, a warning, or a suggestion.
 * @component
 * @param {SeverityIconProps} props - The icon props
 * @param {Issue["severity"]} props.severity - How serious the problem is
 * @returns {ReactNode} The severity icon
 */
export function SeverityIcon({ severity }: SeverityIconProps): ReactNode {
  switch (severity) {
    case "blocking":
      return <CircleAlert aria-hidden="true" />;
    case "warning":
      return <TriangleAlert aria-hidden="true" />;
    case "suggestion":
      return <Sparkles aria-hidden="true" />;
  }
}

/**
 * Properties accepted by the SeverityIcon component.
 * @property {Issue["severity"]} severity - How serious the problem is
 */
interface SeverityIconProps {
  severity: Issue["severity"];
}

/**
 * Properties accepted by the IssueList component.
 * @property {Issue[]} issues - The problems to show
 * @property {(fix: NonNullable<Issue["fix"]>) => void} onApplyFix - Applies a repair
 */
interface IssueListProps {
  issues: Issue[];
  onApplyFix: (fix: NonNullable<Issue["fix"]>) => void;
}

/**
 * IssueList component
 * The problems found on one part of a trip, shown on that part rather than
 * in a list elsewhere, each with its repair when the rule offers one. A
 * problem read beside what causes it needs no explaining where it is.
 * @component
 * @param {IssueListProps} props - The list props
 * @param {Issue[]} props.issues - The problems to show
 * @param {(fix: NonNullable<Issue["fix"]>) => void} props.onApplyFix - Applies a repair
 * @returns {ReactNode} The problems, or nothing when there are none
 */
export function IssueList({ issues, onApplyFix }: IssueListProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  if (issues.length === 0) return null;

  return (
    <ul className="issue-list">
      {issues.map((issue) => (
        <li
          className={classNames(
            "issue-list__issue",
            `issue-list__issue--${issue.severity}`,
          )}
          key={`${issue.code}:${issue.path}:${JSON.stringify(issue.subject)}`}
        >
          <span className="issue-list__icon">
            <SeverityIcon severity={issue.severity} />
          </span>
          <span className="issue-list__message">
            {describeIssue(
              issue,
              /* i18next's overloads are too narrow to pass as a plain function. */
              t as (key: string, options: object) => string,
            )}
          </span>
          {issue.fix ? (
            <button
              className="editor-button issue-list__fix"
              onClick={() => (issue.fix ? onApplyFix(issue.fix) : undefined)}
              type="button"
            >
              {t(`issueFix.${issue.code}`, {
                ...issue.params,
                defaultValue: issue.fix.label,
              })}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
