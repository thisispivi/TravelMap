import { describe, expect, it } from "vitest";

import { validateSvg } from "./assets.ts";

describe("uploaded SVG logos", () => {
  it("accepts static geometry, gradients, styles, and local references", () => {
    expect(() =>
      validateSvg(
        '<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="red"/></linearGradient></defs><style>.logo {fill:url(#g)}</style><path class="logo" d="M0 0h10v10z"/></svg>',
      ),
    ).not.toThrow();
  });

  it.each([
    "<script>alert(1)</script>",
    '<path onload="alert(1)"/>',
    '<use href="jav&#x61;script:alert(1)"/>',
    '<use href="//example.com/logo.svg"/>',
    '<style>@import "//example.com/style.css";</style>',
    '<path fill="url(//example.com/logo.svg)"/>',
    '<animate attributeName="href" values="javascript:alert(1)"/>',
    "<foreignObject><div>HTML</div></foreignObject>",
  ])("rejects active or external content: %s", (content) => {
    expect(() =>
      validateSvg(`<svg xmlns="http://www.w3.org/2000/svg">${content}</svg>`),
    ).toThrow(/unsupported/);
  });

  it("rejects XML stylesheets and malformed markup", () => {
    expect(() =>
      validateSvg('<?xml-stylesheet href="https://example.com/a.xsl"?><svg/>'),
    ).toThrow();
    expect(() => validateSvg("<svg><path></svg>")).toThrow();
  });
});
