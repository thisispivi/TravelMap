import { CompanyId } from "@travelmap/core";

import { resolveLogoUrl } from "./logos";
import { siteConfig } from "./world";

/**
 * Resolved presentation for one transport operator.
 * @property {string} name - The configured display name, or the raw id as a fallback
 * @property {string} [logo] - A browser-ready logo URL when the fork provides one
 */
export interface CompanyPresentation {
  name: string;
  logo?: string;
}

/**
 * Resolves how an operator id should be shown. Operators are fork-owned, so the
 * dataset's site configuration is the only source of names and logos — falling
 * back to the raw id keeps an operator a fork has not described yet readable
 * instead of rendering as a gap.
 * @param {CompanyId} company - The authored operator id
 * @returns {CompanyPresentation} The name and logo to render
 */
export function resolveCompany(company: CompanyId): CompanyPresentation {
  const configured = siteConfig?.companies?.[company];
  return {
    logo: resolveLogoUrl(configured?.logo),
    name: configured?.name ?? company,
  };
}
