import "./Container.scss";

import { ReactNode } from "react";

import { classNames } from "@/shared/lib/classNames";

import { Box } from "../Box/Box";

/**
 * Properties accepted by the Container component.
 * @property {string} [className] - The class name
 * @property {ReactNode} children - The children
 * @property {boolean} [isVisible] - Whether the container is visible
 */
interface ContainerProps {
  className?: string;
  children: ReactNode;
  isVisible?: boolean;
}

/**
 * Container component
 * Visibility-aware wrapper for boxed gallery content.
 * @component
 * @param {ContainerProps} props - The container props
 * @param {string} [props.className=""] - Additional class names
 * @param {ReactNode} props.children - Container content
 * @param {boolean} [props.isVisible=false] - Whether the container is visible
 * @returns {ReactNode} The gallery container
 */
export function Container({
  className = "",
  children,
  isVisible = false,
}: ContainerProps): ReactNode {
  return (
    <div
      className={classNames(
        "gallery-container",
        className,
        isVisible && "gallery-container--visible",
      )}
    >
      <Box>{children}</Box>
    </div>
  );
}
