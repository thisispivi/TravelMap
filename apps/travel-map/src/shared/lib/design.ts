import { z } from "zod";

/*
 * The order here is the order the design selector lists them in. Each value
 * matches a `:root[data-design="…"]` block under `styles/designs/`.
 */
export const DesignSchema = z.enum([
  "classic",
  "passport",
  "risograph",
  "softness",
  "neo-brutalism",
  "departures",
  "contour",
  "phosphor",
  "postage",
  "blueprint",
  "art-deco",
  "field-notebook",
  "frutiger-aero",
  "bauhaus",
  "metro-map",
]);

/** One of the visual designs the app can be rendered in. */
export type Design = z.infer<typeof DesignSchema>;

const STORAGE_KEY = "design";

/**
 * Reads the remembered design. localStorage is untrusted, so anything that is
 * not a known design falls back to the classic one.
 * @returns {Design} The remembered design, or classic
 */
export function readStoredDesign(): Design {
  const stored = DesignSchema.safeParse(localStorage.getItem(STORAGE_KEY));
  return stored.success ? stored.data : "classic";
}

/**
 * Remembers a design and mirrors it onto `<html data-design>`, where the
 * design stylesheets key off it.
 * @param {Design} design - The design to apply
 * @returns {void}
 */
export function applyDesign(design: Design): void {
  localStorage.setItem(STORAGE_KEY, design);
  document.documentElement.dataset.design = design;
}
