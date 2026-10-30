import "@travelmap/ui/styles/_global.scss";
import "@travelmap/ui/styles/_typography.scss";
import "@travelmap/ui/styles/_scrollbar.scss";
import "@travelmap/ui/map/lib/mapRuntime";

import { Loading } from "@travelmap/ui/components/Loading/Loading";
import {
  applyTheme,
  readInitialDarkTheme,
} from "@travelmap/ui/hooks/useThemeDetector";
import { initI18n } from "@travelmap/ui/i18n/i18n";
import { domMax, LazyMotion, MotionConfig } from "framer-motion";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { router } from "./app/routing/router";

/* Applied before the first render so a dark-theme reader never sees a light flash. */
applyTheme(readInitialDarkTheme());
initI18n(["home", "error"]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
     * The global reduced-motion CSS cannot reach framer-motion's JS-driven
     * animations; this makes them honour the same preference. `domMax` adds
     * the layout animations the sliding tab and segment indicators use.
     */}
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <Suspense
          fallback={
            <div className="app-loading">
              <Loading />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
);
