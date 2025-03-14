import { ReactNode, useState, JSX } from "react";
import "./FilterCountry.scss";
import { Country } from "../../../core";
import { Backdrop, Button, CountryFlag } from "../../atoms";
import useLanguage from "../../../hooks/language/language";
import { CSSTransition } from "react-transition-group";
import { mobileAndTabletCheck } from "../../../utils/responsive";

interface FilterCountryProps {
  options: Country[];
  selected: Country[];
  onChange: (selected: Country[]) => void;
  buttonIcon?: ReactNode;
  className?: string;
}

/**
 * FilterCountry component
 *
 * The filter country component is used to filter countries.
 *
 * @component
 *
 * @param {FilterCountryProps} props - The props of the component
 * @param {Country[]} props.options - The options
 * @param {Country[]} props.selected - The selected options
 * @param {(selected: Country[]) => void} props.onChange - The function to call when the selection changes
 * @param {ReactNode} props.buttonIcon - The icon of the button
 * @param {string} props.className - The class to apply to the filter country
 * @returns {JSX.Element} - The filter country
 */
export default function FilterCountry({
  options,
  selected,
  onChange,
  buttonIcon,
  className = "",
}: FilterCountryProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const [isOpen, setIsOpen] = useState(false);
  const onIsOpenChange = () => setIsOpen(!isOpen);

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
          className={`filter__button ${className} ${isOpen ? "filter__button--open" : ""}`}
          data-tooltip-content={t("filterTooltip")}
          data-tooltip-id="base-tooltip"
          onClick={onIsOpenChange}
        >
          {buttonIcon}
        </Button>
        <CSSTransition
          classNames="filter-transition"
          in={isOpen}
          timeout={200}
          unmountOnExit
        >
          <div className="filter__options">
            <div className="filter__options__list" id="info-tab">
              {options.map((option) => (
                <div
                  className={`filter__option ${selected.includes(option) ? "filter__option--selected" : ""}
                    ${mobileAndTabletCheck() ? "filter__option--mobile" : ""}
                  `}
                  key={option.id}
                  onClick={() => {
                    const newSelected = selected.includes(option)
                      ? selected.filter((s) => s !== option)
                      : [...selected, option];
                    onChange(newSelected);
                  }}
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
