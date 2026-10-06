/// <reference types="node" />

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { isLegacyTrip, migrateTrip } from "./migrateTrip.ts";

/*
 * Converts every legacy trip under a data directory in place and prints what
 * the conversion was unsure about. Run from the repository root:
 *   node --experimental-transform-types packages/core/src/migration/migrateTrips.cli.ts data
 */
const tripsDirectory = join(process.argv[2] ?? "data", "trips");
const report: string[] = [];

for (const file of readdirSync(tripsDirectory).filter((name) =>
  name.endsWith(".json"),
)) {
  const path = join(tripsDirectory, file);
  const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!isLegacyTrip(raw)) continue;
  const { notes, trip } = migrateTrip(raw);
  writeFileSync(path, `${JSON.stringify(trip, null, 2)}\n`);
  report.push(`## ${file}`, ...notes.map((note) => `- ${note}`), "");
}

process.stdout.write(`${report.join("\n")}\n`);
