import {
  animate,
  domAnimation,
  LazyMotion,
  m,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  formatFn?: (value: number) => string;
}

/**
 * AnimatedCounter component.
 *
 * @component
 * @param {AnimatedCounterProps} props - The props of the component.
 * @param {number} props.value - The final value to display.
 * @param {string} props.className - The class to apply to the counter.
 * @param {number} props.duration - The animation duration.
 * @param {function} props.formatFn - The formatter for the displayed value.
 * @returns {ReactNode} The AnimatedCounter component.
 */
export function AnimatedCounter({
  value,
  className = "",
  duration = 1.5,
  formatFn,
}: AnimatedCounterProps): ReactNode {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const displayedValue = useTransform(count, (latest) =>
    formatFn ? formatFn(Math.round(latest)) : `${Math.round(latest)}`,
  );

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, duration, isInView, value]);

  return (
    <LazyMotion features={domAnimation}>
      <m.span
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        className={className}
        initial={{ opacity: 0 }}
        ref={ref}
        transition={{ duration: 0.3 }}
      >
        <m.span>{displayedValue}</m.span>
      </m.span>
    </LazyMotion>
  );
}
