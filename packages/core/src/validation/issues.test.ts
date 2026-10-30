import { describe, expect, it } from "vitest";

import { Issue, IssueSeverity, worstSeverity } from "./issues";

/**
 * Builds a trip-level issue of the given severity.
 * @param {IssueSeverity} severity - How serious the issue is
 * @returns {Issue} The issue
 */
function issueOf(severity: IssueSeverity): Issue {
  return {
    code: "test",
    message: "Test",
    path: "trips/test.json",
    severity,
    subject: { kind: "trip", tripId: "test" },
  };
}

describe("worstSeverity", () => {
  it("names a blocking issue over warnings found before it", () => {
    expect(
      worstSeverity([
        issueOf("suggestion"),
        issueOf("warning"),
        issueOf("blocking"),
      ]),
    ).toBe("blocking");
  });

  it("names nothing when there are no issues", () => {
    expect(worstSeverity([])).toBeUndefined();
  });
});
