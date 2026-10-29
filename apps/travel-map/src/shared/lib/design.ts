import { z } from "zod";

import { readStoredString, writeStoredString } from "./storage";

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
  "dark-academia",
  "solarpunk",
  "vaporwave",
  "wabi-sabi",
  "retro-os",
  "darkroom",
  "nautical-chart",
  "memphis",
  "claymorphism",
  "newsprint",
  "liquid-glass",
  "material",
  "social-feed",
  "cyberpunk",
  "ukiyo-e",
  "mid-century",
  "pop-art",
  "nordic",
  "holographic",
  "azulejo",
  "boarding-pass",
]);

/** One of the visual designs the app can be rendered in. */
export type Design = z.infer<typeof DesignSchema>;

const STORAGE_KEY = "design";

const FONT_LINK_ID = "design-fonts";

/*
 * The Google Fonts families each design's stylesheet names, as css2 `family=`
 * queries. Urbanist is always loaded by index.html, so a design that only uses
 * it, or system fonts, loads nothing more; the rest load once picked instead of
 * every visitor downloading all of them.
 */
const DESIGN_FONTS: Record<Design, string | null> = {
  classic: null,
  passport:
    "IBM+Plex+Sans:wght@300;400;500;600;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400",
  risograph:
    "Space+Grotesk:wght@300;400;500;600;700&family=Big+Shoulders+Display:wght@600;700;800;900",
  softness:
    "Nunito:ital,wght@0,300..800;1,300..800&family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,0..100;1,9..144,300..700,0..100",
  "neo-brutalism":
    "Space+Grotesk:wght@300;400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,400..800",
  departures:
    "IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700",
  contour: "Inter+Tight:wght@400..800",
  phosphor: "IBM+Plex+Mono:wght@400;500;700&family=VT323",
  postage: "Inter+Tight:wght@400..800&family=Abril+Fatface",
  blueprint:
    "IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700",
  "art-deco": "Josefin+Sans:wght@300..700&family=Limelight",
  "field-notebook":
    "Nunito:ital,wght@0,300..800;1,300..800&family=Caveat:wght@400..700",
  "frutiger-aero": "Nunito:ital,wght@0,300..800;1,300..800",
  bauhaus: "Jost:wght@400..700",
  "metro-map": "Inter+Tight:wght@400..800",
  "dark-academia":
    "EB+Garamond:ital,wght@0,400..600;1,400..600&family=Cormorant+Garamond:wght@500..700",
  solarpunk: "Figtree:wght@400..700&family=Young+Serif",
  vaporwave: "Rubik:wght@400..700&family=Audiowide",
  "wabi-sabi":
    "Zen+Kaku+Gothic+New:wght@400;500;700&family=Shippori+Mincho:wght@500;700",
  "retro-os": "Silkscreen:wght@400;700",
  darkroom: "DM+Sans:wght@400..700&family=Oswald:wght@300..700",
  "nautical-chart": "Libre+Franklin:wght@400..700&family=IM+Fell+English+SC",
  memphis: "Rubik:wght@400..700&family=Bungee",
  claymorphism: "Quicksand:wght@400..700&family=Baloo+2:wght@400..800",
  newsprint:
    "Source+Serif+4:wght@400..600&family=Playfair+Display:wght@700..900",
  "liquid-glass": "Inter:wght@400..800",
  material: "Roboto:wght@400..700",
  "social-feed": null,
  cyberpunk: "Rajdhani:wght@500;600;700&family=Orbitron:wght@500..900",
  "ukiyo-e":
    "Zen+Maru+Gothic:wght@400;500;700&family=Kaisei+Tokumin:wght@500;700",
  "mid-century": "Work+Sans:wght@400..700&family=DM+Serif+Display",
  "pop-art": "Archivo:wght@400..800&family=Bangers",
  nordic: "Manrope:wght@400..800",
  holographic: "Syne:wght@400..800",
  azulejo: "Alegreya+Sans:wght@400;500;700&family=Alegreya:wght@400..800",
  "boarding-pass": "Google+Sans+Flex:opsz,wght,ROND@6..144,400..900,0..100",
};

/**
 * Reads the remembered design. localStorage is untrusted, so anything that is
 * not a known design falls back to the classic one.
 * @returns {Design} The remembered design, or classic
 */
export function readStoredDesign(): Design {
  const stored = DesignSchema.safeParse(readStoredString(STORAGE_KEY));
  return stored.success ? stored.data : "classic";
}

/**
 * Points the single design font stylesheet at a design's families, or removes
 * it when the design needs none beyond what index.html already loads.
 * @param {Design} design - The design whose fonts to load
 * @returns {void}
 */
function loadDesignFonts(design: Design): void {
  const families = DESIGN_FONTS[design];
  const existing = document.getElementById(FONT_LINK_ID);
  if (!families) {
    existing?.remove();
    return;
  }

  const link =
    existing instanceof HTMLLinkElement
      ? existing
      : document.head.appendChild(
          Object.assign(document.createElement("link"), {
            id: FONT_LINK_ID,
            rel: "stylesheet",
          }),
        );
  link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

/**
 * Remembers a design, loads its fonts, and mirrors it onto `<html
 * data-design>`, where the design stylesheets key off it.
 * @param {Design} design - The design to apply
 * @returns {void}
 */
export function applyDesign(design: Design): void {
  writeStoredString(STORAGE_KEY, design);
  document.documentElement.dataset.design = design;
  loadDesignFonts(design);
}
