import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./components/pages/Home/Home";
import "./styles/global.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
);
