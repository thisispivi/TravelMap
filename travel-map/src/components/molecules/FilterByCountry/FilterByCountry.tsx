import "./FilterByCountry.scss";
import { Backdrop, Button, Checkbox, CountryFlag } from "../../atoms";
import { CSSTransition } from "react-transition-group";
import { Country } from "../../../core";
import { ReactNode, useState, JSX, useRef } from "react";
import { mobileAndTabletCheck } from "../../../utils/responsive";
import { useLanguage } from "../../../hooks/language/language";

interface FilterByCountryProps {
  options: Country[];
  selected: Country[];
  onChange: (selected: Country[]) => void;
  buttonIcon?: ReactNode;
  className?: string;
}

/**
 * FilterByCountry component
 *
 * The filter country component is used to filter countries.
 *
 * @component
 *
 * @param {FilterByCountryProps} props - The props of the component
 * @param {Country[]} props.options - The options
 * @param {Country[]} props.selected - The selected options
 * @param {(selected: Country[]) => void} props.onChange - The function to call when the selection changes
 * @param {ReactNode} props.buttonIcon - The icon of the button
 * @param {string} props.className - The class to apply to the filter country
 * @returns {JSX.Element} - The filter country
 */
export function FilterByCountry({
  options,
  selected,
  onChange,
  buttonIcon,
  className = "",
}: FilterByCountryProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const [isOpen, setIsOpen] = useState(false);
  const onIsOpenChange = () => setIsOpen(!isOpen);
  const nodeRef = useRef(null);

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

  const getOptionClassName = (isSelected: boolean = false) => {
    const baseClass = "filter__option";
    const mobileClass = mobileAndTabletCheck() ? "filter__option--mobile" : "";
    const selectedClass = isSelected ? "filter__option--selected" : "";

    return `${baseClass} ${selectedClass} ${mobileClass}`.trim();
  };

  return (
    <>
      {isOpen ? (
        <Backdrop
          className="filter-backdrop"
          isVisible={false}
          onClick={onIsOpenChange}
        />
      ) : null}
      <div className="filter">
        <Button
          ariaLabel={t("filterTooltip")}
          className={`filter__button ${className} ${
            isOpen ? "filter__button--open" : ""
          }`}
          onClick={onIsOpenChange}
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
                >
                  <CountryFlag countryId={option.id} />
                  <h4>{t(`countries.${option.id.replace(" ", "")}`)}</h4>
                </div>
              ))}
            </div>
          </div>
        </CSSTransition>
      </div>
    </>
  );
}
