import { NavRail } from "@travelmap/ui/components/NavRail/NavRail";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import {
  CalendarRange,
  ChartColumn,
  Images,
  LucideIcon,
  MapPin,
  Route,
} from "lucide-react";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

import { NavTabId, useAppRoute } from "@/shared/context/AppRoute.context";
import { usePanel } from "@/shared/context/Panel.context";

/**
 * One navigation tab.
 * @property {NavTabId} id - The tab
 * @property {string} path - The route it opens
 * @property {LucideIcon} icon - Its icon
 */
interface NavTab {
  id: NavTabId;
  path: string;
  icon: LucideIcon;
}

const NAV_TABS: NavTab[] = [
  { icon: Route, id: "trips", path: "/trips" },
  { icon: MapPin, id: "places", path: "/places" },
  { icon: Images, id: "gallery", path: "/gallery" },
  { icon: CalendarRange, id: "timeline", path: "/timeline" },
  { icon: ChartColumn, id: "stats", path: "/stats" },
];

/**
 * Properties accepted by the AppNav component.
 * @property {boolean} isCompact - Whether the phone layout is active
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between light and dark
 */
interface AppNavProps {
  isCompact: boolean;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

/**
 * AppNav component
 * The site's sections on the shared rail. Choosing the tab already open
 * toggles its panel, so the map can be seen in full without leaving the tab,
 * and the logo shows the whole map.
 * @component
 * @param {AppNavProps} props - The navigation props
 * @param {boolean} props.isCompact - Whether the phone layout is active
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between light and dark
 * @returns {ReactNode} The navigation
 */
export function AppNav({
  isCompact,
  isDarkTheme,
  onToggleTheme,
}: AppNavProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activeTab, surface } = useAppRoute();
  const { isPanelOpen, setIsPanelOpen } = usePanel();

  /**
   * Opens a tab, or toggles its panel when it is already the open route.
   * @param {string} id - The chosen tab
   * @returns {void}
   */
  const handleSelectTab = (id: string): void => {
    const tab = NAV_TABS.find((candidate) => candidate.id === id);
    if (!tab) return;
    if (pathname === tab.path) {
      setIsPanelOpen(!isPanelOpen);
      return;
    }
    setIsPanelOpen(true);
    navigate(tab.path);
  };

  return (
    <NavRail
      activeId={activeTab ?? undefined}
      /* A page has its own header where floating tools would collide. */
      hasFloatingTools={surface !== "page"}
      isCompact={isCompact}
      isDarkTheme={isDarkTheme}
      items={NAV_TABS.map(({ icon, id, path }) => ({
        /* The site runs on a hash router, so a new tab needs the path after `#`. */
        href: `#${path}`,
        icon,
        id,
        label: t(`nav.${id}`),
      }))}
      logoLabel={t("goHome")}
      onLogo={() => navigate("/", { state: { mapOnly: true } })}
      onSelect={handleSelectTab}
      onToggleTheme={onToggleTheme}
    />
  );
}
