import "./Fallback.scss";

import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

import { useResponsive } from "@/hooks/style/responsive";
import { useThemeDetector } from "@/hooks/style/theme";
import { mobileAndTabletCheck } from "@/utils/responsive";
import { getWithExpiry, setWithExpiry } from "@/utils/storage";

import { Button } from "../../atoms/Buttons/Button";

const CHUNK_FAIL_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i;

export function Fallback(): ReactNode {
  const routerError = useRouteError();
  const { t } = useTranslation(["error"]);
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeDetector();
  const responsive = useResponsive();

  const isHttpError = isRouteErrorResponse(routerError);

  const rawError =
    !isHttpError &&
    routerError != null &&
    typeof routerError === "object" &&
    "error" in routerError
      ? (routerError as { error: unknown }).error
      : routerError;

  const error = rawError instanceof Error ? rawError : null;

  useEffect(() => {
    if (isHttpError || !error || !CHUNK_FAIL_RE.test(error.message)) return;
    if (!getWithExpiry("chunk_failed")) {
      setWithExpiry("chunk_failed", "true", 10000);
      window.location.reload();
    }
  }, [error, isHttpError]);

  const themeClass = isDarkTheme ? "fallback--dark" : "fallback--light";
  const showStack =
    error?.stack && !mobileAndTabletCheck() && responsive.window.width > 980;

  if (isHttpError) {
    const is404 = routerError.status === 404;
    return (
      <div className={`fallback ${themeClass}`}>
        <div className="fallback__content">
          <span className="fallback__code">{routerError.status}</span>
          <h1 className="fallback__title">
            {is404 ? t("notFound.title") : t("details.title")}
          </h1>
          <p className="fallback__subtitle">
            {is404 ? t("notFound.subtitle") : routerError.statusText}
          </p>
          <Button className="fallback__button" onClick={() => navigate("/")}>
            {t("goToHome")}
          </Button>
        </div>
      </div>
    );
  }

  const errorMessage =
    error?.message ??
    (typeof rawError === "string" ? rawError : t("details.subtitle"));

  return (
    <div className={`fallback ${themeClass}`}>
      <div className="fallback__content">
        <h1 className="fallback__title">{t("details.title")}</h1>
        <p className="fallback__subtitle">{t("details.subtitle")}</p>
        <p className="fallback__message">{errorMessage}</p>
        {showStack ? (
          <pre className="fallback__stack">{error!.stack}</pre>
        ) : null}
        <Button className="fallback__button" onClick={() => navigate("/")}>
          {t("goToHome")}
        </Button>
      </div>
    </div>
  );
}
