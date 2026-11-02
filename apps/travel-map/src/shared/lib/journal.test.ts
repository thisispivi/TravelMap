import { describe, expect, it } from "vitest";

import { groupsJournal } from "./journal";

/**
 * Builds a viewport the way `useResponsive` reports it.
 * @param {number} width - The window's width
 * @param {number} height - The window's height
 * @returns {Parameters<typeof groupsJournal>[0]} The viewport
 */
const viewport = (
  width: number,
  height: number,
): Parameters<typeof groupsJournal>[0] => ({
  isCompact: width < 768,
  window: { height, width },
});

describe("groupsJournal", () => {
  it("groups on a phone, where six tabs would not fit their labels", () => {
    expect(groupsJournal(viewport(360, 740))).toBe(true);
    expect(groupsJournal(viewport(430, 932))).toBe(true);
  });

  it("gives each page a tab on a bar with room for them", () => {
    expect(groupsJournal(viewport(600, 900))).toBe(false);
  });

  it("gives each page a tab on a rail with room for them", () => {
    expect(groupsJournal(viewport(1280, 800))).toBe(false);
  });

  it("groups on a rail too short for them, such as a phone on its side", () => {
    expect(groupsJournal(viewport(844, 390))).toBe(true);
  });
});
