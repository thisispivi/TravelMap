import "@app/styles/_global.scss";
import "@app/styles/_typography.scss";
import "@app/styles/_scrollbar.scss";
import "maplibre-gl/dist/maplibre-gl.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
