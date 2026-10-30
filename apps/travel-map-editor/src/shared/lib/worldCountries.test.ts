import { describe, expect, it } from "vitest";

import { findWorldCountry, findWorldCountryByCode } from "./worldCountries";

describe("worldCountries", () => {
  it("finds a country whose map name has several words by its dataset id", () => {
    const country = findWorldCountry("UnitedKingdom");

    expect(country?.name).toBe("United Kingdom");
    expect(country?.flagUrl).toBeDefined();
  });

  it("gives a gazetteer match the id the dataset's folders use", () => {
    expect(findWorldCountryByCode("GB")?.id).toBe("UnitedKingdom");
  });
});
