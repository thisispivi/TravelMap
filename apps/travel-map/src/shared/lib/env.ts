import { z } from "zod";

/*
 * Build-time configuration. Vite inlines these at build time, so an invalid
 * value is a build-machine mistake rather than a visitor's: parsing once here
 * turns it into one readable message instead of a broken embed or a feature that
 * silently never appears. `VITE_CDN_PATH` is deliberately absent — media paths
 * are resolved by `mediaUrl` in @travelmap/core, which both apps share.
 */
const EnvSchema = z.object({
  DEV: z.boolean(),
  VITE_SHOW_FUTURE_TRIPS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  VITE_YOUTUBE_PATH: z.url().default("https://www.youtube.com/embed/"),
});

/**
 * Validated build-time environment.
 * @property {boolean} DEV - Whether Vite is serving a development build
 * @property {boolean} VITE_SHOW_FUTURE_TRIPS - Whether planned trips are listed
 * @property {string} VITE_YOUTUBE_PATH - Base URL used to embed authored videos
 */
export type Env = z.infer<typeof EnvSchema>;

/**
 * Parses the build-time environment, naming the offending variable when it is
 * wrong. A raw Zod error thrown from module scope is unreadable in a browser
 * console, and this is the first thing a fork gets wrong after copying
 * `env/.env.example`.
 * @returns {Env} The validated environment
 */
function readEnv(): Env {
  const result = EnvSchema.safeParse(import.meta.env);
  if (result.success) return result.data;

  const problems = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(
    `Invalid environment in apps/travel-map/env/.env — ${problems}`,
  );
}

export const env: Env = readEnv();
