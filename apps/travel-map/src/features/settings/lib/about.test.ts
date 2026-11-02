import { describe, expect, it } from "vitest";

import {
  formatBuildLine,
  initialsOf,
  offeredLocales,
  resolveAvatarUrl,
  websiteOf,
} from "./about";

describe("initialsOf", () => {
  it("takes the first and last words of a long name", () => {
    expect(initialsOf("andrea de la piras")).toBe("AP");
  });

  it("takes one letter from a single name", () => {
    expect(initialsOf("  Pivi ")).toBe("P");
  });

  it("does not split a letter outside the basic plane", () => {
    expect(initialsOf("𝒜da")).toBe("𝒜");
  });

  it("gives nothing for a blank name", () => {
    expect(initialsOf("   ")).toBe("");
  });
});

describe("resolveAvatarUrl", () => {
  it("keeps an absolute URL as written", () => {
    expect(resolveAvatarUrl("https://example.com/me.jpg")).toBe(
      "https://example.com/me.jpg",
    );
  });

  it("leaves a media path to the media root", () => {
    expect(resolveAvatarUrl("/About/me.webp")).toMatch(/\/About\/me\.webp$/);
  });

  it("has nothing to show when unset", () => {
    expect(resolveAvatarUrl()).toBeUndefined();
  });
});

describe("websiteOf", () => {
  it("links a bare host over https", () => {
    expect(websiteOf("map.pivi.dev")).toEqual({
      host: "map.pivi.dev",
      href: "https://map.pivi.dev",
    });
  });

  it("drops a pasted protocol and trailing slash from the text", () => {
    expect(websiteOf("http://map.pivi.dev/")?.host).toBe("map.pivi.dev");
  });

  it("gives no link for a blank domain", () => {
    expect(websiteOf(" ")).toBeUndefined();
    expect(websiteOf()).toBeUndefined();
  });
});

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
