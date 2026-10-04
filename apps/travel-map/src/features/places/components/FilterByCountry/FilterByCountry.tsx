import "./FilterByCountry.scss";

import { Country } from "@travelmap/core";
import { AnimatePresence, m } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/Button/Button";
import { Checkbox } from "@/shared/components/Checkbox/Checkbox";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { mobileAndTabletCheck } from "@/shared/lib/responsive";

/* Opening eases out over 180ms; closing is quicker so dismissal feels immediate. */
const ENTER = { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] } as const;
const EXIT = { duration: 0.14, ease: "easeOut" } as const;
const HIDDEN_OPTIONS = { opacity: 0, scale: 0.96, y: "-0.625rem" };

/**
 * Properties accepted by the FilterByCountry component.
 * @property {Country[]} options - The options
 * @property {Country[]} selected - The selected
 * @property {(selected: Country[]) => void} onChange - The on change
 * @property {ReactNode} [buttonIcon] - The button icon
 * @property {string} [className] - The class name
 */
interface FilterByCountryProps {
  options: Country[];
  selected: Country[];
  onChange: (selected: Country[]) => void;
  buttonIcon?: ReactNode;
  className?: string;
}

/**
 * Builds the class list for a country option.
 * @param {unknown} isSelected - Whether the country is selected
 * @returns {string} The option's BEM class list
 */
const getOptionClassName = (isSelected = false): string => {
  return classNames(
    "filter__option",
    isSelected && "filter__option--selected",
    mobileAndTabletCheck() && "filter__option--mobile",
  );
};

/**
 * FilterByCountry component
 * A toggle-button that opens a portal-rendered dropdown listing countries with
 * checkboxes. Supports a select-all toggle and closes on Escape or backdrop click.
 * @component
 * @param {FilterByCountryProps} props
 * @param {Country[]} props.options - The full list of countries to filter by
 * @param {Country[]} props.selected - Currently selected countries
 * @param {(selected: Country[]) => void} props.onChange - Called when the selection changes
 * @param {ReactNode} [props.buttonIcon] - Icon rendered inside the trigger button
 * @param {string} [props.className=""] - Additional class names for the trigger button
 * @returns {ReactNode} The filter dropdown
 */
export function FilterByCountry({
  options,
  selected,
  onChange,
  buttonIcon,
  className = "",
}: FilterByCountryProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const [isOpen, setIsOpen] = useState(false);
  const selectedSet = new Set(selected);

  useEffect(() => {
    document.body.classList.toggle("filter-open", isOpen);
    return () => {
      document.body.classList.remove("filter-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    /**
     * Closes the filter when the user presses Escape.
     * @param {KeyboardEvent} event - The window keyboard event
     * @returns {void}
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const allSelected = selected.length === options.length;

  /**
   * Selects every country or clears the current selection.
   * @returns {void}
   */
  const handleSelectAllToggle = (): void => {
    onChange(allSelected ? [] : options);
  };

  /**
   * Adds or removes one country from the active filter.
   * @param {Country} country - The country to toggle
   * @returns {void}
   */
  const handleCountryToggle = (country: Country): void => {
    const newSelected = selectedSet.has(country)
      ? selected.filter((s) => s !== country)
      : [...selected, country];
    onChange(newSelected);
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {isOpen ? (
            <m.div
              animate={{ opacity: 1, transition: ENTER }}
              className="filter-backdrop"
              exit={{ opacity: 0, transition: EXIT }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              role="presentation"
            />
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
      <div className="filter">
        <Button
          ariaLabel={t("filterTooltip")}
          className={classNames(
            "filter__button",
            className,
            isOpen && "filter__button--open",
          )}
          onClick={() => setIsOpen((o) => !o)}
          tooltipContent={t("filterTooltip")}
          tooltipId="base-tooltip"
        >
          {buttonIcon}
        </Button>
        <AnimatePresence>
          {isOpen ? (
            <m.div
              animate={{ opacity: 1, scale: 1, transition: ENTER, y: 0 }}
              className="filter__options"
              exit={{ ...HIDDEN_OPTIONS, transition: EXIT }}
              initial={HIDDEN_OPTIONS}
            >
              <div className="filter__options__list" id="info-tab">
                <button
                  className={classNames(
                    getOptionClassName(),
                    "filter__option--select-all",
                  )}
                  onClick={handleSelectAllToggle}
                  type="button"
                >
                  <div className="filter__option--select-all__icon">
                    <Checkbox isChecked={allSelected} />
                  </div>
                  <h4 className="filter__option--select-all__text">
                    {allSelected ? t("deselectAll") : t("selectAll")}
                  </h4>
                </button>
                {options.map((option) => (
                  <button
                    className={getOptionClassName(selectedSet.has(option))}
                    key={option.id}
                    onClick={() => handleCountryToggle(option)}
                    type="button"
                  >
                    <CountryFlag countryId={option.id} />
                    <h4>{option.getLocalizedName(currLanguage)}</h4>
                  </button>
                ))}
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
