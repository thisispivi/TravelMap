import { NavRail } from "@travelmap/ui/components/NavRail/NavRail";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { Building2, MapPinned, Route, Settings } from "lucide-react";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

const NAV_TABS = [
  { icon: Route, id: "trips", to: "/" },
  { icon: MapPinned, id: "places", to: "/places" },
  { icon: Building2, id: "companies", to: "/companies" },
  { icon: Settings, id: "settings", to: "/settings" },
] as const;

/** One of the rail's tabs. */
type NavTabId = (typeof NAV_TABS)[number]["id"];

/**
 * Works out which tab a path belongs to: a trip belongs to Trips, a city or a
 * country to Places.
 * @param {string} pathname - The current path
 * @returns {NavTabId} The tab to highlight
 */
function activeTabId(pathname: string): NavTabId {
  if (pathname.startsWith("/places")) return "places";
  if (pathname.startsWith("/companies")) return "companies";
  if (pathname.startsWith("/settings")) return "settings";
  return "trips";
}

/**
 * Properties accepted by the EditorNav component.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between light and dark
 */
interface EditorNavProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

/**
 * EditorNav component
 * The editor's sections on the shared rail: one tab per kind of document,
 * with the logo leading back to the trips.
 * @component
 * @param {EditorNavProps} props - The rail props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between light and dark
 * @returns {ReactNode} The rail
 */
export function EditorNav({
  isDarkTheme,
  onToggleTheme,
}: EditorNavProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <NavRail
      activeId={activeTabId(pathname)}
      isDarkTheme={isDarkTheme}
      items={NAV_TABS.map(({ icon, id, to }) => ({
        href: to,
        icon,
        id,
        label: t(`nav.${id}`),
      }))}
      logoLabel={t("nav.brandHint")}
      onLogo={() => void navigate("/")}
      onSelect={(id) =>
        void navigate(NAV_TABS.find((tab) => tab.id === id)?.to ?? "/")
      }
      onToggleTheme={onToggleTheme}
    />
  );
}
