import "./WorldCitySearch.scss";

import { classNames } from "@app/utils/className";
import { useCombobox } from "downshift";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAnchoredMenu } from "../../hooks/anchoredMenu";
import { searchWorldCities, WorldCity } from "../../worldCities";

const RESULT_LIMIT = 30;
const DEBOUNCE_MS = 180;

const menuVariants = {
  initial: { opacity: 0, scale: 0.98, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.1 } },
} as const;

/**
 * Formats a population for the result list.
 * @param {number} population - Inhabitants
 * @returns {string} A compact, human-readable count
 */
function formatPopulation(population: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(population);
}

/**
 * WorldCitySearch component
 * Searches the world gazetteer so a city's name, country, coordinates, and
 * timezone are all chosen rather than typed. The dataset is several megabytes,
 * so it loads on the first keystroke rather than with the page.
 * @component
 * @param {WorldCitySearchProps} props
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @param {(city: WorldCity) => void} props.onSelect - Called with the chosen city
 * @returns {ReactNode} The world city search field
 */
export function WorldCitySearch({
  hint,
  label,
  onSelect,
}: WorldCitySearchProps): ReactNode {
  const controlRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<WorldCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced so the gazetteer is queried once the author pauses, not on every
  // keystroke.
  useEffect(() => {
    if (term.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      searchWorldCities(term, RESULT_LIMIT, controller.signal)
        .then((matches) => {
          setResults(matches);
          setIsLoading(false);
        })
        .catch(() => {
          // An aborted request is a superseded keystroke, not a failure.
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term]);

  // Results are kept out of the render below a usable term rather than cleared
  // in the effect, so a stale list never flashes while typing.
  const visible = term.trim().length < 2 ? [] : results;

  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    isOpen,
  } = useCombobox({
    inputValue: term,
    items: visible,
    itemToString: (city) => city?.name ?? "",
    onInputValueChange: ({ inputValue }) => setTerm(inputValue ?? ""),
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;
      onSelect(selectedItem);
      setTerm("");
    },
    selectedItem: null,
  });
  const position = useAnchoredMenu(controlRef, isOpen);
  return (
    <div className="editor-field world-city-search">
      <label className="editor-field__label" {...getLabelProps()}>
        {label}
      </label>
      <div className="world-city-search__control" ref={controlRef}>
        <input
          className="editor-field__control world-city-search__input"
          {...getInputProps({ placeholder: "Search 135,000 cities worldwide" })}
        />
        {isLoading ? <span className="world-city-search__spinner" /> : null}
      </div>
      {createPortal(
        <LazyMotion features={domAnimation}>
          {/* Downshift needs its menu ref attached on every render, so the
              element stays mounted and is hidden rather than removed. */}
          <m.ul
            animate={isOpen && position ? "animate" : "initial"}
            className={classNames(
              "combobox__menu",
              "world-city-search__menu",
              !(isOpen && position) && "combobox__menu--hidden",
            )}
            initial="initial"
            style={
              position
                ? {
                    left: position.left,
                    maxHeight: position.maxHeight,
                    top:
                      position.placement === "top" ? undefined : position.top,
                    bottom:
                      position.placement === "top"
                        ? window.innerHeight - position.top
                        : undefined,
                    width: position.width,
                  }
                : undefined
            }
            variants={menuVariants}
            {...getMenuProps()}
          >
            {isOpen ? (
              <>
                {visible.map((city, index) => (
                  <li
                    className={classNames(
                      "combobox__option",
                      highlightedIndex === index &&
                        "combobox__option--highlighted",
                    )}
                    key={city.key}
                    {...getItemProps({ index, item: city })}
                  >
                    {city.country?.flagUrl ? (
                      <img
                        alt=""
                        className="combobox__icon"
                        src={city.country.flagUrl}
                      />
                    ) : (
                      <span className="combobox__icon combobox__icon--none" />
                    )}
                    <span className="combobox__option-label">{city.name}</span>
                    <span className="world-city-search__country">
                      {city.country?.name ?? city.countryCode}
                    </span>
                    <span className="combobox__option-hint">
                      {formatPopulation(city.population)}
                    </span>
                  </li>
                ))}
                {visible.length === 0 ? (
                  <li className="combobox__empty">
                    {term.trim().length < 2
                      ? "Type at least two letters"
                      : isLoading
                        ? "Searching…"
                        : "No matching city"}
                  </li>
                ) : null}
              </>
            ) : null}
          </m.ul>
        </LazyMotion>,
        document.body,
      )}
      {hint ? <span className="editor-field__hint">{hint}</span> : null}
    </div>
  );
}

/**
 * Props for WorldCitySearch.
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {(city: WorldCity) => void} onSelect - Called with the chosen city
 */
interface WorldCitySearchProps {
  hint?: string;
  label: string;
  onSelect: (city: WorldCity) => void;
}
