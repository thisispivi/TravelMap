import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_variables.module.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";
import "./i18n/i18n";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { mobileAndTabletCheck } from "./utils/responsive";
import { Home, Fallback } from "./components/pages";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider
      router={createHashRouter([
        {
          path: "/",
          element: <Home />,
          errorElement: <Fallback />,
          children: [
            { path: "lived" },
            { path: "visited" },
            { path: "future" },
            { path: "stats" },
            {
              path: "gallery/:cityName/:travelIdx",
              lazy: async () => {
                const [{ default: Component }, { loader }] = await Promise.all([
                  import("./components/organisms/Gallery/Gallery"),
                  import("./components/organisms/Gallery/loader"),
                ]);
                return { Component, loader };
              },
              children: [
                {
                  path: ":photoIdx",
                  lazy: async () => {
                    const [{ default: Component }, { loader }] =
                      await Promise.all([
                        import("./components/organisms/Lightbox/Lightbox"),
                        import("./components/organisms/Lightbox/loader"),
                      ]);
                    return { Component, loader };
                  },
                },
              ],
            },
          ],
        },
      ])}
    />
    {!mobileAndTabletCheck() ? (
      <Tooltip
        className="tooltip"
        delayShow={300}
        id="base-tooltip"
        noArrow
        opacity={1}
      />
    ) : null}
  </React.StrictMode>,
);
