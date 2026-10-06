import { createServer } from "vite";
import { describe, expect, it } from "vitest";

import { siteBranding } from "./siteBranding.ts";

describe("site metadata", () => {
  it("escapes HTML and treats replacement tokens as literal authored text", async () => {
    const plugin = siteBranding({
      site: {
        name: "</title><script>bad()</script> $& %SITE_AUTHOR%",
        author: '" onload="bad()',
      },
    });
    const server = await createServer({
      configFile: false,
      plugins: [plugin],
      server: { middlewareMode: true, watch: null },
    });
    try {
      const result = await server.transformIndexHtml(
        "/",
        '<title>%SITE_NAME%</title><meta content="%SITE_AUTHOR%">',
      );
      expect(result).toContain(
        '<title>&lt;/title&gt;&lt;script&gt;bad()&lt;/script&gt; $&amp; %SITE_AUTHOR%</title><meta content="&quot; onload=&quot;bad()">',
      );
    } finally {
      await server.close();
    }
  });

  it("keeps defaults for a new fork and uses the core site schema", () => {
    expect(() => siteBranding({})).not.toThrow();
    expect(() => siteBranding({ site: { name: "" } })).toThrow();
    expect(() => siteBranding({ site: { typo: true } })).toThrow();
  });
});
