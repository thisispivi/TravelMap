import { XMLParser, XMLValidator } from "fast-xml-parser";
import { z } from "zod";

import { RequestError } from "./http.ts";

const SVG_ELEMENTS = new Set([
  "svg",
  "g",
  "defs",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "title",
  "desc",
  "use",
  "symbol",
  "clipPath",
  "mask",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "style",
]);
const XmlRecordSchema = z.record(z.string(), z.unknown());

/**
 * Accepts only local paint references; CSS escapes and imports could disguise URLs.
 * @param {string} value - Decoded SVG attribute or stylesheet
 * @returns {boolean} Whether the content can stay inert when opened directly
 */
function isSafeStyle(value: string): boolean {
  return (
    !/[\\@]/.test(value) && !/url\(\s*(?!["']?#[\w.-]+["']?\s*\))/i.test(value)
  );
}

/**
 * Walks parsed XML rather than matching encoded attributes as raw text.
 * Only static SVG elements and fragment references are supported.
 * @param {unknown} value - Parsed XML node
 * @returns {boolean} Whether every descendant is inert
 */
function isStaticSvg(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(isStaticSvg);
  if (typeof value === "string") return isSafeStyle(value);
  const node = XmlRecordSchema.safeParse(value);
  if (!node.success) return false;
  return Object.entries(node.data).every(([name, child]) => {
    if (name === "#text")
      return typeof child === "string" && isSafeStyle(child);
    if (name.startsWith("@_")) {
      if (typeof child !== "string" || !isSafeStyle(child)) return false;
      const attribute = name.slice(2).toLowerCase();
      if (attribute.startsWith("on") || attribute === "xml:base") return false;
      if (
        attribute === "href" ||
        attribute === "xlink:href" ||
        attribute === "src"
      )
        return /^#[\w.-]+$/.test(child);
      if (attribute === "xmlns") return child === "http://www.w3.org/2000/svg";
      if (attribute.startsWith("xmlns:"))
        return (
          attribute === "xmlns:xlink" &&
          child === "http://www.w3.org/1999/xlink"
        );
      return !attribute.includes(":");
    }
    return SVG_ELEMENTS.has(name) && isStaticSvg(child);
  });
}

/**
 * Validates a static SVG logo without permitting scripts, animation, or remote loads.
 * @param {string} svg - Uploaded UTF-8 SVG
 * @returns {void}
 */
export function validateSvg(svg: string): void {
  const source = svg.replace(/^\s*<\?xml\s[^?]*\?>/, "");
  if (
    /<!DOCTYPE|<!ENTITY|<\?/i.test(source) ||
    XMLValidator.validate(source) !== true
  )
    throw new RequestError(
      "The uploaded SVG is not supported. Export a static SVG or PNG.",
    );
  const parsed: unknown = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: false,
    parseTagValue: false,
  }).parse(source);
  const root = XmlRecordSchema.safeParse(parsed);
  if (
    !root.success ||
    Object.keys(root.data).length !== 1 ||
    !Object.hasOwn(root.data, "svg") ||
    !isStaticSvg(parsed)
  )
    throw new RequestError(
      "The uploaded SVG contains unsupported active content. Export a static SVG or PNG.",
    );
}
