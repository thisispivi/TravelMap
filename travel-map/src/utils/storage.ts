/**
 * Sets a value in localStorage with an expiry time.
 * @param {string} key - The key under which the value is stored.
 * @param {unknown} value - The value to be stored.
 * @param {number} ttl - Time to live in milliseconds.
 */
export function setWithExpiry(key: string, value: unknown, ttl: number) {
  const item = {
    value: value,
    expiry: new Date().getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Retrieves a value from localStorage, considering its expiry time.
 * @param {string} key - The key of the item to retrieve.
 * @returns {unknown | null} The stored value, or null if not found or expired.
 */
export function getWithExpiry(key: string): unknown | null {
  const itemString = window.localStorage.getItem(key);
  if (!itemString) return null;

  const item = JSON.parse(itemString);
  const isExpired = new Date().getTime() > item.expiry;

  if (isExpired) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}
