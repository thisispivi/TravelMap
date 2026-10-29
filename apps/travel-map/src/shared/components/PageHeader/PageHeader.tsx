import "./PageHeader.scss";

import { ReactNode } from "react";

/**
 * Properties accepted by the PageHeader component.
 * @property {string} title - The page title
 * @property {ReactNode} [subtitle] - A line under the title, such as a count
 */
interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
}

/**
 * PageHeader component
 * The header the full pages share: the title with a line under it, held
 * above the scrolling content by the page's `PanelFrame`.
 * @component
 * @param {PageHeaderProps} props - The header props
 * @param {string} props.title - The page title
 * @param {ReactNode} [props.subtitle] - A line under the title
 * @returns {ReactNode} The page header
 */
export function PageHeader({ title, subtitle }: PageHeaderProps): ReactNode {
  return (
    <header className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
    </header>
  );
}
