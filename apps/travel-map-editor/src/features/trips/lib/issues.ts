import { Issue } from "@travelmap/core";

/**
 * Turns an issue into the sentence the author reads, preferring a translation
 * of its code and falling back to the plain-English message the rule carries.
 * @param {Issue} issue - The issue to describe
 * @param {(key: string, options: object) => string} translate - Translator
 * @returns {string} The message to show
 */
export function describeIssue(
  issue: Issue,
  translate: (key: string, options: object) => string,
): string {
  return translate(`issues.${issue.code}`, {
    ...issue.params,
    defaultValue: issue.message,
  });
}
