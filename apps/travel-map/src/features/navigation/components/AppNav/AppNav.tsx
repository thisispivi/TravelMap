import { NavRail } from "@travelmap/ui/components/NavRail/NavRail";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import {
  CalendarRange,
  ChartColumn,
  Images,
  LucideIcon,
  MapPin,
  NotebookText,
  Route,
  Settings,
} from "lucide-react";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

import { NavTabId, useAppRoute } from "@/shared/context/AppRoute.context";
import { usePanel } from "@/shared/context/Panel.context";
import { ResponsiveType } from "@/shared/hooks/useResponsive";
import { groupsJournal, JOURNAL_PAGES } from "@/shared/lib/journal";

/**
 * One navigation tab.
 * @property {NavTabId | "journal"} id - The tab
 * @property {string} path - The route it opens
 * @property {LucideIcon} icon - Its icon
 */
interface NavTab {
  id: NavTabId | "journal";
  path: string;
  icon: LucideIcon;
}

const FIXED_TABS: NavTab[] = [
  { icon: Route, id: "trips", path: "/trips" },
  { icon: MapPin, id: "places", path: "/places" },
  { icon: Images, id: "gallery", path: "/gallery" },
];

const JOURNAL_ICONS: Record<(typeof JOURNAL_PAGES)[number]["id"], LucideIcon> =
  {
    stats: ChartColumn,
    timeline: CalendarRange,
  };

const JOURNAL_TAB: NavTab = {
  icon: NotebookText,
  id: "journal",
  path: JOURNAL_PAGES[0].path,
};

const SETTINGS_TAB: NavTab = {
  icon: Settings,
  id: "settings",
  path: "/settings",
};

/**
 * Lists the tabs for the room there is. The settings are a tab on a phone, whose
 * bar has no foot to hold them, and one of the rail's tools otherwise.
 * @param {boolean} isGrouped - Whether the journal pages share one tab
 * @param {boolean} isCompact - Whether the phone layout is active
 * @returns {NavTab[]} The tabs, in order
 */
function tabsFor(isGrouped: boolean, isCompact: boolean): NavTab[] {
  return [
    ...FIXED_TABS,
    ...(isGrouped
      ? [JOURNAL_TAB]
      : JOURNAL_PAGES.map(({ id, path }) => ({
          icon: JOURNAL_ICONS[id],
          id,
          path,
        }))),
    ...(isCompact ? [SETTINGS_TAB] : []),
  ];
}

/**
 * Properties accepted by the AppNav component.
 * @property {ResponsiveType} responsive - The current viewport
 */
interface AppNavProps {
  responsive: ResponsiveType;
}

/**
 * AppNav component
 * The site's sections on the shared rail, as many tabs as the window has room
 * for. Choosing the tab already open toggles its panel, so the map can be seen
 * in full without leaving the tab, and the logo shows the whole map.
 * @component
 * @param {AppNavProps} props - The navigation props
 * @param {ResponsiveType} props.responsive - The current viewport
 * @returns {ReactNode} The navigation
 */
export function AppNav({ responsive }: AppNavProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activeTab } = useAppRoute();
  const { isPanelOpen, setIsPanelOpen } = usePanel();
  const isGrouped = groupsJournal(responsive);
  const tabs = tabsFor(isGrouped, responsive.isCompact);
  const isOnJournalPage = JOURNAL_PAGES.some(({ id }) => id === activeTab);
  const activeId = isGrouped && isOnJournalPage ? "journal" : activeTab;

  /**
   * Opens a tab, or toggles its panel when it is already the open route. The
   * Journal tab stays where it is on any of its pages, rather than jumping back
   * to the first.
   * @param {string} id - The chosen tab
   * @returns {void}
   */
  const handleSelectTab = (id: string): void => {
    const tab = tabs.find((candidate) => candidate.id === id);
    if (!tab || (id === "journal" && activeId === "journal")) return;
    if (pathname === tab.path) {
      setIsPanelOpen(!isPanelOpen);
      return;
    }
    setIsPanelOpen(true);
    navigate(tab.path);
  };

  return (
    <NavRail
      activeId={activeId ?? undefined}
      isCompact={responsive.isCompact}
      items={tabs.map(({ icon, id, path }) => ({
        /* The site runs on a hash router, so a new tab needs the path after `#`. */
        href: `#${path}`,
        icon,
        id,
        label: t(`nav.${id}`),
      }))}
      logoLabel={t("goHome")}
      onLogo={() => navigate("/", { state: { mapOnly: true } })}
      onSelect={handleSelectTab}
      settings={{
        href: `#${SETTINGS_TAB.path}`,
        isActive: activeTab === "settings",
        label: t("nav.settings"),
        onSelect: () => navigate(SETTINGS_TAB.path),
      }}
    />
  );
}
