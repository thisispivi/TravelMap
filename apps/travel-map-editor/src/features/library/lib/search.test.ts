import { describe, expect, it } from "vitest";

import { meaningfulTerms, searchItems } from "./search.ts";

const cities = [
  { country: "Italy", name: "Rome" },
  { country: "Italy", name: "Monza" },
  { country: "Japan", name: "Kyoto" },
  { country: "Sweden", name: "Stockholm" },
];

/**
 * Exposes a sample city's searchable text.
 * @param {(typeof cities)[number]} city - The sample row
 * @returns {string[]} Terms the row should be findable by
 */
function terms(city: (typeof cities)[number]): string[] {
  return [city.name, city.country];
}

/**
 * Names the cities a query matches, in result order.
 * @param {string} query - The search query
 * @returns {string[]} The matched city names
 */
function matches(query: string): string[] {
  return searchItems(cities, query, terms).map(({ name }) => name);
}

describe("searchItems", () => {
  it("returns everything for an empty query", () => {
    expect(searchItems(cities, "", terms)).toEqual(cities);
    expect(searchItems(cities, "   ", terms)).toEqual(cities);
  });

  it("matches on any searchable field, including typos", () => {
    expect(matches("Rome")[0]).toBe("Rome");
    expect(matches("rme")[0]).toBe("Rome");
    expect(matches("Japan")[0]).toBe("Kyoto");
  });

  it("lets a natural phrase through its stop words", () => {
    expect(matches("the city of Rome")[0]).toBe("Rome");
  });

  it("intersects terms so extra words narrow the result", () => {
    expect(matches("Italy").toSorted()).toEqual(["Monza", "Rome"]);
    expect(matches("Italy Rome")).toEqual(["Rome"]);
  });

  it("returns nothing for a query no row can match", () => {
    expect(matches("zzzzzz")).toHaveLength(0);
    expect(matches("the")).toHaveLength(0);
    expect(matches("Rome zzzzzz")[0]).toBe("Rome");
  });
});

describe("meaningfulTerms", () => {
  /*
   * "il" appears only in the Italian stop-word list and "the" only in the
   * English one, so this fails the moment either list stops being applied.
   * Asserting through searchItems would not catch it: neither word
   * fuzzy-matches the sample rows.
   */
  it("drops stop words from every configured language", () => {
    expect(meaningfulTerms("il the Japan")).toEqual(["Japan"]);
    expect(meaningfulTerms("the city of Rome")).toEqual(["city", "Rome"]);
    expect(meaningfulTerms("  ")).toEqual([]);
  });

  it("keeps the raw words when a query is nothing but stop words", () => {
    expect(meaningfulTerms("the")).toEqual(["the"]);
  });
});
