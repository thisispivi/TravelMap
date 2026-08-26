import { resolveLogoUrl } from "@/data/logos";
import { siteConfig } from "@/data/world";

/**
 * How a carrier is presented in the record.
 * @property {string} name - The carrier's display name
 * @property {string} [logoUrl] - Its bundled logo, when the dataset ships one
 */
export interface Carrier {
  name: string;
  logoUrl?: string;
}

/**
 * Reads how a carrier should be presented. Carriers are authored per dataset,
 * so an unknown id falls back to the id itself rather than disappearing — a
 * fork that names an operator the config does not describe still reads.
 * @param {string | undefined} companyId - The authored company id
 * @returns {Carrier | null} The carrier's presentation, or null when the leg has no operator
 */
export function readCarrier(companyId: string | undefined): Carrier | null {
  if (!companyId) return null;
  const authored = siteConfig?.companies?.[companyId];
  return {
    name: authored?.name ?? companyId,
    logoUrl: resolveLogoUrl(authored?.logo),
  };
}
