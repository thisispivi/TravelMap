import Fuse from "fuse.js";
import { eng, ita, removeStopwords } from "stopword";

/*
 * The dataset is authored in English with Italian translations alongside it, so
 * a query is stripped against both lists rather than guessing which one the
 * author is typing in. `removeStopwords` accepts a single list, so they are
 * merged here rather than passed separately.
 */
const STOP_WORDS = [...eng, ...ita];

/**
 * Drops filler words so a natural phrase matches the same rows as its keywords.
 * The original words are kept when stripping would remove all of them, because
 * a search for a genuine stop word is still a search.
 * @param {string} query - Raw text typed by the author
 * @returns {string[]} The query reduced to its meaningful terms
 */
export function meaningfulTerms(query: string): string[] {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const kept = removeStopwords(words, STOP_WORDS);
  return kept.length > 0 ? kept : words;
}

/**
 * Filters rows by fuzzy-matching a query against the text each row exposes.
 *
 * Terms are searched one at a time and intersected, because Fuse scores a
 * multi-word query as a single string: "trip Japan" would otherwise rank every
 * row whose title contains "Trip". A term that matches nothing is dropped
 * rather than emptying the result, so a descriptive phrase still narrows to the
 * words the dataset actually knows.
 * @param {T[]} items - Rows to search
 * @param {string} query - Raw text typed by the author
 * @param {(item: T) => string[]} toTerms - Searchable text for one row
 * @returns {T[]} Matching rows, best first, or every row for an empty query
 */
export function searchItems<T>(
  items: T[],
  query: string,
  toTerms: (item: T) => string[],
): T[] {
  const terms = meaningfulTerms(query);
  if (terms.length === 0) return items;

  const fuse = new Fuse(
    items.map((item) => ({ text: toTerms(item).filter(Boolean) })),
    /*
     * 0.35 rather than Fuse's default 0.4, measured against this dataset: at
     * 0.4 five-letter place names blur together and "Japan" matches the Malta
     * trip, while dropping to 0.3 loses ordinary typos such as "rme" for Rome.
     */
    {
      ignoreLocation: true,
      includeScore: true,
      keys: ["text"],
      threshold: 0.35,
    },
  );
  const scoresPerTerm = terms
    .map(
      (term) =>
        new Map(
          fuse.search(term).map(({ refIndex, score = 1 }) => [refIndex, score]),
        ),
    )
    .filter((scores) => scores.size > 0);
  if (scoresPerTerm.length === 0) return [];

  const totals = scoresPerTerm.reduce((kept, scores) =>
    new Map(
      [...kept].flatMap(([index, total]) => {
        const score = scores.get(index);
        return score === undefined ? [] : [[index, total + score]];
      }),
    ),
  );

  return [...totals.entries()]
    .sort(([, first], [, second]) => first - second)
    .map(([index]) => items[index]);
}
