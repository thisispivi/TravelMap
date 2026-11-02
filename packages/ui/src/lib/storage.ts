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

/**
 * Reads a plain string entry. Touching localStorage throws when the browser
 * blocks site data, and a remembered preference is never worth a blank page.
 * @param {string} key - The key of the item to retrieve
 * @returns {string | null} The stored text, or null when missing or unreadable
 */
export function readStoredString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Remembers a plain string entry when the browser allows it.
 * @param {string} key - The key under which the value is stored
 * @param {string} value - The value to be stored
 * @returns {void}
 */
export function writeStoredString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Blocked storage only costs remembering the choice on the next visit. */
  }
}

/**
 * One remembered choice out of a closed list, which any number of components
 * can read and follow.
 * @property {() => T} read - The current choice
 * @property {(value: T) => void} write - Remembers a choice and tells the subscribers
 * @property {(listener: () => void) => () => void} subscribe - Follows changes until the returned function runs
 */
export interface StoredChoice<T extends string> {
  read: () => T;
  write: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
}

/**
 * Creates a remembered choice shaped for `useSyncExternalStore`. The value is
 * held in memory too, so a choice still applies when storage is blocked, and an
 * entry outside the list reads as the fallback.
 * @param {string} key - The key under which the choice is stored
 * @param {readonly T[]} options - Every valid choice
 * @param {T} fallback - The choice when nothing valid is stored
 * @returns {StoredChoice<T>} The choice
 */
export function createStoredChoice<T extends string>(
  key: string,
  options: readonly T[],
  fallback: T,
): StoredChoice<T> {
  const stored = readStoredString(key);
  const listeners = new Set<() => void>();
  let value = options.find((option) => option === stored) ?? fallback;

  return {
    read: () => value,
    write: (next) => {
      value = next;
      writeStoredString(key, next);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
