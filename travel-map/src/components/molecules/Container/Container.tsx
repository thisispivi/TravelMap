import { PropsWithChildren } from "react";
import "./Container.scss";
import { Box } from "..";

interface ContainerProps extends PropsWithChildren {
  className?: string;
  isVisible?: boolean;
}

/**
 * Container component
 *
 * The container component is used to display a container.
 *
 * @component
 *
 * @param {ContainerProps} props - The props of the component
 * @param {string} props.className - The class to apply to the gallery container
 * @param {boolean} props.isVisible - The visibility of the gallery container
 * @returns {JSX.Element} - The gallery container
 */
export default function Container({
  className = "",
  children,
  isVisible,
}: ContainerProps): JSX.Element {
  return (
    <div
      className={`gallery-container ${className} ${
        isVisible ? "gallery-container--visible" : ""
      }`}
    >
      <Box>{children}</Box>
    </div>
  );
}
