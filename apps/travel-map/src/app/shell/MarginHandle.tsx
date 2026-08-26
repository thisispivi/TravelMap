import "./MarginHandle.scss";

import { ReactNode } from "react";

import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMargin } from "@/shared/context/Margin.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

/**
 * MarginHandle component
 * The one control on the seam between the reading margin and the plate. It
 * folds the column away so the plate has the whole viewport, and is the only
 * way back once it is folded, which is why it stays anchored to the seam rather
 * than living in the margin it hides.
 * @component
 * @returns {ReactNode} The seam handle, or null while the gallery covers the spread
 */
export function MarginHandle(): ReactNode {
  const { isMarginOpen, setIsMarginOpen } = useMargin();
  const { isGallery } = useAppRoute();
  const { t } = useLanguage(["home"]);

  if (isGallery) return null;

  return (
    <button
      aria-expanded={isMarginOpen}
      aria-label={
        isMarginOpen ? t("spread.foldMargin") : t("spread.showMargin")
      }
      className={classNames(
        "margin-handle",
        !isMarginOpen && "margin-handle--folded",
      )}
      onClick={() => setIsMarginOpen(!isMarginOpen)}
      type="button"
    >
      <ChevronIcon aria-hidden className="margin-handle__chevron" />
    </button>
  );
}
