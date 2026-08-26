import "./FallbackPage.scss";

import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { useThemeDetector } from "@/shared/hooks/useThemeDetector";
import { classNames } from "@/shared/lib/classNames";
import { getWithExpiry, setWithExpiry } from "@/shared/lib/storage";

const CHUNK_LOAD_FAILURE_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i;

/**
 * FallbackPage component
 * What the reader sees when the record cannot be opened. A stale chunk after a
 * deploy is the common cause and is recoverable, so that case reloads once
 * before showing anything; everything else is reported plainly with a way back
 * to the record.
 * @component
 * @returns {ReactNode} The error page
 */
export function FallbackPage(): ReactNode {
  const routerError = useRouteError();
  const { t } = useTranslation(["error"]);
  const { isDarkTheme } = useThemeDetector();
  const isHttpError = isRouteErrorResponse(routerError);
  const rawError =
    !isHttpError &&
    routerError != null &&
    typeof routerError === "object" &&
    "error" in routerError
      ? (routerError as { error: unknown }).error
      : routerError;
  const error = rawError instanceof Error ? rawError : null;

  /* A chunk that fails to load usually means the reader is holding an old
     build's index, so the page reloads itself once and only reports a failure
     if the fresh build fails too. */
  useEffect(() => {
    if (isHttpError || !error) return;
    if (!CHUNK_LOAD_FAILURE_PATTERN.test(error.message)) return;
    if (getWithExpiry("chunk_failed")) return;
    setWithExpiry("chunk_failed", "true", 10000);
    window.location.reload();
  }, [error, isHttpError]);

  const code = isHttpError ? String(routerError.status) : null;
  const title =
    isHttpError && routerError.status === 404
      ? t("notFound.title")
      : t("details.title");
  const detail = isHttpError
    ? routerError.statusText
    : (error?.message ??
      (typeof rawError === "string" ? rawError : t("details.subtitle")));

  return (
    <div
      className={classNames(
        "fallback-page",
        isDarkTheme ? "fallback-page--dark" : "fallback-page--light",
      )}
    >
      {code ? <p className="fallback-page__code figure">{code}</p> : null}
      <h1 className="fallback-page__title">{title}</h1>
      <p className="fallback-page__detail">{detail}</p>
      {error?.stack ? (
        <pre className="fallback-page__stack">{error.stack}</pre>
      ) : null}
      <Link className="fallback-page__back" to="/">
        {t("goToHome")}
      </Link>
    </div>
  );
}
