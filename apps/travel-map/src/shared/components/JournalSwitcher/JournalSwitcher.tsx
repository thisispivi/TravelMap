import "./JournalSwitcher.scss";

import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { ReactNode } from "react";
import { useNavigate, useNavigation } from "react-router";

import { useAppRoute } from "@/shared/context/AppRoute.context";
import { ResponsiveType } from "@/shared/hooks/useResponsive";
import { groupsJournal, JOURNAL_PAGES } from "@/shared/lib/journal";

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";

/**
 * Properties accepted by the journal selector.
 * @property {ResponsiveType} responsive - The shell's current viewport
 */
interface JournalSwitcherProps {
  responsive: ResponsiveType;
}

/**
 * JournalSwitcher component
 * Moves between the journal pages when they share one tab. With a tab for each
 * there is nothing left for it to do, so it draws nothing.
 * @component
 * @param {JournalSwitcherProps} props - The selector props
 * @param {ResponsiveType} props.responsive - The shell's current viewport
 * @returns {ReactNode} The switcher, or nothing while every page has a tab
 */
export function JournalSwitcher({
  responsive,
}: JournalSwitcherProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { activeTab } = useAppRoute();
  const current =
    JOURNAL_PAGES.find(({ path }) => path === navigation.location?.pathname) ??
    JOURNAL_PAGES.find(({ id }) => id === activeTab);

  if (!current || !groupsJournal(responsive)) return null;

  return (
    <div className="journal-switcher">
      <SegmentedControl
        id="journal"
        label={t("nav.journal")}
        onChange={(id) => {
          const page = JOURNAL_PAGES.find((candidate) => candidate.id === id);
          if (page) navigate(page.path);
        }}
        options={JOURNAL_PAGES.map(({ id }) => ({
          label: t(`nav.${id}`),
          value: id,
        }))}
        value={current.id}
      />
    </div>
  );
}
