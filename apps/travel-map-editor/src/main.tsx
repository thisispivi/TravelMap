import "@travelmap/ui/styles/_global.scss";
import "@travelmap/ui/styles/_typography.scss";
import "@travelmap/ui/styles/_scrollbar.scss";
import "@app/features/map/lib/mapRuntime";
import "maplibre-gl/dist/maplibre-gl.css";
import "./i18n/i18n";

import {
  applyTheme,
  readInitialDarkTheme,
} from "@app/shared/hooks/useThemeDetector";
import { domMax, LazyMotion, MotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { App } from "./App";
import { ToastProvider } from "./shared/components/Toast/Toast";
import { MapSceneProvider } from "./shared/context/MapScene.context";
import { SaveStatusProvider } from "./shared/context/SaveStatus.context";

/* The shared tokens switch on the body's theme class, so it is set before the first paint. */
applyTheme(readInitialDarkTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
     * The same motion setup as the site: reduced motion honoured, and the
     * full feature set the rail's sliding highlight and the panels need.
     */}
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <BrowserRouter>
          <ToastProvider>
            <SaveStatusProvider>
              <MapSceneProvider>
                <App />
              </MapSceneProvider>
            </SaveStatusProvider>
          </ToastProvider>
        </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
);
