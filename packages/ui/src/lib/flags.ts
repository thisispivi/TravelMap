/*
 * Country ids come from Natural Earth's abbreviated map names, the flag pack
 * spells countries out, and the site has no country catalogue to join them
 * through, so the two differences are listed here. Thailand and Afghanistan,
 * among others, have no flag in the pack and are left to `hasFlag`.
 */
const FLAG_NAME_BY_COUNTRY_ID: Readonly<Record<string, string>> = {
  Aland: "AlandIslands",
  AntiguaAndBarb: "AntiguaAndBarbuda",
  AshmoreAndCartierIs: "Australia",
  BosniaAndHerz: "BosniaAndHerzegovina",
  BrIndianOceanTer: "BritishIndianOceanTerritory",
  BritishVirginIs: "BritishVirginIslands",
  CaboVerde: "CapeVerde",
  CaymanIs: "CaymanIslands",
  CentralAfricanRep: "CentralAfricanRepublic",
  Congo: "CongoBrazzaville",
  CookIs: "CookIslands",
  CoteDIvoire: "CoteDivoire",
  DemRepCongo: "CongoKinshasa",
  DominicanRep: "DominicanRepublic",
  ESwatini: "Eswatini",
  EqGuinea: "EquatorialGuinea",
  FaeroeIs: "FaroeIslands",
  FalklandIs: "FalklandIslands",
  FrPolynesia: "FrenchPolynesia",
  HeardIAndMcDonaldIs: "HeardAndMcdonaldIslands",
  HongKong: "HongKongSarChina",
  Macao: "MacaoSarChina",
  Macedonia: "NorthMacedonia",
  MarshallIs: "MarshallIslands",
  Myanmar: "MyanmarBurma",
  NMarianaIs: "NorthernMarianaIslands",
  Palestine: "PalestinianTerritories",
  PitcairnIs: "PitcairnIslands",
  SGeoAndTheIs: "SouthGeorgiaAndSouthSandwichIslands",
  SSudan: "SouthSudan",
  SaintHelena: "StHelena",
  SaintLucia: "StLucia",
  SolomonIs: "SolomonIslands",
  StVinAndGren: "StVincentAndGrenadines",
  TurksAndCaicosIs: "TurksAndCaicosIslands",
  USVirginIs: "UsVirginIslands",
  UnitedStatesOfAmerica: "UnitedStates",
  Vatican: "VaticanCity",
  WSahara: "WesternSahara",
  WallisAndFutunaIs: "WallisAndFutuna",
};

/**
 * Names the flag file of a country id.
 * @param {string} countryId - The country id
 * @returns {string} The flag's name in the pack
 */
export function flagNameOf(countryId: string): string {
  return FLAG_NAME_BY_COUNTRY_ID[countryId] ?? countryId;
}

/**
 * Names the public URL of a country's flag.
 * @param {string} countryId - The country id
 * @returns {string} Its URL
 */
export function flagUrl(countryId: string): string {
  return `/flags/${flagNameOf(countryId)}.svg`;
}
