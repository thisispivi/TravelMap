import "./AboutSection.scss";

import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { ExternalLink as ExternalLinkIcon, UserRound } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@/data/world";
import { env } from "@/shared/lib/env";

import {
  formatBuildLine,
  initialsOf,
  resolveAvatarUrl,
  UPSTREAM_SOURCE_URL,
  websiteOf,
} from "../../lib/about";
import { SettingsSection } from "../SettingsSection/SettingsSection";

/*
 * What the site really ships: flags, the country borders behind the map's fills,
 * and the renderer. The map has no tile source, so nothing from OpenStreetMap.
 */
const CREDITS = [
  { href: "https://github.com/jdecked/twemoji", id: "creditTwemoji" },
  { href: "https://www.naturalearthdata.com", id: "creditNaturalEarth" },
  { href: "https://maplibre.org", id: "creditMapLibre" },
] as const;

/**
 * Properties accepted by the ExternalLink component.
 * @property {string} href - Where the link goes
 * @property {string} children - Its visible text
 */
interface ExternalLinkProps {
  href: string;
  children: string;
}

/**
 * ExternalLink component
 * A link that opens in a new tab, says so to a screen reader, and shows it.
 * @component
 * @param {ExternalLinkProps} props - The link props
 * @param {string} props.href - Where the link goes
 * @param {string} props.children - Its visible text
 * @returns {ReactNode} The link
 */
function ExternalLink({ href, children }: ExternalLinkProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <a
      aria-label={t("settings.about.opensInNewTab", { name: children })}
      className="about-section__link"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
      <ExternalLinkIcon
        aria-hidden="true"
        className="about-section__link-icon"
      />
    </a>
  );
}

/**
 * AboutSection component
 * Who made this site and what it is made of: the author, the build, the source
 * code and the credits.
 * @component
 * @returns {ReactNode} The about card
 */
export function AboutSection(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const site = siteConfig?.site;
  const name = site?.author?.trim() || site?.name;
  const initials = initialsOf(name ?? "");
  const avatarUrl = resolveAvatarUrl(site?.avatar);
  const website = websiteOf(site?.website ?? site?.domain);

  return (
    <SettingsSection title={t("settings.about.title")}>
      <div className="about-section__profile">
        {avatarUrl ? (
          <CoverImage
            className="about-section__avatar"
            isEager
            src={avatarUrl}
          />
        ) : (
          <span aria-hidden="true" className="about-section__avatar">
            {initials || <UserRound className="about-section__avatar-icon" />}
          </span>
        )}
        <div className="about-section__identity">
          {name ? <p className="about-section__name">{name}</p> : null}
          {website ? (
            <ExternalLink href={website.href}>{website.host}</ExternalLink>
          ) : null}
        </div>
      </div>
      <dl className="about-section__facts">
        <div className="about-section__fact">
          <dt className="about-section__label">
            {t("settings.about.version")}
          </dt>
          <dd className="about-section__value">
            {formatBuildLine(
              {
                commit: env.VITE_BUILD_COMMIT,
                date: env.VITE_BUILD_DATE,
                version: env.VITE_BUILD_VERSION,
              },
              currLanguage,
            )}
          </dd>
        </div>
        <div className="about-section__fact">
          <dt className="about-section__label">{t("settings.about.source")}</dt>
          <dd className="about-section__value">
            <ExternalLink href={site?.sourceUrl ?? UPSTREAM_SOURCE_URL}>
              {t("settings.about.sourceLink")}
            </ExternalLink>
          </dd>
        </div>
        <div className="about-section__fact">
          <dt className="about-section__label">
            {t("settings.about.credits")}
          </dt>
          {CREDITS.map(({ href, id }) => (
            <dd className="about-section__value" key={id}>
              <ExternalLink href={href}>
                {t(`settings.about.${id}`)}
              </ExternalLink>
            </dd>
          ))}
        </div>
      </dl>
    </SettingsSection>
  );
}
