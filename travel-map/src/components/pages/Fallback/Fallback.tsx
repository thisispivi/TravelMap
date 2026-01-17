import { useNavigate, useRouteError } from "react-router-dom";
import { Button } from "../../atoms";
import { useTranslation } from "react-i18next";
import "./Fallback.scss";
import { ReactNode, useEffect } from "react";
import { mobileAndTabletCheck } from "@/utils/responsive";
import useResponsive from "@/hooks/style/responsive";
import useThemeDetector from "@/hooks/style/theme";
import { getWithExpiry, setWithExpiry } from "@/utils/storage";

/**
 * Fallback Component
 *
 * A component to display a fallback/error message with an option to navigate to the home page.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered Fallback component.
 */
export default function Fallback(): ReactNode | null {
  const responsive = useResponsive();
  const routerError = useRouteError();
  const { t } = useTranslation(["error"]);
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeDetector();

  const error =
    typeof routerError === "object" &&
    routerError !== null &&
    "error" in routerError
      ? (routerError as { error: Error }).error
      : (routerError as Error);

  useEffect(() => {
    const DYNAMIC_IMPORT_FAILURE_RE =
      /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i;
    if (!error || !(error instanceof Error)) return;
    if (error?.message && DYNAMIC_IMPORT_FAILURE_RE.test(error.message)) {
      if (!getWithExpiry("chunk_failed")) {
        setWithExpiry("chunk_failed", "true", 10000);
        window.location.reload();
      }
    }
  }, [error]);

  const isShowStack = !(
    mobileAndTabletCheck() || responsive.window.width <= 980
  );

  return (
    <div
      className={`fallback ${isDarkTheme ? "fallback--dark" : "fallback--light"}`}
    >
      <div className="fallback__content">
        <h1 className="fallback__content__title">{t("details.title")}</h1>
        <h2 className="fallback__content__subtitle">{t("details.subtitle")}</h2>
        <p className="fallback__content__message">{error.message}</p>
        {error.stack && isShowStack ? (
          <pre className="fallback__content__stack">{error.stack}</pre>
        ) : null}
        <Button
          className="fallback__content__button"
          onClick={() => navigate("/")}
        >
          {t("goToHome")}
        </Button>
      </div>
    </div>
  );
}
