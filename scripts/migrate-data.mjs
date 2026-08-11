import { createRequire } from "node:module";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const require = createRequire(join(ROOT, "apps", "travel-map", "package.json"));
const ts = require("typescript");
const SOURCE_ROOT = join(ROOT, "apps", "travel-map", "src", "data");
const DATA_ROOT = join(ROOT, "data");
const LOCALE_ROOT = join(ROOT, "apps", "travel-map", "public", "locales");

/** Reads the two locale dictionaries used to turn legacy identity keys into display names. */
async function readLocales() {
  const [english, italian] = await Promise.all(
    ["en-US", "it-IT"].map(async (locale) =>
      JSON.parse(await readFile(join(LOCALE_ROOT, locale, "home.json"), "utf8")),
    ),
  );
  return { english, italian };
}

/** Formats a JSON document consistently with the hand-authored dataset. */
async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** Evaluates the literal subset used by the existing data declarations. */
function valueOf(node) {
  if (ts.isCallExpression(node) && node.expression.getText() === "d") return dateOf(node);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isPrefixUnaryExpression(node)) return node.operator === ts.SyntaxKind.MinusToken ? -valueOf(node.operand) : valueOf(node.operand);
  if (ts.isBinaryExpression(node)) {
    const left = valueOf(node.left);
    const right = valueOf(node.right);
    if (node.operatorToken.kind === ts.SyntaxKind.AsteriskToken) return left * right;
    if (node.operatorToken.kind === ts.SyntaxKind.PlusToken) return left + right;
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(valueOf);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map((property) => {
    if (!ts.isPropertyAssignment(property)) throw new Error(`Unsupported property: ${property.getText()}`);
    return [property.name.getText().replaceAll('"', ""), valueOf(property.initializer)];
  }));
  throw new Error(`Unsupported expression: ${node.getText()}`);
}

/** Extracts the legacy constructor data from a country or city module. */
async function readConstructor(path) {
  const source = ts.createSourceFile(path, await readFile(path, "utf8"), ts.ScriptTarget.Latest, true);
  let result;
  source.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    node.declarationList.declarations.forEach((declaration) => {
      if (!ts.isNewExpression(declaration.initializer) || !ts.isObjectLiteralExpression(declaration.initializer.arguments?.[0])) return;
      result = valueOf(declaration.initializer.arguments[0]);
    });
  });
  return result;
}

/** Converts legacy city and country modules to their reference-based JSON forms. */
async function migrateEntities(locales) {
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      if (!entry.isFile() || !path.endsWith(".ts") || entry.name === "index.ts") continue;
      const raw = await readConstructor(path);
      if (!raw) continue;
      const parts = relative(SOURCE_ROOT, path).split(/[/\\]/);
      const id = parts.at(-1).replace(".ts", "");
      const isCountry = parts.length === 2;
      const translations = isCountry ? locales : locales;
      const group = isCountry ? "countries" : "cities";
      const name = translations.english[group]?.[id] ?? raw.name ?? id;
      const italianName = translations.italian[group]?.[id];
      const common = italianName && italianName !== name ? { nameByLocale: { "it-IT": italianName } } : {};
      const output = isCountry
        ? { id, name, ...common, color: raw.color, continent: raw.continent, currency: raw.currency, ...(raw.minMarkerScale ? { minMarkerScale: raw.minMarkerScale } : {}), ...(raw.maxMarkerScale ? { maxMarkerScale: raw.maxMarkerScale } : {}) }
        : { id, name, ...common, countryId: raw.country, coordinates: raw.coordinates, timeZone: raw.timeZone, ...(raw.population ? { population: raw.population } : {}), ...(raw.backgroundImgSources ? { backgroundImages: raw.backgroundImgSources.map((image) => `/Travels${image}`) } : {}), ...(raw.isLived ? { isLived: true } : {}), ...(raw.minMarkerScale ? { minMarkerScale: raw.minMarkerScale } : {}), ...(raw.customMarkerSizes ? { customMarkerSizes: raw.customMarkerSizes } : {}) };
      await writeJson(join(DATA_ROOT, ...parts).replace(/\.ts$/, ".json"), output);
    }
  }
  await walk(SOURCE_ROOT);
}

/** Converts a legacy d({ year, monthIndex, day, hours }) call into a local date string. */
function dateOf(node) {
  const data = valueOf(node.arguments[0]);
  const date = `${data.year}-${String(data.monthIndex + 1).padStart(2, "0")}-${String(data.day).padStart(2, "0")}`;
  return data.hours === undefined ? date : `${date}T${String(data.hours).padStart(2, "0")}:00`;
}

/** Recursively converts the legacy trip-builder calls into serialized steps. */
function stepOf(node) {
  const name = node.expression.getText();
  const data = valueOf(node.arguments[0]);
  if (name === "stay") {
    return { type: "stop", cityId: data.city, sDate: dateOf(node.arguments[0].properties.find((item) => item.name.getText() === "sDate").initializer), eDate: dateOf(node.arguments[0].properties.find((item) => item.name.getText() === "eDate").initializer), ...(data.photoPath ? { photoPath: data.photoPath.replace("/photos/", "/") } : {}), ...(data.data ?? {}) };
  }
  const transport = { type: "transport", mode: data.mode ?? (name === "plane" ? "plane" : "ferry"), fromId: data.from, toId: data.to, ...(data.data ?? {}) };
  if (transport.sDate) transport.sDate = dateOf(node.arguments[0].properties.find((item) => item.name.getText() === "data").initializer.properties.find((item) => item.name.getText() === "sDate").initializer);
  if (transport.eDate) transport.eDate = dateOf(node.arguments[0].properties.find((item) => item.name.getText() === "data").initializer.properties.find((item) => item.name.getText() === "eDate").initializer);
  if (transport.via) { transport.viaIds = transport.via; delete transport.via; }
  if (name === "plane") transport.flight = { company: data.company, ...(transport.flight ?? {}) };
  if (name === "ferry") { transport.ferry = { company: data.company, ...(transport.ferry ?? {}) }; if (transport.ferry.via) { transport.ferry.viaIds = transport.ferry.via; delete transport.ferry.via; } }
  return transport;
}

/** Converts the legacy visitedTrips declaration into one JSON document per trip. */
async function migrateTrips(locales) {
  const path = join(SOURCE_ROOT, "index.ts");
  const source = ts.createSourceFile(path, await readFile(path, "utf8"), ts.ScriptTarget.Latest, true);
  let trips;
  source.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    node.declarationList.declarations.forEach((declaration) => {
      if (declaration.name.getText() === "visitedTrips" && ts.isArrayLiteralExpression(declaration.initializer)) trips = declaration.initializer.elements;
    });
  });
  for (const node of trips) {
    const data = Object.fromEntries(node.arguments[0].properties.flatMap((property) =>
      ts.isPropertyAssignment(property) && property.name.getText() !== "steps"
        ? [[property.name.getText(), valueOf(property.initializer)]]
        : [],
    ));
    const id = data.id;
    const title = locales.english.trips[id] ?? id;
    const italian = locales.italian.trips[id];
    const stepsNode = node.arguments[0].properties.find((property) => property.name.getText() === "steps")?.initializer;
    const isRoundTrip = node.expression.getText() === "roundTripByPlane";
    const steps = isRoundTrip
      ? [
          { type: "transport", mode: "plane", fromId: "Cagliari", toId: data.city, flight: { company: data.company }, ...(data.data ?? {}) },
          { type: "stop", cityId: data.city, sDate: data.sDate, eDate: data.eDate, photoPath: data.photoPath.replace("/photos/", "/") },
          { type: "transport", mode: "plane", fromId: data.city, toId: "Cagliari", flight: { company: data.company }, ...(data.data ?? {}) },
        ]
      : stepsNode.elements.map(stepOf);
    const trip = { id, title, ...(italian && italian !== title ? { titleByLocale: { "it-IT": italian } } : {}), sDate: data.sDate, eDate: data.eDate, originCityId: isRoundTrip ? "Cagliari" : data.origin, returnCityId: isRoundTrip ? "Cagliari" : data.returnTo, coverImage: `/Trips/${id}.jpg`, ...(data.mapFocus ? { mapFocus: data.mapFocus } : {}), steps };
    await writeJson(join(DATA_ROOT, "trips", `${id}.json`), trip);
  }
}

/** Copies media manifests into the data tree and normalizes their CDN-relative URLs. */
async function migratePhotos() {
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      if (!entry.isFile() || !path.endsWith(".json")) continue;
      const value = JSON.parse(await readFile(path, "utf8")).map((image) => ({ ...image, ...(image.youtube ? {} : { original: `/Travels${image.original}`, thumbnail: `/Travels${image.thumbnail}` }) }));
      const relativePath = relative(SOURCE_ROOT, path).replace(/\\photos\\/g, "\\").replace(/\/photos\//g, "/");
      await writeJson(join(DATA_ROOT, "photos", relativePath), value);
    }
  }
  await walk(SOURCE_ROOT);
}

await rm(DATA_ROOT, { recursive: true, force: true });
const locales = await readLocales();
await migrateEntities(locales);
await migrateTrips(locales);
await migratePhotos();
