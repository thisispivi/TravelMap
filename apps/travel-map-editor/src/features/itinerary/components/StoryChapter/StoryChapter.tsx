import "./StoryChapter.scss";

import { ReactNode } from "react";

/**
 * Properties accepted by the StoryChapter component.
 * @property {number} number - The chapter's position in the trip, from one
 * @property {"journey" | "stay"} kind - Whether it is travel or a place slept in
 * @property {string} [color] - The badge colour, a stay's country colour
 * @property {string} eyebrow - The small line above the title: what and when
 * @property {ReactNode} title - The chapter's title
 * @property {ReactNode} [action] - A control beside the title, such as remove
 * @property {ReactNode} children - The chapter's rows and fields
 */
interface StoryChapterProps {
  number: number;
  kind: "journey" | "stay";
  color?: string;
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * StoryChapter component
 * The frame every chapter of the trip story shares with the public trip page:
 * a numbered badge joined to the next chapter by a line, a small "what and
 * when" line, the title, then the chapter's content at full width. Keeping the
 * frame in one place is what keeps the editor and the site looking alike.
 * @component
 * @param {StoryChapterProps} props - The chapter props
 * @param {number} props.number - The chapter's position in the trip, from one
 * @param {"journey" | "stay"} props.kind - Whether it is travel or a place slept in
 * @param {string} [props.color] - The badge colour, a stay's country colour
 * @param {string} props.eyebrow - The small line above the title: what and when
 * @param {ReactNode} props.title - The chapter's title
 * @param {ReactNode} [props.action] - A control beside the title, such as remove
 * @param {ReactNode} props.children - The chapter's rows and fields
 * @returns {ReactNode} The chapter
 */
export function StoryChapter({
  number,
  kind,
  color,
  eyebrow,
  title,
  action,
  children,
}: StoryChapterProps): ReactNode {
  return (
    <li className={`story-chapter story-chapter--${kind}`}>
      <span
        className="story-chapter__number"
        style={color ? { background: color } : undefined}
      >
        {number}
      </span>
      <header className="story-chapter__header">
        <span className="story-chapter__heading">
          <span className="story-chapter__eyebrow">{eyebrow}</span>
          <span className="story-chapter__title">{title}</span>
        </span>
        {action}
      </header>
      <div className="story-chapter__body">{children}</div>
    </li>
  );
}
