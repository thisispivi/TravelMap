import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.scss";
import "./styles/global.scss";
import "./styles/typography.scss";
import "./styles/animations.scss";
import "./styles/scrollbar.scss";
import "./styles/map.scss";
import "tippy.js/animations/scale.css";
import "tippy.js/animations/scale-subtle.css";
import "tippy.js/animations/scale-extreme.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/animations/shift-toward.css";
import "tippy.js/animations/perspective.css";
import "react-image-gallery/styles/scss/image-gallery.scss";
import "react-tooltip/dist/react-tooltip.css";
import "react-toggle/style.css";
import reportWebVitals from "./reportWebVitals";
import HomePage from "./HomePage";
import "./i18n/i18n";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);

reportWebVitals();
