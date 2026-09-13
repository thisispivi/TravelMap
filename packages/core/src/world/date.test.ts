import { describe, expect, it } from "vitest";

import { formatLocalDate, parseLocalDate } from "./date";

describe("parseLocalDate", () => {
  it("reads a date as local wall-clock time, not UTC midnight", () => {
    const date = parseLocalDate("2026-05-01");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
  });

  it("reads an optional wall-clock time", () => {
    expect(parseLocalDate("2026-05-01T14:30").getHours()).toBe(14);
    expect(parseLocalDate("2026-05-01T14:30").getMinutes()).toBe(30);
  });

  it("rejects a date that does not exist instead of rolling it over", () => {
    expect(() => parseLocalDate("2026-02-30")).toThrow(/Invalid local date/);
    expect(() => parseLocalDate("2026-13-01")).toThrow(/Invalid local date/);
    expect(() => parseLocalDate("2026-05-01T25:00")).toThrow(
      /Invalid local date/,
    );
  });

  it("rejects anything that is not an authored date", () => {
    expect(() => parseLocalDate("2026-5-1")).toThrow(/Invalid local date/);
    expect(() => parseLocalDate("")).toThrow(/Invalid local date/);
  });
});

describe("formatLocalDate", () => {
  it("round-trips an authored date through the local calendar", () => {
    for (const value of ["2026-05-01", "2026-05-01T14:30", "2026-12-31"])
      expect(formatLocalDate(parseLocalDate(value))).toBe(value);
  });

  it("omits a midnight time, matching how dates are authored", () => {
    expect(formatLocalDate(parseLocalDate("2026-05-01T00:00"))).toBe(
      "2026-05-01",
    );
  });
});
