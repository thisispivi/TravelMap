import assert from "node:assert/strict";

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

assert.deepEqual(searchItems(cities, "", terms), cities);
assert.deepEqual(searchItems(cities, "   ", terms), cities);

assert.equal(searchItems(cities, "Rome", terms)[0]?.name, "Rome");
assert.equal(searchItems(cities, "rme", terms)[0]?.name, "Rome");
assert.equal(searchItems(cities, "Japan", terms)[0]?.name, "Kyoto");

/* Stop words must not stop a natural phrase from finding its row. */
assert.equal(searchItems(cities, "the city of Rome", terms)[0]?.name, "Rome");
/*
 * "il" appears only in the Italian list and "the" only in the English one, so
 * this fails the moment either list stops being applied. Asserting through
 * searchItems would not catch it: neither word fuzzy-matches the sample rows.
 */
assert.deepEqual(meaningfulTerms("il the Japan"), ["Japan"]);
assert.deepEqual(meaningfulTerms("the city of Rome"), ["city", "Rome"]);
assert.deepEqual(meaningfulTerms("  "), []);

/* Only stop words: the raw words are kept so the search still means something. */
assert.deepEqual(meaningfulTerms("the"), ["the"]);

/* A query made only of stop words falls back to the raw words. */
assert.equal(searchItems(cities, "the", terms).length, 0);

/*
 * Terms are intersected: "Italy" alone matches both Italian cities, so adding
 * "Rome" has to narrow the result rather than widen it. This is the case that
 * made every trip match "a trip to Japan" when terms were merged instead.
 */
assert.deepEqual(
  searchItems(cities, "Italy", terms).map(({ name }) => name).toSorted(),
  ["Monza", "Rome"],
);
assert.deepEqual(
  searchItems(cities, "Italy Rome", terms).map(({ name }) => name),
  ["Rome"],
);

assert.equal(searchItems(cities, "zzzzzz", terms).length, 0);
assert.equal(searchItems(cities, "Rome zzzzzz", terms)[0]?.name, "Rome");

console.log("search: all assertions passed");
