import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.scss";
import "./styles/typography.scss";
import "./styles/animations.scss";
import "./styles/scrollbar.scss";
import { Home } from "./components/pages";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
