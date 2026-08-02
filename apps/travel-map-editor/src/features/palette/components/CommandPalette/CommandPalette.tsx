import "./CommandPalette.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import Fuse from "fuse.js";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useNavigate } from "react-router";

import { useDataset } from "../../../../shared/hooks/useDataset";
import {
  Command,
  getCommands,
  subscribeToCommands,
} from "../../../../shared/lib/commands";

const FUSE_OPTIONS = {
  ignoreLocation: true,
  keys: [
    { name: "label", weight: 3 },
    { name: "hint", weight: 1 },
  ],
  threshold: 0.4,
};
const RESULT_LIMIT = 12;

/**
 * CommandPalette component
 * One keyboard route to everything: trips, places, settings, and whatever the
 * open screen has registered. It exists so no capability is reachable only by
 * finding the right button, which is the failure mode a three-pane tool drifts
 * into as it grows.
 * @component
 * @returns {ReactNode} The command palette
 */
export function CommandPalette(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const navigate = useNavigate();
  const dataset = useDataset();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const registered = useSyncExternalStore(subscribeToCommands, getCommands);

  useEffect(() => {
    /**
     * Opens the palette on the shortcut every tool of this shape uses.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    function handleKeyDown(event: KeyboardEvent): void {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k")
        return;
      event.preventDefault();
      setTerm("");
      setHighlighted(0);
      setIsOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  const navigation: Command[] = [
    {
      id: "go:library",
      label: t("palette.openLibrary"),
      run: () => void navigate("/"),
    },
    {
      id: "go:settings",
      label: t("palette.openSettings"),
      run: () => void navigate("/settings"),
    },
    ...dataset.trips.map((file) => ({
      hint: t("palette.trip"),
      id: `go:trip:${file.value.id}`,
      label: file.value.title || file.value.id,
      run: () => void navigate(`/trip/${file.value.id}`),
    })),
    ...dataset.cities.map((file) => ({
      hint: t("palette.city"),
      id: `go:city:${file.value.id}`,
      label: file.value.name,
      run: () => void navigate(`/places/cities/${file.value.id}`),
    })),
    ...dataset.countries.map((file) => ({
      hint: t("palette.country"),
      id: `go:country:${file.value.id}`,
      label: file.value.name,
      run: () => void navigate(`/places/countries/${file.value.id}`),
    })),
  ];
  const all = [...registered, ...navigation];
  const results = term.trim()
    ? new Fuse(all, FUSE_OPTIONS)
        .search(term)
        .slice(0, RESULT_LIMIT)
        .map((match) => match.item)
    : all.slice(0, RESULT_LIMIT);

  /**
   * Runs a command and closes the palette.
   * @param {Command} command - The command to run
   * @returns {void}
   */
  function choose(command: Command): void {
    setIsOpen(false);
    command.run();
  }

  /**
   * Moves the highlight or runs the highlighted command.
   * @param {import("react").KeyboardEvent<HTMLInputElement>} event - The key press
   * @returns {void}
   */
  function handleInputKeyDown(
    event: import("react").KeyboardEvent<HTMLInputElement>,
  ): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((current) => Math.min(current + 1, results.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    const command = results[highlighted];
    if (command) choose(command);
  }
  return (
    <dialog
      aria-label={t("palette.title")}
      className="command-palette"
      onCancel={() => setIsOpen(false)}
      onClose={() => setIsOpen(false)}
      ref={dialogRef}
    >
      {isOpen ? (
        <>
          <input
            aria-label={t("palette.title")}
            autoFocus
            className="command-palette__input"
            onChange={(event) => {
              setTerm(event.target.value);
              setHighlighted(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t("palette.placeholder")}
            value={term}
          />
          <ul className="command-palette__results">
            {results.map((command, index) => (
              <li key={command.id}>
                <button
                  className={classNames(
                    "command-palette__result",
                    index === highlighted &&
                      "command-palette__result--highlighted",
                  )}
                  onClick={() => choose(command)}
                  type="button"
                >
                  <span>{command.label}</span>
                  {command.hint ? (
                    <span className="command-palette__hint">
                      {command.hint}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
            {results.length === 0 ? (
              <li className="command-palette__empty">
                {t("palette.noMatches")}
              </li>
            ) : null}
          </ul>
        </>
      ) : null}
    </dialog>
  );
}
