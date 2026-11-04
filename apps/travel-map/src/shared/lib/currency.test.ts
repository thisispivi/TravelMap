import { Currency } from "@travelmap/core";
import { describe, expect, it } from "vitest";

import { currencyName, currencySymbol } from "./currency";

describe("currency labels", () => {
  it("names every currency in both languages", () => {
    for (const code of Object.values(Currency)) {
      expect(currencyName(code, "en-US"), code).not.toBe(code);
      expect(currencyName(code, "it-IT"), code).not.toBe(code);
    }
  });

  it("capitalises a name the locale writes in lower case", () => {
    expect(currencyName(Currency.JPY, "it-IT")).toBe("Yen giapponese");
  });

  it("gives every currency a sign, the reader's own first", () => {
    expect(currencySymbol(Currency.EUR, "it-IT")).toBe("€");
    expect(currencySymbol(Currency.SEK, "en-US")).toBe("kr");
    expect(currencySymbol(Currency.BGN, "it-IT")).toBe("лв");
    for (const code of Object.values(Currency))
      expect(currencySymbol(code, "en-US"), code).not.toBe(code);
  });
});
