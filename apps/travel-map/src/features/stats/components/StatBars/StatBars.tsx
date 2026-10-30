import "./StatBars.scss";

import { easeOut } from "@travelmap/ui/lib/motion";
import { m } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

/**
 * One bar of a bar list.
 * @property {string} key - A stable id
 * @property {ReactNode} label - What the bar measures, with any icon or flag
 * @property {number} value - The measured value, which sets the bar's length
 * @property {string} display - The value as printed beside the bar
 * @property {string} [color] - The bar's colour; the accent when omitted
 */
interface StatBar {
  key: string;
  label: ReactNode;
  value: number;
  display: string;
  color?: string;
}

/**
 * Properties accepted by the StatBars component.
 * @property {StatBar[]} bars - The bars, in the order to show them
 */
interface StatBarsProps {
  bars: StatBar[];
}

/**
 * StatBars component
 * A ranked list of labelled bars, each as long as its share of the largest.
 * The bars grow in the first time the list scrolls into view. The list, not
 * each bar, watches for that: a bar that starts at zero width has no area to
 * intersect the viewport, so it would never be seen and never grow.
 * @component
 * @param {StatBarsProps} props - The list props
 * @param {StatBar[]} props.bars - The bars, in the order to show them
 * @returns {ReactNode} The bar list
 */
export function StatBars({ bars }: StatBarsProps): ReactNode {
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <m.ul
      className="stat-bars"
      initial="hidden"
      viewport={{ once: true }}
      whileInView="visible"
    >
      {bars.map((bar, index) => (
        <li className="stat-bars__row" key={bar.key}>
          <span className="stat-bars__label">{bar.label}</span>
          <span className="stat-bars__value">{bar.display}</span>
          <span className="stat-bars__track">
            <m.span
              className="stat-bars__fill"
              style={
                {
                  "--bar-color": bar.color,
                  width: `${(bar.value / max) * 100}%`,
                } as CSSProperties
              }
              transition={{ ...easeOut, delay: index * 0.03, duration: 0.6 }}
              variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
            />
          </span>
        </li>
      ))}
    </m.ul>
  );
}
