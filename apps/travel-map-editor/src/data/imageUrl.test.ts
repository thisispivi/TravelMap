import { describe, expect, it } from "vitest";

import { isSafeImageUrl } from "./imageUrl.ts";

describe("isSafeImageUrl", () => {
  it("accepts the path shapes the dataset holds", () => {
    expect(isSafeImageUrl("/logos/ryanair.svg")).toBe(true);
    expect(isSafeImageUrl("/Travels/Australia/Cairns/001c.webp")).toBe(true);
    expect(isSafeImageUrl("logos/ryanair.svg")).toBe(true);
    expect(isSafeImageUrl("./ryanair.svg")).toBe(true);
    expect(isSafeImageUrl("//cdn.example.com/ryanair.svg")).toBe(true);
    expect(isSafeImageUrl("https://cdn.example.com/ryanair.svg")).toBe(true);
    expect(isSafeImageUrl("http://cdn.example.com/ryanair.svg")).toBe(true);
  });

  it("accepts the URLs an upload preview produces before the file is on disk", () => {
    expect(isSafeImageUrl("blob:http://localhost:5174/9e3f-82f2")).toBe(true);
    expect(isSafeImageUrl("data:image/png;base64,iVBORw0KGgo=")).toBe(true);
  });

  it("refuses non-image schemes whatever their casing", () => {
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeImageUrl("JaVaScRiPt:alert(1)")).toBe(false);
    expect(isSafeImageUrl("data:text/html,<script>alert(1)</script>")).toBe(
      false,
    );
    expect(isSafeImageUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeImageUrl("file:///etc/passwd")).toBe(false);
  });
});
