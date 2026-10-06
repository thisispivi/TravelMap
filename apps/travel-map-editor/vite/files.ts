import { randomUUID } from "node:crypto";
import { lstat, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

import { RequestError } from "./http.ts";

/**
 * Resolves a local file while refusing traversal and symlinked descendants.
 * The root itself may be a deliberately linked dataset directory.
 * @param {string} root - Owned directory
 * @param {string} name - Relative path inside that directory
 * @returns {Promise<string>} Confined absolute path
 */
export async function resolveOwnedPath(
  root: string,
  name: string,
): Promise<string> {
  const path = resolve(root, name);
  const child = relative(root, path);
  if (
    !child ||
    child === ".." ||
    child.startsWith(`..${sep}`) ||
    isAbsolute(child)
  )
    throw new RequestError("The file must stay inside its data directory.");

  let current = resolve(root);
  for (const part of child.split(sep)) {
    current = resolve(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink())
        throw new RequestError("Linked files and folders cannot be changed.");
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        break;
      throw error;
    }
  }
  return path;
}

/**
 * Replaces a file only after its complete replacement has reached disk.
 * A failed write leaves the previous document intact.
 * @param {string} path - Validated destination
 * @param {string | Buffer} content - Complete replacement bytes
 * @returns {Promise<void>} Completion after the atomic rename
 */
export async function writeAtomically(
  path: string,
  content: string | Buffer,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, content, { flag: "wx" });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}
