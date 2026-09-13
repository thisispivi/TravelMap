import type { IncomingMessage, ServerResponse } from "node:http";

import type { ZodType } from "zod";

const DEFAULT_BODY_LIMIT = 1_000_000;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Confirms that a mutating editor request came through the loopback-bound Vite
 * server and, when a browser supplies an Origin, from that same origin.
 * @param {IncomingMessage} request - Incoming editor request
 * @returns {void}
 */
export function assertLocalRequest(request: IncomingMessage): void {
  const host = request.headers.host ?? "";
  const hostname = host.replace(/:\d+$/, "");
  if (!LOCAL_HOSTS.has(hostname)) throw new Error("Local requests only.");

  const origin = request.headers.origin;
  if (origin && new URL(origin).host !== host)
    throw new Error("Cross-origin editor requests are not allowed.");
}

/**
 * Reads, size-limits, parses, and validates one JSON request body.
 * @param {IncomingMessage} request - Incoming editor request
 * @param {ZodType<T>} schema - Runtime contract for the parsed body
 * @param {number} [limit=DEFAULT_BODY_LIMIT] - Maximum encoded body size
 * @returns {Promise<T>} Validated request payload
 */
export async function readJsonBody<T>(
  request: IncomingMessage,
  schema: ZodType<T>,
  limit = DEFAULT_BODY_LIMIT,
): Promise<T> {
  if (!request.headers["content-type"]?.startsWith("application/json"))
    throw new Error("Expected an application/json request.");

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > limit) throw new Error("Request body is too large.");
    chunks.push(buffer);
  }

  const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  return schema.parse(value);
}

/**
 * Sends a concise JSON response from the localhost-only editor middleware.
 * @param {ServerResponse} response - HTTP response
 * @param {number} status - HTTP status code
 * @param {object} body - JSON response body
 * @returns {void}
 */
export function sendJson(
  response: ServerResponse,
  status: number,
  body: object,
): void {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

/**
 * Turns a thrown value into the message shape the editor's fetch helpers read,
 * without letting an unexpected internal error text reach the browser.
 * @param {unknown} error - The thrown value
 * @param {string} fallback - Message used when the value is not an Error
 * @returns {{ error: string }} The JSON error body
 */
export function errorBody(error: unknown, fallback: string): { error: string } {
  return { error: error instanceof Error ? error.message : fallback };
}
