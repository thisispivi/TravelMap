import assert from "node:assert/strict";

import { isSafeImageUrl } from "./imageUrl.ts";

/* The shapes `data/` actually holds today, plus the ones a fork may write. */
assert.equal(isSafeImageUrl("/logos/ryanair.svg"), true);
assert.equal(isSafeImageUrl("/Travels/Australia/Cairns/001c.webp"), true);
assert.equal(isSafeImageUrl("logos/ryanair.svg"), true);
assert.equal(isSafeImageUrl("./ryanair.svg"), true);
assert.equal(isSafeImageUrl("//cdn.example.com/ryanair.svg"), true);
assert.equal(isSafeImageUrl("https://cdn.example.com/ryanair.svg"), true);
assert.equal(isSafeImageUrl("http://cdn.example.com/ryanair.svg"), true);

/* The upload preview hands over an object URL before the file is on disk. */
assert.equal(isSafeImageUrl("blob:http://localhost:5174/9e3f-82f2"), true);
assert.equal(isSafeImageUrl("data:image/png;base64,iVBORw0KGgo="), true);

/*
 * A scheme that is not an image's is refused, whatever its casing, so a
 * malformed or hostile dataset cannot reach an `<img src>` through it.
 */
assert.equal(isSafeImageUrl("javascript:alert(1)"), false);
assert.equal(isSafeImageUrl("JaVaScRiPt:alert(1)"), false);
assert.equal(isSafeImageUrl("data:text/html,<script>alert(1)</script>"), false);
assert.equal(isSafeImageUrl("vbscript:msgbox(1)"), false);
assert.equal(isSafeImageUrl("file:///etc/passwd"), false);

console.log("imageUrl: all assertions passed");
