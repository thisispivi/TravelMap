import type { ZodType } from "zod";
import { z } from "zod";

const ErrorResponseSchema = z.looseObject({ error: z.string() });

/**
 * Parses an HTTP JSON response through its owning runtime contract.
 * @param {Response} response - Fetch response to decode
 * @param {ZodType<T>} schema - Runtime contract for the response body
 * @returns {Promise<T>} Validated response body
 */
export async function parseJsonResponse<T>(
  response: Response,
  schema: ZodType<T>,
): Promise<T> {
  return schema.parse(await response.json());
}

/**
 * Reads a server error without trusting the response body to have the expected
 * shape, falling back to a stable non-technical message.
 * @param {Response} response - Failed fetch response
 * @returns {Promise<string>} Safe error text
 */
export async function readResponseError(response: Response): Promise<string> {
  try {
    return ErrorResponseSchema.parse(await response.json()).error;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}
