import "./StoryChapter.scss";

import { CoverImage } from "@app/shared/components/CoverImage/CoverImage";
import { classNames } from "@app/shared/lib/classNames";
import { ReactNode } from "react";

/**
 * Properties accepted by the StoryChapter component.
 * @property {ReactNode} node - What the spine's node shows: a stay's number, matching its pin, or a journey's mode
 * @property {"journey" | "stay"} kind - A move between places or a place slept in
 * @property {string} eyebrow - The line above the title: dates, nights, or role
 * @property {ReactNode} title - The chapter's title
 * @property {ReactNode} [action] - A control in the card's corner, such as remove
 * @property {string} [image] - A stay's picture, drawn as the card's banner
 * @property {ReactNode} [summary] - What a closed stay shows under its banner
 * @property {boolean} [isOpen] - Whether a stay's fields are showing
 * @property {() => void} [onToggle] - Opens or closes a stay
 * @property {ReactNode} children - The chapter's fields, or a journey's rides
 */
interface StoryChapterProps {
  node: ReactNode;
  kind: "journey" | "stay";
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
  image?: string;
  summary?: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

/**
 * StoryChapter component
 * One step of the itinerary as the site draws it: a node on the dashed
 * spine, numbered for a stay as its pin on the map is, beside the step. A stay
 * is a pass with the city's picture as its banner; pressing the banner opens
 * its fields under it, in the pass. A journey is a heading over its rides,
 * which are tickets that open themselves.
 * @component
 * @param {StoryChapterProps} props - The chapter props
 * @param {ReactNode} props.node - What the spine's node shows
 * @param {"journey" | "stay"} props.kind - A move or a place slept in
 * @param {string} props.eyebrow - The line above the title
 * @param {ReactNode} props.title - The chapter's title
 * @param {ReactNode} [props.action] - A control in the card's corner
 * @param {string} [props.image] - A stay's picture
 * @param {ReactNode} [props.summary] - What a closed stay shows
 * @param {boolean} [props.isOpen] - Whether a stay's fields are showing
 * @param {() => void} [props.onToggle] - Opens or closes a stay
 * @param {ReactNode} props.children - The chapter's fields or rides
 * @returns {ReactNode} The chapter
 */
export function StoryChapter({
  node,
  kind,
  eyebrow,
  title,
  action,
  image,
  summary,
  isOpen,
  onToggle,
  children,
}: StoryChapterProps): ReactNode {
  return (
    <li
      className={classNames(
        "story-chapter",
        `story-chapter--${kind}`,
        isOpen && "story-chapter--open",
      )}
    >
      <span aria-hidden="true" className="story-chapter__node">
        {node}
      </span>
      {kind === "stay" ? (
        <div className="story-chapter__pass">
          <button
            aria-expanded={isOpen}
            className="story-chapter__banner"
            onClick={onToggle}
            type="button"
          >
            <CoverImage className="story-chapter__image" src={image} />
            <span className="story-chapter__banner-text">
              <span className="story-chapter__eyebrow">{eyebrow}</span>
              <span className="story-chapter__title">{title}</span>
            </span>
          </button>
          {action ? (
            <span className="story-chapter__action">{action}</span>
          ) : null}
          {isOpen ? (
            <div className="story-chapter__body">{children}</div>
          ) : (
            summary
          )}
        </div>
      ) : (
        <div className="story-chapter__journey">
          <header className="story-chapter__header">
            <span className="story-chapter__heading">
              <span className="story-chapter__eyebrow">{eyebrow}</span>
              <span className="story-chapter__title">{title}</span>
            </span>
            {action}
          </header>
          <div className="story-chapter__rides">{children}</div>
        </div>
      )}
    </li>
  );
}
