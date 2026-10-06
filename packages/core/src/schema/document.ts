import { z } from "zod";

import {
  CityJsonSchema,
  CountryJsonSchema,
  ImageSchema,
  SiteConfigSchema,
  TripJsonSchema,
} from "./index.ts";

/* Paths are portable across Windows and Unix and never address hidden files. */
const segment = "[^./\\\\:\\x00-\\x1f][^/\\\\:\\x00-\\x1f]*";

/** Dataset paths accepted by the editor, including nested photo manifests. */
export const DatasetPathSchema = z
  .string()
  .max(512)
  .regex(
    new RegExp(
      `^(?:site\\.config\\.json|trips/${segment}\\.json|cities/${segment}/${segment}(?:/${segment})?\\.json|photos/(?:${segment}/)*${segment}\\.json)$`,
    ),
    "Expected a site, trip, country, city, or photo document path.",
  );

/** A dataset document whose path selects its authoritative content schema. */
export const DatasetDocumentSchema = z
  .strictObject({
    path: DatasetPathSchema,
    value: z.unknown(),
  })
  .transform((document, context) => {
    const schema =
      document.path === "site.config.json"
        ? SiteConfigSchema
        : document.path.startsWith("trips/")
          ? TripJsonSchema
          : document.path.startsWith("photos/")
            ? ImageSchema.array()
            : document.path.split("/").length === 4
              ? CityJsonSchema
              : CountryJsonSchema;
    const parsed = schema.safeParse(document.value);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        context.addIssue({ ...issue, path: ["value", ...issue.path] });
      return z.NEVER;
    }
    return { path: document.path, value: parsed.data };
  });
