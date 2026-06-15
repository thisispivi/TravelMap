import "./Container.scss";

import { PropsWithChildren, ReactNode } from "react";

import { classNames } from "@/utils/className";

import { Box } from "../Box/Box";

interface ContainerProps extends PropsWithChildren {
  className?: string;
  isVisible?: boolean;
}

/**
 * Container component
 *
 * Visibility-aware wrapper for boxed gallery content.
 *
 * @component
 *
 * @param {ContainerProps} props - The container props
 * @param {string} [props.className] - Additional class names
 * @param {boolean} [props.isVisible] - Whether the container is visible
 * @param {React.ReactNode} props.children - Container content
 * @returns {ReactNode} The gallery container
 */
export function Container({
  className = "",
  children,
  isVisible,
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
