import "./PanelFrame.scss";

import { ReactNode, Ref } from "react";

/**
 * Properties accepted by the PanelFrame component.
 * @property {ReactNode} [header] - What stays in place above the content
 * @property {ReactNode} children - The scrolling content
 * @property {Ref<HTMLDivElement>} [bodyRef] - The scrolling element, for panels that follow their scroll
 */
interface PanelFrameProps {
  header?: ReactNode;
  children: ReactNode;
  bodyRef?: Ref<HTMLDivElement>;
}

/**
 * PanelFrame component
 * Every panel and page in one shape: a header that stays where it is and a
 * body that scrolls beneath it. Content ends at the header's edge instead of
 * passing under it, which is what lets the panel itself be frosted glass.
 * @component
 * @param {PanelFrameProps} props - The frame props
 * @param {ReactNode} [props.header] - What stays in place above the content
 * @param {ReactNode} props.children - The scrolling content
 * @param {Ref<HTMLDivElement>} [props.bodyRef] - The scrolling element
 * @returns {ReactNode} The framed panel content
 */
export function PanelFrame({
  header,
  children,
  bodyRef,
}: PanelFrameProps): ReactNode {
  return (
    <div className="panel-frame">
      {header ? <div className="panel-frame__header">{header}</div> : null}
      <div className="panel-frame__body" ref={bodyRef}>
        {children}
      </div>
    </div>
  );
}
