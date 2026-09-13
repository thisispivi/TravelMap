import { z } from "zod";

/*
 * localStorage is shared with every other script on the origin and survives
 * deploys, so a stored entry is untrusted input: it may predate the current
 * shape or have been written by hand.
 */
const StoredEntrySchema = z.object({
  expiry: z.number().finite(),
  value: z.unknown(),
});

/**
 * Stores a value that stops being readable after a deadline.
 * @param {string} key - The key under which the value is stored
 * @param {unknown} value - The value to be stored
 * @param {number} ttl - Time to live in milliseconds
 * @returns {void}
 */
export function setWithExpiry(key: string, value: unknown, ttl: number): void {
  localStorage.setItem(
    key,
    JSON.stringify({ expiry: Date.now() + ttl, value }),
  );
}

/**
 * Reads a value written by `setWithExpiry`, discarding anything expired or no
 * longer matching the stored shape so a stale entry cannot wedge a caller.
 * @param {string} key - The key of the item to retrieve
 * @returns {unknown} The stored value, or null when missing, unreadable, or expired
 */
export function getWithExpiry(key: string): unknown {
  const stored = localStorage.getItem(key);
  if (stored === null) return null;

  const entry = StoredEntrySchema.safeParse(safeJsonParse(stored));
  if (!entry.success || Date.now() > entry.data.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return entry.data.value;
}

/**
 * Parses JSON without throwing, so an unreadable entry is treated as absent.
 * @param {string} text - The raw stored text
 * @returns {unknown} The parsed value, or undefined when the text is not JSON
 */
function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
