import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.scss";
import "./styles/animations.scss";
import "./styles/scrollbar.scss";
import "./styles/toggle.scss";
import "./styles/map.scss";
import "./styles/buttons.scss";
import "./styles/language.scss";
import "./styles/box.scss";
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
