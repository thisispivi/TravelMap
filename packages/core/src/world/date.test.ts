import { describe, expect, it } from "vitest";

import {
  addDays,
  daysBetween,
  formatLocalDate,
  parseLocalDate,
  zonedDurationMinutes,
} from "./date";

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

describe("zonedDurationMinutes", () => {
  it("measures a flight across time zones from two local clocks", () => {
    expect(
      zonedDurationMinutes(
        "2024-08-25T21:00",
        "Asia/Tokyo",
        "2024-08-26T05:45",
        "Europe/Rome",
      ),
    ).toBe(15 * 60 + 45);
  });

  it("counts the hour lost when clocks spring forward", () => {
    expect(
      zonedDurationMinutes(
        "2026-03-29T01:00",
        "Europe/Rome",
        "2026-03-29T04:00",
        "Europe/Rome",
      ),
    ).toBe(120);
  });

  it("counts the hour repeated when clocks fall back", () => {
    expect(
      zonedDurationMinutes(
        "2026-10-25T00:00",
        "Europe/Rome",
        "2026-10-25T04:00",
        "Europe/Rome",
      ),
    ).toBe(300);
  });

  it("refuses to invent a duration from dates without times", () => {
    expect(
      zonedDurationMinutes("2026-03-29", "Europe/Rome", "2026-03-30", "UTC"),
    ).toBeUndefined();
  });
});

describe("daysBetween", () => {
  it("counts nights across a month boundary", () => {
    expect(daysBetween("2025-12-28", "2026-01-02")).toBe(5);
  });

  it("ignores the time part of either date", () => {
    expect(daysBetween("2025-12-28T17:00", "2025-12-29T09:00")).toBe(1);
  });
});

describe("addDays", () => {
  it("rolls over a leap day", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});
