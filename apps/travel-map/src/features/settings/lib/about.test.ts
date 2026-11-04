import { describe, expect, it } from "vitest";

import { formatBuildLine, offeredLocales } from "./about";

describe("offeredLocales", () => {
  it("offers the default and the configured translated languages", () => {
    expect(offeredLocales(["it-IT"], "en-US")).toEqual(["en-US", "it-IT"]);
  });

  it("offers every language when the configuration names none", () => {
    expect(offeredLocales(undefined, "en-US")).toEqual(["en-US", "it-IT"]);
  });

  it("ignores a configured language with no translations", () => {
    expect(offeredLocales(["fr-FR"], "en-US")).toEqual(["en-US"]);
  });

  it("keeps the active language even when it is not configured", () => {
    expect(offeredLocales([], "it-IT")).toEqual(["en-US", "it-IT"]);
  });
});

describe("formatBuildLine", () => {
  const date = "2026-11-01T12:00:00.000Z";

  it("names the version, commit and date", () => {
    expect(
      formatBuildLine({ commit: "abc1234", date, version: "1.0.0" }, "en-US"),
    ).toBe("v1.0.0 · abc1234 · Nov 1, 2026");
  });

  it("leaves out a commit nobody knows, as in a Docker build", () => {
    expect(formatBuildLine({ date, version: "1.0.0" }, "en-US")).toBe(
      "v1.0.0 · Nov 1, 2026",
    );
  });
});
