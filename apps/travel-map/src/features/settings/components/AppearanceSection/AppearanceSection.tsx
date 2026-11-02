import "./AppearanceSection.scss";

import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import {
  MOTION_PREFERENCES,
  useMotionPreference,
} from "@travelmap/ui/hooks/useMotionPreference";
import {
  THEME_PREFERENCES,
  ThemePreference,
  useThemeDetector,
} from "@travelmap/ui/hooks/useThemeDetector";
import { LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { ReactNode } from "react";

import { SegmentedControl } from "@/shared/components/SegmentedControl/SegmentedControl";

import { SettingsSection } from "../SettingsSection/SettingsSection";

const THEME_ICONS: Record<ThemePreference, LucideIcon> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

/**
 * AppearanceSection component
 * The theme and how much the site moves. Both are shared stores, so the rail's
 * theme switch and this control always agree.
 * @component
 * @returns {ReactNode} The appearance card
 */
export function AppearanceSection(): ReactNode {
  const { t } = useLanguage(["home"]);
  const { themePreference, setThemePreference } = useThemeDetector();
  const { motionPreference, setMotionPreference } = useMotionPreference();

  return (
    <SettingsSection title={t("settings.appearance.title")}>
      <div className="appearance-section__setting">
        <span className="appearance-section__label">
          {t("settings.appearance.theme")}
        </span>
        <SegmentedControl
          id="settings-theme"
          label={t("settings.appearance.theme")}
          onChange={setThemePreference}
          options={THEME_PREFERENCES.map((value) => ({
            icon: THEME_ICONS[value],
            label: t(`settings.appearance.themes.${value}`),
            value,
          }))}
          value={themePreference}
        />
      </div>
      <div className="appearance-section__setting">
        <span className="appearance-section__label">
          {t("settings.appearance.motion")}
        </span>
        <SegmentedControl
          id="settings-motion"
          label={t("settings.appearance.motion")}
          onChange={setMotionPreference}
          options={MOTION_PREFERENCES.map((value) => ({
            label: t(`settings.appearance.motions.${value}`),
            value,
          }))}
          value={motionPreference}
        />
      </div>
    </SettingsSection>
  );
}
