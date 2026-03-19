import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "./Button";

interface NavigableButtonProps {
  id: string;
  isButtonActive: boolean;
  defaultPath: string;
  icon: JSX.Element;
  className: string;
  activeClass: string;
  tooltipText: string;
}

/**
 * NavigableButton component
 *
 * The navigable button component is used to display a navigable button.
 *
 * @component
 *
 * @param {NavigableButtonProps} props - The props of the navigable button
 * @param {string} props.id - The id of the button
 * @param {boolean} props.isButtonActive - Whether the button is active
 * @param {string} props.defaultPath - The default path of the button
 * @param {JSX.Element} props.icon - The icon of the button
 * @param {string} props.className - The class name of the button
 * @param {string} props.activeClass - The class
 * @param {string} props.tooltipText - The tooltip text of the button
 * @returns {JSX.Element} - The navigable button
 */
export function NavigableButton({
  id,
  isButtonActive,
  defaultPath,
  icon,
  className,
  activeClass,
  tooltipText,
}: NavigableButtonProps): JSX.Element {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <Link
      data-tooltip-content={tooltipText}
      data-tooltip-id="base-tooltip"
      key={id}
      to={isButtonActive ? "/" : defaultPath}
    >
      <LazyMotion features={domAnimation}>
        <m.div
          animate={isButtonActive ? { scale: 1.05 } : { scale: 1 }}
          onAnimationComplete={() => setIsAnimating(false)}
          onAnimationStart={() => setIsAnimating(true)}
          style={isAnimating ? { willChange: "transform" } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            ariaLabel={tooltipText}
            className={`${className} ${isButtonActive ? activeClass : ""}`}
          >
            {icon}
          </Button>
        </m.div>
      </LazyMotion>
    </Link>
  );
}
