import { ReactNode, useState } from "react";
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

export default function FilterCountry({
  options,
  selected,
  onChange,
  buttonIcon,
  className = "",
}: FilterCountryProps) {
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
          className={`filter__button ${className} ${isOpen ? "filter__button--open" : ""}`}
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
