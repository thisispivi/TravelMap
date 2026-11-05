import "./AboutSection.scss";

import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { ReactNode } from "react";

import { env } from "@/shared/lib/env";

import { formatBuildLine } from "../../lib/about";
import { SettingsSection } from "../SettingsSection/SettingsSection";

/*
 * Who made TravelMap and where its code lives. This credits the project, not the
 * site: a fork names itself through its site name and domain, and its About
 * still names the project's author and links the upstream repository.
 */
const AUTHOR = {
  avatar: "https://pivi-travel-map.b-cdn.net/LinkTree/Images/Profile.png",
  links: [
    { href: "https://github.com/thisispivi", label: "github.com/thisispivi" },
    { href: "https://linktree.pivi.dev", label: "linktree.pivi.dev" },
  ],
  name: "Andrea Piras (Pivi)",
  sourceUrl: "https://github.com/thisispivi/TravelMap",
} as const;

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
 * Who made TravelMap and what it is made of: its author with their links, the
 * build, the source code and the credits.
 * @component
 * @returns {ReactNode} The about card
 */
export function AboutSection(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);

  return (
    <SettingsSection title={t("settings.about.title")}>
      <div className="about-section__profile">
        <CoverImage
          className="about-section__avatar"
          isEager
          src={AUTHOR.avatar}
        />
        <div className="about-section__identity">
          <p className="about-section__name">{AUTHOR.name}</p>
          {AUTHOR.links.map(({ href, label }) => (
            <ExternalLink href={href} key={href}>
              {label}
            </ExternalLink>
          ))}
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
            <ExternalLink href={AUTHOR.sourceUrl}>
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
