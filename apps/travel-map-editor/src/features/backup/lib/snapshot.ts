import { z } from "zod";

/** A complete validated copy of every authored JSON document. */
export const SnapshotBundleSchema = z.strictObject({
  createdAt: z.iso.datetime(),
  documents: z
    .array(
      z.strictObject({
        path: z.string().trim().min(1).max(512),
        value: z.unknown(),
      }),
    )
    .max(10_000),
  reason: z.string().trim().min(1).max(200),
});

/** A complete copy of every authored JSON document. */
export type SnapshotBundle = z.infer<typeof SnapshotBundleSchema>;

/** The stored snapshot names returned by the local snapshot endpoint. */
export const SnapshotListSchema = z.strictObject({
  snapshots: z.array(z.string().min(1)),
});
