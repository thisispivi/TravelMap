import { toId } from "@travelmap/core";

/** The colour of an ordinary passport's cover: the four almost every country uses. */
export type PassportCover = "red" | "blue" | "green" | "black";

/*
 * Ordinary passports, by the map's country names. Taken from Kiwi.com's worldwide
 * guide (updated February 2026), with TravelStatsMan's 2016 survey where Kiwi.com
 * names no colour, and Kiwi.com preferred where the two disagree (Botswana,
 * Burundi, Chad, Gabon, Zambia). EU members carry the common burgundy, except
 * Croatia; Sweden, Serbia, South Africa and Jamaica come from their own
 * passports' published covers. Countries named nowhere fall back to burgundy,
 * the most widespread colour after blue.
 */
const COVERS: Record<Exclude<PassportCover, "red">, string[]> = {
  black: [
    "Angola",
    "Congo",
    "Malawi",
    "New Zealand",
    "Tajikistan",
    "Trinidad and Tobago",
  ],
  blue: [
    "Antigua and Barb.",
    "Bahamas",
    "Barbados",
    "Belize",
    "Canada",
    "Costa Rica",
    "Cuba",
    "Dominica",
    "Dominican Rep.",
    "El Salvador",
    "Grenada",
    "Guatemala",
    "Haiti",
    "Honduras",
    "Jamaica",
    "Nicaragua",
    "Panama",
    "St. Kitts and Nevis",
    "Saint Lucia",
    "St. Vin. and Gren.",
    "United States of America",
    "Argentina",
    "Brazil",
    "Chile",
    "Guyana",
    "Paraguay",
    "Suriname",
    "Uruguay",
    "Venezuela",
    "Benin",
    "Botswana",
    "Burundi",
    "Cabo Verde",
    "Dem. Rep. Congo",
    "Djibouti",
    "Eritrea",
    "eSwatini",
    "Kenya",
    "Libya",
    "Mauritius",
    "Mozambique",
    "Rwanda",
    "São Tomé and Principe",
    "Somalia",
    "S. Sudan",
    "Sudan",
    "Tanzania",
    "Uganda",
    "Belarus",
    "Bosnia and Herz.",
    "Croatia",
    "Iceland",
    "Liechtenstein",
    "San Marino",
    "Ukraine",
    "United Kingdom",
    "Australia",
    "Fiji",
    "Kiribati",
    "Marshall Is.",
    "Micronesia",
    "Nauru",
    "Palau",
    "Papua New Guinea",
    "Samoa",
    "Afghanistan",
    "Armenia",
    "Bhutan",
    "India",
    "Iraq",
    "Israel",
    "Jordan",
    "Kazakhstan",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Lebanon",
    "North Korea",
    "South Korea",
    "United Arab Emirates",
    "Vietnam",
    "Yemen",
  ],
  green: [
    "Saudi Arabia",
    "Turkmenistan",
    "Algeria",
    "Burkina Faso",
    "Cameroon",
    "Central African Rep.",
    "Chad",
    "Comoros",
    "Côte d'Ivoire",
    "Egypt",
    "Gabon",
    "Gambia",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Lesotho",
    "Liberia",
    "Mali",
    "Mauritania",
    "Morocco",
    "Niger",
    "Nigeria",
    "Sierra Leone",
    "South Africa",
    "Togo",
    "Zambia",
    "Zimbabwe",
    "Azerbaijan",
    "Bangladesh",
    "Indonesia",
    "Pakistan",
    "Mexico",
    "Solomon Is.",
    "Tonga",
    "Vanuatu",
    "Vatican",
  ],
};

const COVER_BY_ID = new Map<string, PassportCover>(
  (["black", "blue", "green"] as const).flatMap((cover) =>
    COVERS[cover].map((name): [string, PassportCover] => [toId(name), cover]),
  ),
);

/**
 * Finds the colour of a country's ordinary passport.
 * @param {string} countryId - The country's id, its map name in id form
 * @returns {PassportCover} The cover's colour
 */
export function passportCoverOf(countryId: string): PassportCover {
  return COVER_BY_ID.get(countryId) ?? "red";
}

/** Every name the table uses, for the test that keeps it in step with the map. */
export const COVER_NAMES: string[] = Object.values(COVERS).flat();
