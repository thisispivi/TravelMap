import { useNavigate, useRouteError } from "react-router-dom";
import { Button } from "../../atoms";
import { useTranslation } from "react-i18next";
import "./Fallback.scss";
import { ReactNode } from "react";
import { mobileAndTabletCheck } from "@/utils/responsive";
import useResponsive from "@/hooks/style/responsive";
import useThemeDetector from "@/hooks/style/theme";

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

  if (!routerError) return null;
  const error =
    typeof routerError === "object" &&
    routerError !== null &&
    "error" in routerError
      ? (routerError as { error: Error }).error
      : (routerError as Error);

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
