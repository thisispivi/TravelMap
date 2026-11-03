import "./Stamp.scss";

import { ColorData } from "@travelmap/core";
import { CSSProperties, ReactNode, useId } from "react";

import { classNames } from "../lib/classNames";
import variables from "../styles/_variables.module.scss";
import {
  fitLine,
  fitName,
  FRAME_GEOMETRY,
  StampFrame,
  StampTextStyle,
  stampTilt,
} from "./frames";
import { inkFor } from "./ink";

const LINE_MAX = 10;
const LINE_MIN = 6;
const WRAP_SHRINK = 8;

/**
 * Properties accepted by the StampEmblem component.
 * @property {string} drawing - The drawing's path
 * @property {number} [x] - Its left edge on the stamp
 * @property {number} [y] - Its top edge on the stamp
 * @property {number} [size] - Its width and height on the stamp
 */
interface StampEmblemProps {
  drawing: string;
  x?: number;
  y?: number;
  size?: number;
}

/**
 * StampEmblem component
 * A country's drawing: one path in the ink's colour, on its own 64×64 canvas.
 * @component
 * @param {StampEmblemProps} props - The emblem props
 * @param {string} props.drawing - The drawing's path
 * @param {number} [props.x] - Its left edge on the stamp
 * @param {number} [props.y] - Its top edge on the stamp
 * @param {number} [props.size] - Its width and height on the stamp
 * @returns {ReactNode} The drawing
 */
export function StampEmblem({
  drawing,
  x,
  y,
  size,
}: StampEmblemProps): ReactNode {
  return (
    <svg height={size} viewBox="0 0 64 64" width={size} x={x} y={y}>
      <path
        d={drawing}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * How the stamp's ink is carried: both themes' inks at once, for the stylesheet
 * to choose between, plus the tilt. Theme switches then need no render.
 * @param {ColorData} color - The country's colour
 * @param {string} id - The country's id
 * @returns {CSSProperties} The stamp's custom properties
 */
function stampStyle(color: ColorData, id: string): CSSProperties {
  /**
   * Writes an ink as a CSS colour.
   * @param {string} paper - The page it is printed on
   * @returns {string} The colour
   */
  const ink = (paper: string): string => {
    const { h, s, l } = inkFor(color, paper);
    return `hsl(${h} ${s}% ${l}%)`;
  };
  const tilt = stampTilt(id);
  /* CSSProperties has no keys for custom properties, hence the cast. */
  return {
    "--stamp-ink-dark": ink(variables.passportPaperDark),
    "--stamp-ink-light": ink(variables.passportPaperLight),
    "--stamp-tilt": `${tilt}deg`,
  } as CSSProperties;
}

/**
 * StampInk component
 * The filter every stamp's ink goes through, drawn once wherever stamps are: fine
 * grain displaces the edges as rubber on paper does, and broad blotches thin the
 * ink in patches, as an unevenly inked stamp leaves it.
 * @component
 * @returns {ReactNode} The filter's definition, which draws nothing itself
 */
export function StampInk(): ReactNode {
  return (
    <svg aria-hidden="true" className="stamp-ink" focusable="false">
      <filter height="120%" id="stamp-ink" width="120%" x="-10%" y="-10%">
        <feTurbulence
          baseFrequency="0.85"
          numOctaves="2"
          result="grain"
          seed="3"
          type="fractalNoise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="grain"
          result="worn"
          scale="1.3"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feTurbulence
          baseFrequency="0.05"
          numOctaves="2"
          result="blotch"
          seed="11"
          type="fractalNoise"
        />
        <feColorMatrix
          in="blotch"
          result="coverage"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.55"
        />
        <feColorMatrix
          in="grain"
          result="pits"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -6.5 5.3"
        />
        <feComposite in="worn" in2="coverage" operator="in" result="patchy" />
        <feComposite in="patchy" in2="pits" operator="in" />
      </filter>
    </svg>
  );
}

/**
 * Properties accepted by the Stamp component.
 * @property {string} id - The country's id, which decides its tilt
 * @property {string} name - The country's name in the reader's language
 * @property {ColorData} color - The colour its ink is made from
 * @property {StampFrame} frame - Its shape
 * @property {StampTextStyle} textStyle - How the name is set
 * @property {string} [emblem] - The drawing, once its chunk has arrived
 * @property {string[]} [lines] - Up to two small lines, such as the date and the city
 * @property {boolean} [isPencil] - Whether it is a planned stamp, drawn faintly in pencil
 * @property {string} [className] - Extra classes from the owning block
 */
interface StampProps {
  id: string;
  name: string;
  color: ColorData;
  frame: StampFrame;
  textStyle: StampTextStyle;
  emblem?: string;
  lines?: string[];
  isPencil?: boolean;
  className?: string;
}

/**
 * Stamp component
 * A passport stamp, drawn whole in one SVG: the frame, the drawing, the country's
 * name set along or across the frame as live text, and the details below. It is
 * decorative to assistive technology: whoever places it names what it says.
 * @component
 * @param {StampProps} props - The stamp props
 * @param {string} props.id - The country's id
 * @param {string} props.name - The country's name in the reader's language
 * @param {ColorData} props.color - The colour its ink is made from
 * @param {StampFrame} props.frame - Its shape
 * @param {StampTextStyle} props.textStyle - How the name is set
 * @param {string} [props.emblem] - The drawing, once its chunk has arrived
 * @param {string[]} [props.lines=[]] - Up to two small lines
 * @param {boolean} [props.isPencil=false] - Whether it is a planned stamp
 * @param {string} [props.className] - Extra classes from the owning block
 * @returns {ReactNode} The stamp
 */
export function Stamp({
  id,
  name,
  color,
  frame,
  textStyle,
  emblem,
  lines = [],
  isPencil = false,
  className,
}: StampProps): ReactNode {
  const arcId = `stamp-arc-${useId().replace(/\W/g, "")}`;
  const geometry = FRAME_GEOMETRY[frame];
  const isCurved = textStyle === "curved" && Boolean(geometry.arc);
  const fittedName = fitName(name, geometry, isCurved ? "curved" : textStyle);
  const isWrapped = fittedName.lines.length > 1;
  /* Missing lines leave room: the drawing grows into it, or the block recentres. */
  const spare = (geometry.lines.length - lines.length) * 10;
  /* A wrapped name takes a line's height from the drawing. */
  const emblemSize =
    geometry.emblemSize +
    (geometry.emblemGrows ? spare : 0) -
    (isWrapped ? WRAP_SHRINK : 0);
  const shift = geometry.emblemGrows ? 0 : spare / 2;
  const nameShift = isWrapped ? fittedName.size / 2 + 0.5 : 0;
  /* Under a square top a wrapped name grows downwards, clear of the rule above it. */
  const firstLineLift = geometry.emblemGrows ? (isWrapped ? 1 : 0) : nameShift;
  /* A wrapped name in a peaked frame sits above the lines, so it pushes them down. */
  const lineShift = isWrapped && !geometry.emblemGrows ? nameShift : 0;

  return (
    <svg
      aria-hidden="true"
      className={classNames("stamp", isPencil && "stamp--pencil", className)}
      style={stampStyle(color, id)}
      viewBox="0 0 120 120"
    >
      <path className="stamp__rule" d={geometry.outline} />
      {geometry.inner ? (
        <path
          className={classNames(
            "stamp__rule",
            "stamp__rule--inner",
            geometry.innerBorder && `stamp__rule--${geometry.innerBorder}`,
          )}
          d={geometry.inner}
        />
      ) : null}
      {isCurved && geometry.arc ? (
        <>
          <path className="stamp__arc" d={geometry.arc.path} id={arcId} />
          <text
            className="stamp__name stamp__name--curved"
            fontSize={fittedName.size}
            lengthAdjust={
              fittedName.isCompressed ? "spacingAndGlyphs" : undefined
            }
            textLength={
              fittedName.isCompressed ? geometry.arc.length : undefined
            }
          >
            <textPath href={`#${arcId}`} startOffset="50%">
              {name}
            </textPath>
          </text>
        </>
      ) : (
        fittedName.lines.map((line, index) => (
          <text
            className={`stamp__name stamp__name--${textStyle}`}
            fontSize={fittedName.size}
            key={line}
            lengthAdjust={
              fittedName.isCompressed ? "spacingAndGlyphs" : undefined
            }
            textLength={
              fittedName.isCompressed ? geometry.nameWidth : undefined
            }
            x="60"
            y={
              geometry.nameY +
              shift -
              firstLineLift +
              index * (fittedName.size + 1)
            }
          >
            {line}
          </text>
        ))
      )}
      {emblem ? (
        <StampEmblem
          drawing={emblem}
          size={emblemSize}
          x={60 - emblemSize / 2}
          y={
            geometry.emblemY +
            shift +
            (isWrapped && !geometry.emblemGrows ? WRAP_SHRINK - nameShift : 0) +
            (isWrapped && geometry.emblemGrows ? WRAP_SHRINK : 0)
          }
        />
      ) : null}
      {lines.map((text, index) => {
        const slot =
          geometry.lines[index + geometry.lines.length - lines.length];
        if (!slot) return null;
        const fitted = fitLine(text, slot.width, LINE_MAX, LINE_MIN);
        return (
          <text
            className="stamp__line"
            fontSize={fitted.size}
            key={text}
            lengthAdjust={fitted.isCompressed ? "spacingAndGlyphs" : undefined}
            textLength={fitted.isCompressed ? slot.width : undefined}
            x="60"
            y={slot.y + lineShift}
          >
            {text}
          </text>
        );
      })}
    </svg>
  );
}
