import "./FilterByCountry.scss";

import { JSX, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";

import { Country } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { mobileAndTabletCheck } from "../../../utils/responsive";
import { Button, Checkbox, CountryFlag } from "../../atoms";

interface FilterByCountryProps {
  options: Country[];
  selected: Country[];
  onChange: (selected: Country[]) => void;
  buttonIcon?: ReactNode;
  className?: string;
}

export function FilterByCountry({
  options,
  selected,
  onChange,
  buttonIcon,
  className = "",
}: FilterByCountryProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const [isOpen, setIsOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.toggle("filter-open", isOpen);
    return () => {
      document.body.classList.remove("filter-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const allSelected = selected.length === options.length;

  const handleSelectAllToggle = () => {
    onChange(allSelected ? [] : options);
  };

  const handleCountryToggle = (country: Country) => {
    const newSelected = selected.includes(country)
      ? selected.filter((s) => s !== country)
      : [...selected, country];
    onChange(newSelected);
  };

  const getOptionClassName = (isSelected = false) => {
    const base = "filter__option";
    const mobile = mobileAndTabletCheck() ? "filter__option--mobile" : "";
    const sel = isSelected ? "filter__option--selected" : "";
    return `${base} ${sel} ${mobile}`.trim();
  };

  return (
    <>
      {createPortal(
        <CSSTransition
          classNames="filter-backdrop-transition"
          in={isOpen}
          nodeRef={backdropRef}
          timeout={200}
          unmountOnExit
        >
          <div
            className="filter-backdrop"
            onClick={() => setIsOpen(false)}
            ref={backdropRef}
            role="presentation"
          />
        </CSSTransition>,
        document.body,
      )}
      <div className="filter">
        <Button
          ariaLabel={t("filterTooltip")}
          className={`filter__button ${className} ${isOpen ? "filter__button--open" : ""}`}
          onClick={() => setIsOpen((o) => !o)}
          tooltipContent={t("filterTooltip")}
          tooltipId="base-tooltip"
        >
          {buttonIcon}
        </Button>
        <CSSTransition
          classNames="filter-transition"
          in={isOpen}
          nodeRef={nodeRef}
          timeout={200}
          unmountOnExit
        >
          <div className="filter__options" ref={nodeRef}>
            <div className="filter__options__list" id="info-tab">
              <div
                className={`${getOptionClassName()} filter__option--select-all`}
                onClick={handleSelectAllToggle}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleSelectAllToggle()
                }
                role="button"
                tabIndex={0}
              >
                <div className="filter__option--select-all__icon">
                  <Checkbox isChecked={allSelected} />
                </div>
                <h4 className="filter__option--select-all__text">
                  {allSelected ? t("deselectAll") : t("selectAll")}
                </h4>
              </div>
              {options.map((option) => (
                <div
                  className={getOptionClassName(selected.includes(option))}
                  key={option.id}
                  onClick={() => handleCountryToggle(option)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    handleCountryToggle(option)
                  }
                  role="button"
                  tabIndex={0}
                >
                  <CountryFlag countryId={option.id} />
                  <h4>{t(`countries.${option.id.replace(/\s+/g, "")}`)}</h4>
                </div>
              ))}
            </div>
          </div>
        </CSSTransition>
      </div>
    </>
  );
}
