import "./PanelHeader.scss";

import { ReactNode } from "react";

import { classNames } from "../../lib/classNames";

/** Where the header stands: over a side panel or a full page. */
type PanelSurface = "side" | "page";

/**
 * Properties accepted by the PanelHeader component.
 * @property {ReactNode} title - The heading
 * @property {ReactNode} [subtitle] - A line under it, such as a count
 * @property {ReactNode} [action] - A button beside the heading
 * @property {ReactNode} [children] - Tools under the heading: a search, filters, year pills
 * @property {PanelSurface} [surface] - A side panel's header or a page's
 */
interface PanelHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  surface?: PanelSurface;
}

/**
 * PanelHeader component
 * The header every panel and page of both apps opens with: the heading with
 * a line under it, an optional action beside it, and the panel's tools below.
 * A `PanelFrame` holds it above the scrolling content.
 * @component
 * @param {PanelHeaderProps} props - The header props
 * @param {ReactNode} props.title - The heading
 * @param {ReactNode} [props.subtitle] - A line under it
 * @param {ReactNode} [props.action] - A button beside the heading
 * @param {ReactNode} [props.children] - Tools under the heading
 * @param {PanelSurface} [props.surface="side"] - A side panel's header or a page's
 * @returns {ReactNode} The header
 */
export function PanelHeader({
  title,
  subtitle,
  action,
  children,
  surface = "side",
}: PanelHeaderProps): ReactNode {
  const Heading = surface === "page" ? "h1" : "h2";

  return (
    <header className={classNames("panel-header", `panel-header--${surface}`)}>
      <div className="panel-header__top">
        <div className="panel-header__heading">
          <Heading className="panel-header__title">{title}</Heading>
          {subtitle ? (
            <p className="panel-header__subtitle">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </header>
  );
}
