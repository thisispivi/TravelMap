import "./styles/_global.scss";
import "./styles/_typography.scss";
import "./styles/_mixins.scss";
import "./styles/_scrollbar.scss";
import "./i18n/i18n";

import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { router } from "./app/routing/router";
import { BaseTooltip } from "./app/tooltip/BaseTooltip";
import { Loading } from "./shared/components/Loading/Loading";
import { mobileAndTabletCheck } from "./shared/lib/responsive";

const isMobileOrTablet = mobileAndTabletCheck();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="app-loading">
          <Loading />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
    {!isMobileOrTablet ? <BaseTooltip /> : null}
  </StrictMode>,
);
