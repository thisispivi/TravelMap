import "./DesignSelector.scss";

import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { Design, DesignSchema } from "@/shared/lib/design";

/**
 * Properties accepted by the DesignSelector component.
 * @property {Design} design - The active visual design
 * @property {(design: Design) => void} onChangeDesign - Called with the chosen design
 */
interface DesignSelectorProps {
  design: Design;
  onChangeDesign: (design: Design) => void;
}

/**
 * DesignSelector component
 * Switches between the app's visual designs. A native select is enough here:
 * it brings keyboard support and an accessible listbox for free.
 * @component
 * @param {DesignSelectorProps} props
 * @param {Design} props.design - The active visual design
 * @param {(design: Design) => void} props.onChangeDesign - Called with the chosen design
 * @returns {ReactNode} The design selector
 */
export function DesignSelector({
  design,
  onChangeDesign,
}: DesignSelectorProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <select
      aria-label={t("design.label")}
      className="design-selector"
      onChange={(event) =>
        onChangeDesign(DesignSchema.parse(event.target.value))
      }
      value={design}
    >
      {DesignSchema.options.map((option) => (
        <option key={option} value={option}>
          {t(`design.${option}`)}
        </option>
      ))}
    </select>
  );
}
