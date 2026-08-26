import "./BoundsCross.scss";

import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Bound, formatBoundDegrees } from "../../lib/bounds";

/**
 * Properties accepted by the BoundsCross component.
 * @property {Bound[]} bounds - The four places bounding the record
 */
interface BoundsCrossProps {
  bounds: Bound[];
}

/**
 * BoundsCross component
 * The four corners of the record, set out on a cross so each one sits in the
 * direction it names. Read as a list these are four city names; read as a cross
 * they are the outline of everywhere the record has been.
 * @component
 * @param {BoundsCrossProps} props - The bounds cross props
 * @param {Bound[]} props.bounds - The four places bounding the record
 * @returns {ReactNode} The bounds cross
 */
export function BoundsCross({ bounds }: BoundsCrossProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);

  return (
    <div className="bounds-cross">
      {bounds.map((bound) => (
        <div
          className={`bounds-cross__bound bounds-cross__bound--${bound.direction}`}
          key={bound.direction}
        >
          <span className="bounds-cross__direction">
            {t(`figures.bounds.${bound.direction}`)}
          </span>
          <span className="bounds-cross__city">
            {bound.city.getLocalizedName(lang)}
          </span>
          <span className="bounds-cross__degrees figure">
            {formatBoundDegrees(bound)}
          </span>
        </div>
      ))}
      <span aria-hidden className="bounds-cross__axis" />
    </div>
  );
}
