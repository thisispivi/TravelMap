import { describe, expect, it } from "vitest";

import { toId } from "./id";

describe("toId", () => {
  it("joins a multi-word map name the way country folders are named", () => {
    expect(toId("United Kingdom")).toBe("UnitedKingdom");
    expect(toId("Bosnia and Herz.")).toBe("BosniaAndHerz");
  });

  it("drops accents instead of the letters that carry them", () => {
    expect(toId("Côte d'Ivoire")).toBe("CoteDIvoire");
  });
});
