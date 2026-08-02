import "./FallbackPage.scss";

import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

import { Button } from "@/shared/components/Button/Button";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { useThemeDetector } from "@/shared/hooks/useThemeDetector";
import { mobileAndTabletCheck } from "@/shared/lib/responsive";
import { getWithExpiry, setWithExpiry } from "@/shared/lib/storage";

const CHUNK_LOAD_FAILURE_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i;

/**
 * FallbackPage component
 * Renders route and application errors and retries stale dynamic chunks once.
 * @component
 * @returns {ReactNode} The route error page
 */
export function FallbackPage(): ReactNode {
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
    if (
      isHttpError ||
      !error ||
      !CHUNK_LOAD_FAILURE_PATTERN.test(error.message)
    )
      return;
    if (!getWithExpiry("chunk_failed")) {
      setWithExpiry("chunk_failed", "true", 10000);
      window.location.reload();
    }
  }, [error, isHttpError]);

  const themeModifierClass = isDarkTheme
    ? "fallback-page--dark"
    : "fallback-page--light";
  const showStack =
    error?.stack && !mobileAndTabletCheck() && responsive.window.width > 980;

  if (isHttpError) {
    const is404 = routerError.status === 404;
    return (
      <div className={`fallback-page ${themeModifierClass}`}>
        <div className="fallback-page__content">
          <span className="fallback-page__code">{routerError.status}</span>
          <h1 className="fallback-page__title">
            {is404 ? t("notFound.title") : t("details.title")}
          </h1>
          <p className="fallback-page__subtitle">
            {is404 ? t("notFound.subtitle") : routerError.statusText}
          </p>
          <Button
            className="fallback-page__button"
            onClick={() => navigate("/")}
          >
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
    <div className={`fallback-page ${themeModifierClass}`}>
      <div className="fallback-page__content">
        <h1 className="fallback-page__title">{t("details.title")}</h1>
        <p className="fallback-page__subtitle">{t("details.subtitle")}</p>
        <p className="fallback-page__message">{errorMessage}</p>
        {showStack ? (
          <pre className="fallback-page__stack">{error!.stack}</pre>
        ) : null}
        <Button className="fallback-page__button" onClick={() => navigate("/")}>
          {t("goToHome")}
        </Button>
      </div>
    </div>
  );
}
