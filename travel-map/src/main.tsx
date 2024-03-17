import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./components/pages/Home/Home";
import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_variables.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
