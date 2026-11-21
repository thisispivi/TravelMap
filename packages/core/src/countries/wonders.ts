/**
 * A landmark of the Wonders of the World checklist: its id, the country it
 * stands in, and whether it is the surviving ancient wonder rather than one of
 * the New7Wonders.
 * @property {string} id - Stable id authored trips tag a stay with
 * @property {string} countryId - ISO 3166-1 alpha-2 code of its country
 * @property {boolean} isAncient - Whether it is the Great Pyramid of Giza
 */
interface Wonder {
  id: string;
  countryId: string;
  isAncient: boolean;
}

/**
 * The seven New7Wonders, then the Great Pyramid of Giza, the one ancient wonder
 * still standing. A closed list: nobody votes in an eighth.
 */
export const WONDERS = [
  { countryId: "CN", id: "greatWall", isAncient: false },
  { countryId: "JO", id: "petra", isAncient: false },
  { countryId: "IT", id: "colosseum", isAncient: false },
  { countryId: "MX", id: "chichenItza", isAncient: false },
  { countryId: "PE", id: "machuPicchu", isAncient: false },
  { countryId: "IN", id: "tajMahal", isAncient: false },
  { countryId: "BR", id: "christTheRedeemer", isAncient: false },
  { countryId: "EG", id: "gizaPyramid", isAncient: true },
] as const satisfies readonly Wonder[];

/** The id of one wonder in the checklist. */
export type WonderId = (typeof WONDERS)[number]["id"];
