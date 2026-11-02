import "./SettingsSection.scss";

import { ReactNode, useId } from "react";

/**
 * Properties accepted by the SettingsSection component.
 * @property {string} title - The section's heading
 * @property {ReactNode} children - What the section holds
 */
interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * SettingsSection component
 * One card of the settings page: a heading and what it covers.
 * @component
 * @param {SettingsSectionProps} props - The section props
 * @param {string} props.title - The section's heading
 * @param {ReactNode} props.children - What the section holds
 * @returns {ReactNode} The section card
 */
export function SettingsSection({
  title,
  children,
}: SettingsSectionProps): ReactNode {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="settings-section">
      <h2 className="settings-section__title" id={headingId}>
        {title}
      </h2>
      {children}
    </section>
  );
}
