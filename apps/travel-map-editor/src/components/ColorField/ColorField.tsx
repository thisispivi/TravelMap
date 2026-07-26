import "./ColorField.scss";

import { ColorData } from "@travelmap/core";
import { ReactNode } from "react";

// Suggested fills, spaced around the wheel so neighbouring countries stay
// distinguishable on the map.
const SWATCHES: ColorData[] = [
  { h: 4, s: 72, l: 52 },
  { h: 24, s: 85, l: 54 },
  { h: 45, s: 88, l: 52 },
  { h: 90, s: 55, l: 46 },
  { h: 150, s: 55, l: 42 },
  { h: 175, s: 65, l: 40 },
  { h: 200, s: 75, l: 48 },
  { h: 220, s: 70, l: 55 },
  { h: 260, s: 60, l: 58 },
  { h: 290, s: 55, l: 55 },
  { h: 320, s: 65, l: 55 },
  { h: 350, s: 60, l: 48 },
];

/**
 * Converts HSL channels to a hexadecimal colour.
 * @param {ColorData} color - The HSL colour
 * @returns {string} The hexadecimal colour
 */
export function hslToHex(color: ColorData): string {
  const lightness = color.l / 100;
  const chroma = (color.s / 100) * Math.min(lightness, 1 - lightness);

  /**
   * Resolves one RGB channel of the colour.
   * @param {number} offset - The channel's hue offset
   * @returns {string} The channel as a two-digit hexadecimal value
   */
  function channel(offset: number): string {
    const hue = (offset + color.h / 30) % 12;
    const value =
      lightness - chroma * Math.max(-1, Math.min(hue - 3, 9 - hue, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/**
 * Converts a hexadecimal colour to rounded HSL channels.
 * @param {string} hex - The hexadecimal colour
 * @returns {ColorData} The HSL colour
 */
export function hexToHsl(hex: string): ColorData {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = ((value >> 16) & 255) / 255;
  const green = ((value >> 8) & 255) / 255;
  const blue = (value & 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const hue =
    delta === 0
      ? 0
      : max === red
        ? ((green - blue) / delta) % 6
        : max === green
          ? (blue - red) / delta + 2
          : (red - green) / delta + 4;

  return {
    h: Math.round(((hue * 60) % 360) + (hue < 0 ? 360 : 0)),
    l: Math.round(lightness * 100),
    s: Math.round(saturation * 100),
  };
}

/**
 * ColorField component
 * Picks a country's map fill with the platform colour picker, a hex field, and
 * a row of suggested tones. The stored value stays HSL because the map derives
 * its border and fill from those channels.
 * @component
 * @param {ColorFieldProps} props
 * @param {string} props.label - Field label
 * @param {(color: ColorData) => void} props.onChange - Colour change callback
 * @param {ColorData} props.value - Current colour
 * @returns {ReactNode} The colour picker
 */
export function ColorField({
  label,
  onChange,
  value,
}: ColorFieldProps): ReactNode {
  const hex = hslToHex(value);
  return (
    <div className="editor-field color-field">
      <label className="editor-field__label" htmlFor="country-color">
        {label}
      </label>
      <div className="color-field__row">
        <input
          className="color-field__picker"
          id="country-color"
          onChange={(event) => onChange(hexToHsl(event.target.value))}
          type="color"
          value={hex}
        />
        <input
          aria-label={`${label} hex value`}
          className="editor-field__control color-field__hex"
          onChange={(event) => {
            const next = event.target.value;
            if (/^#[0-9a-fA-F]{6}$/.test(next)) onChange(hexToHsl(next));
          }}
          spellCheck={false}
          type="text"
          value={hex}
        />
      </div>
      <ul className="color-field__swatches">
        {SWATCHES.map((swatch) => {
          const swatchHex = hslToHex(swatch);
          return (
            <li key={swatchHex}>
              <button
                aria-label={`Use ${swatchHex}`}
                className="color-field__swatch"
                onClick={() => onChange(swatch)}
                style={{ backgroundColor: swatchHex }}
                type="button"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Props for ColorField.
 * @property {string} label - Field label
 * @property {(color: ColorData) => void} onChange - Colour change callback
 * @property {ColorData} value - Current colour
 */
interface ColorFieldProps {
  label: string;
  onChange: (color: ColorData) => void;
  value: ColorData;
}
