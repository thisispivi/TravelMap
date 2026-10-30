import "@travelmap/ui/styles/_global.scss";
import "@travelmap/ui/styles/_typography.scss";
import "@travelmap/ui/styles/_scrollbar.scss";
import "./i18n/i18n";
import "./features/map/lib/mapRuntime";

import { domMax, LazyMotion, MotionConfig } from "framer-motion";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { router } from "./app/routing/router";
import { Loading } from "./shared/components/Loading/Loading";
import {
  applyTheme,
  readInitialDarkTheme,
} from "./shared/hooks/useThemeDetector";

/* Applied before the first render so a dark-theme reader never sees a light flash. */
applyTheme(readInitialDarkTheme());

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
