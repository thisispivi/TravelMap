import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./components/pages/Home/Home";
import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_variables.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";
import "./i18n/i18n";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { InfoTabFuture, InfoTabVisited } from "./components/organisms";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "/",
          element: <Home />,
          children: [
            { path: "visited", element: <InfoTabVisited /> },
            { path: "future", element: <InfoTabFuture /> },
          ],
        },
      ])}
    />
  </React.StrictMode>
);
