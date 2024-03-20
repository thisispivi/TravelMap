import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./components/pages/Home/Home";
import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_variables.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";

import "./i18n/i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
