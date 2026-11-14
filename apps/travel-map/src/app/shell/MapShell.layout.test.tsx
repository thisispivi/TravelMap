/* @vitest-environment jsdom */

import { domMax, LazyMotion } from "framer-motion";
import { createInstance } from "i18next";
import { act, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
  useOutlet,
} from "react-router";
import { describe, expect, it, vi } from "vitest";

import { AppRouteContext } from "@/shared/context/AppRoute.context";
import { PanelContext } from "@/shared/context/Panel.context";

import { classifyPathname } from "../routing/useAppLocation";
import { MapShellLayout } from "./MapShell.layout";

/**
 * TestShell component
 * Supplies the real layout with route state while the map waits for browser idle.
 * @component
 * @returns {ReactNode} The routed page layout
 */
function TestShell(): ReactNode {
  const { pathname } = useLocation();
  const outlet = useOutlet();

  return (
    <AppRouteContext.Provider value={classifyPathname(pathname)}>
      <PanelContext.Provider
        value={{ isPanelOpen: true, setIsPanelOpen: () => undefined }}
      >
        <MapShellLayout
          isDarkTheme={false}
          outlet={outlet}
          pathname={pathname}
          responsive={{ isCompact: true, window: { height: 844, width: 390 } }}
        />
      </PanelContext.Provider>
    </AppRouteContext.Provider>
  );
}

describe("page loading handoff", () => {
  it.each(["settings", "passport"])(
    "replaces loading with %s while keeping journal controls mounted",
    async (destination) => {
      vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
      vi.stubGlobal("requestIdleCallback", () => 1);
      vi.stubGlobal("cancelIdleCallback", () => undefined);
      const language = createInstance();
      await language.init({
        lng: "en-US",
        resources: { "en-US": { home: {} } },
      });

      /**
       * Releases the pending route when the test's download completes.
       * @returns {void}
       */
      let finishLoading = (): void => undefined;
      const loading = new Promise<void>((resolve) => {
        finishLoading = resolve;
      });
      const router = createMemoryRouter(
        [
          {
            element: <TestShell />,
            children: [
              { element: <h1>Old page</h1>, path: "stats" },
              {
                element: <h1>New page</h1>,
                loader: () => loading,
                path: destination,
              },
            ],
          },
        ],
        { initialEntries: ["/stats"] },
      );
      const container = document.createElement("div");
      document.body.append(container);
      const root = createRoot(container);

      try {
        await act(async () => {
          root.render(
            <I18nextProvider i18n={language}>
              <LazyMotion features={domMax}>
                <RouterProvider router={router} />
              </LazyMotion>
            </I18nextProvider>,
          );
        });
        const header = container.querySelector(".map-shell__journal-header");
        const switcher = container.querySelector('[role="radiogroup"]');
        expect(header).not.toBeNull();
        expect(switcher).not.toBeNull();
        await act(async () => {
          void router.navigate(`/${destination}`);
        });
        expect(container.querySelector('[role="status"]')).not.toBeNull();
        const pending = container.querySelector(".map-shell__pending");
        expect(pending?.querySelector("button, header, h1")).toBeNull();
        expect(container.textContent).toContain("Old page");
        if (destination === "passport") {
          expect(container.querySelector(".map-shell__journal-header")).toBe(
            header,
          );
          expect(container.querySelector('[role="radiogroup"]')).toBe(switcher);
          expect(pending?.parentElement?.className).toBe("map-shell__outlet");
        }

        await act(async () => finishLoading());
        expect(container.querySelector('[role="status"]')).toBeNull();
        expect(container.textContent).toContain("New page");
        expect(container.textContent).not.toContain("Old page");
        if (destination === "passport") {
          expect(container.querySelector(".map-shell__journal-header")).toBe(
            header,
          );
          expect(container.querySelector('[role="radiogroup"]')).toBe(switcher);
        }
        for (const surface of container.querySelectorAll("main, main > div")) {
          expect(getComputedStyle(surface).opacity).not.toBe("0");
        }
      } finally {
        await act(async () => root.unmount());
        router.dispose();
        container.remove();
        vi.unstubAllGlobals();
      }
    },
  );
});
