import { Continent } from "@travelmap/core";
import { EmblemSet, loadEmblems } from "@travelmap/ui/stamps/emblems";
import { useEffect, useState } from "react";

/**
 * Fetches the drawings of the continents in view, as each one first comes into
 * view, and keeps them: the catalogue's emblems are chunks a reader only pays for
 * on reaching the pages that use them.
 * @param {Continent[]} continents - The continents in view
 * @returns {EmblemSet} Every drawing fetched so far
 */
export function useEmblems(continents: Continent[]): EmblemSet {
  const [emblems, setEmblems] = useState<EmblemSet>({});
  const wanted = [...new Set(continents)].toSorted().join();

  useEffect(() => {
    let isCurrent = true;
    const keys = wanted.split(",");
    for (const continent of Object.values(Continent).filter((value) =>
      keys.includes(value),
    )) {
      /* The dynamic import behind this caches its module, so asking again is free. */
      void loadEmblems(continent).then((set) => {
        if (isCurrent) setEmblems((loaded) => ({ ...loaded, ...set }));
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [wanted]);

  return emblems;
}
