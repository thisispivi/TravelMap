import { z } from "zod";

import { DatasetDocumentSchema } from "../../../../../../packages/core/src/schema/document.ts";

/** A complete validated copy of every authored JSON document. */
export const SnapshotBundleSchema = z.strictObject({
  createdAt: z.iso.datetime(),
  documents: z
    .array(DatasetDocumentSchema)
    .max(10_000)
    .refine(
      (documents) =>
        new Set(documents.map(({ path }) => path)).size === documents.length,
      "A snapshot cannot contain the same path twice.",
    ),
  reason: z.string().trim().min(1).max(200),
});

/** A complete copy of every authored JSON document. */
export type SnapshotBundle = z.infer<typeof SnapshotBundleSchema>;

/** The stored snapshot names returned by the local snapshot endpoint. */
export const SnapshotListSchema = z.strictObject({
  snapshots: z.array(z.string().min(1)),
});
