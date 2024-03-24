import { PropsWithChildren } from "react";
import "./Box.scss";

interface BoxProps extends PropsWithChildren {
  className?: string;
}

/**
 * Box component
 *
 * The box component is used to display a box.
 *
 * @component
 *
 * @param {BoxProps} props - The props of the component
 * @param {string} [props.className] - The class name of the box
 * @returns {JSX.Element} - The box
 */
export default function Box(props: BoxProps): JSX.Element {
  return <div className={`box ${props.className || ""}`}>{props.children}</div>;
}
