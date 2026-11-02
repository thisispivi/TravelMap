import "./SettingsPage.scss";

import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { ComponentType, ReactNode } from "react";

import { AboutSection } from "../AboutSection/AboutSection";
import { AppearanceSection } from "../AppearanceSection/AppearanceSection";
import { LanguageSection } from "../LanguageSection/LanguageSection";

/* The page, in order. A new section is one component and one line here. */
const SECTIONS: { id: string; Section: ComponentType }[] = [
  { id: "appearance", Section: AppearanceSection },
  { id: "language", Section: LanguageSection },
  { id: "about", Section: AboutSection },
];

/**
 * SettingsPage component
 * The reader's preferences and where the site comes from, as cards on a page
 * over the map.
 * @component
 * @returns {ReactNode} The settings page
 */
export function SettingsPage(): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <PanelFrame
      header={<PanelHeader surface="page" title={t("settings.title")} />}
    >
      <div className="settings-page">
        {SECTIONS.map(({ id, Section }) => (
          <Section key={id} />
        ))}
      </div>
    </PanelFrame>
  );
}
