import "./JournalSwitcher.scss";

import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { ReactNode } from "react";
import { useNavigate } from "react-router";

import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { groupsJournal, JOURNAL_PAGES } from "@/shared/lib/journal";

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";

/**
 * JournalSwitcher component
 * Moves between the journal pages when they share one tab. With a tab for each
 * there is nothing left for it to do, so it draws nothing.
 * @component
 * @returns {ReactNode} The switcher, or nothing while every page has a tab
 */
export function JournalSwitcher(): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { activeTab } = useAppRoute();
  const responsive = useResponsive();
  const current = JOURNAL_PAGES.find(({ id }) => id === activeTab);

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
