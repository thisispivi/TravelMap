import "./Booklet.scss";

import { Button } from "@travelmap/ui/components/Button/Button";
import { classNames } from "@travelmap/ui/lib/classNames";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode, useRef } from "react";

import { usePageTurns } from "./Booklet.turns";

/**
 * One page of the booklet.
 * @property {string} id - Stable across renders
 * @property {ReactNode} content - What is printed on it
 * @property {boolean} [isHard] - Whether it is a cover, which swings rather than curls
 */
interface BookletPage {
  id: string;
  content: ReactNode;
  isHard?: boolean;
}

/**
 * Properties accepted by the Booklet component.
 * @property {BookletPage[]} pages - The pages, front cover first and back cover last
 * @property {number} page - The first page open
 * @property {boolean} isSingle - Whether one page shows at a time rather than a spread
 * @property {(page: number) => void} onTurn - Told the first page open after a turn
 * @property {string} indicator - Where the reader is, in words
 * @property {string} previousLabel - The name of the backward button
 * @property {string} nextLabel - The name of the forward button
 */
interface BookletProps {
  pages: BookletPage[];
  page: number;
  isSingle: boolean;
  onTurn: (page: number) => void;
  indicator: string;
  previousLabel: string;
  nextLabel: string;
}

/**
 * Booklet component
 * The passport as a book whose pages turn like paper, by drag, button or arrow
 * key (see `usePageTurns`). A spread turns its right page over to the left and
 * its left page back to the right; a page alone is bound on its left, so it
 * turns over to the left and the page before comes back from there. Covers
 * swing on the spine instead. The open pages and the two either side stay
 * mounted, so a turn finds the pages it uncovers ready; a blank back waits for
 * a page alone to show as it turns.
 * @component
 * @param {BookletProps} props - The booklet props
 * @param {BookletPage[]} props.pages - The pages, covers included
 * @param {number} props.page - The first page open
 * @param {boolean} props.isSingle - Whether one page shows at a time
 * @param {(page: number) => void} props.onTurn - Told the first page open after a turn
 * @param {string} props.indicator - Where the reader is, in words
 * @param {string} props.previousLabel - The name of the backward button
 * @param {string} props.nextLabel - The name of the forward button
 * @returns {ReactNode} The booklet
 */
export function Booklet({
  pages,
  page,
  isSingle,
  onTurn,
  indicator,
  previousLabel,
  nextLabel,
}: BookletProps): ReactNode {
  const bookRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef(new Map<number, HTMLElement>());
  const turns = usePageTurns({
    bookRef,
    hardPages: pages.map(({ isHard }) => Boolean(isHard)),
    isSingle,
    onTurn,
    page,
    pageRefs,
    paperRef,
  });

  const shown = new Set(turns.open);
  const first = turns.open[0] ?? 0;
  const last = turns.open.at(-1) ?? first;

  return (
    <div className="booklet">
      <div
        className={classNames(
          "booklet__book",
          isSingle && "booklet__book--single",
          !isSingle && first === 0 && "booklet__book--front",
          !isSingle &&
            first > 0 &&
            turns.open.length === 1 &&
            "booklet__book--back",
        )}
        onPointerCancel={turns.handlePointerUp}
        onPointerDown={turns.handlePointerDown}
        onPointerMove={turns.handlePointerMove}
        onPointerUp={turns.handlePointerUp}
        ref={bookRef}
      >
        {pages.slice(Math.max(0, first - 2), last + 3).map((sheet, offset) => {
          const index = Math.max(0, first - 2) + offset;
          const isShown = shown.has(index);
          return (
            <div
              aria-hidden={!isShown}
              className={classNames(
                "booklet__page",
                isSingle
                  ? "booklet__page--single"
                  : index % 2 === 1
                    ? "booklet__page--left"
                    : "booklet__page--right",
                sheet.isHard && "booklet__page--hard",
                !isShown && "booklet__page--away",
              )}
              inert={!isShown}
              key={sheet.id}
              ref={(element) => {
                if (element) pageRefs.current.set(index, element);
                return () => {
                  pageRefs.current.delete(index);
                };
              }}
            >
              {sheet.content}
              <div className="booklet__shade" />
            </div>
          );
        })}
        <div
          aria-hidden="true"
          className="booklet__page booklet__page--single booklet__page--away"
          ref={paperRef}
        >
          <div className="booklet__shade" />
        </div>
      </div>
      <div className="booklet__controls">
        <Button
          aria-label={previousLabel}
          className="booklet__turn"
          disabled={!turns.canTurnBack}
          isIconOnly
          onClick={() => turns.step(-1)}
          variant="soft"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <p aria-live="polite" className="booklet__indicator">
          {indicator}
        </p>
        <Button
          aria-label={nextLabel}
          className="booklet__turn"
          disabled={!turns.canTurnOn}
          isIconOnly
          onClick={() => turns.step(1)}
          variant="soft"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
