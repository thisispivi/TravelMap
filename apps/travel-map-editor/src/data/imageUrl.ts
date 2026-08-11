/*
 * Authored paths end up as an `<img src>`, and `data/` is hand-edited and
 * meant to survive being forked, so a path carrying a scheme is only handed to
 * the browser when that scheme is one an image may legitimately use. A
 * `javascript:` URL or a `data:text/html` document is rejected rather than
 * passed through on trust. Paths without a scheme are the ordinary case and
 * stay relative.
 */
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const IMAGE_SCHEME = /^(?:https?:|blob:|data:image\/)/i;

/**
 * Reports whether an authored path is safe to use as an image source.
 * @param {string} path - The authored path or URL
 * @returns {boolean} Whether the browser may load it as an image
 */
export function isSafeImageUrl(path: string): boolean {
  return !URL_SCHEME.test(path) || IMAGE_SCHEME.test(path);
}
