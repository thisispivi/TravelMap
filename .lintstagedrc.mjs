/*
 * Windows caps a command line at ~8k characters, and a wide refactor can stage
 * enough files to blow past it — the hook then fails with "The command line is
 * too long" rather than a lint error. Batching keeps every invocation short.
 */
const FILES_PER_COMMAND = 24;

/**
 * Splits one command across as many invocations as the file list needs.
 * @param {string} command - The executable and its flags
 * @param {string[]} files - Absolute paths of the staged files
 * @returns {string[]} One runnable command per batch
 */
function batched(command, files) {
  const commands = [];
  for (let index = 0; index < files.length; index += FILES_PER_COMMAND) {
    const batch = files
      .slice(index, index + FILES_PER_COMMAND)
      .map((file) => `"${file}"`)
      .join(" ");
    commands.push(`${command} ${batch}`);
  }
  return commands;
}

export default {
  /**
   * Lints the staged source files.
   * @param {string[]} files - Absolute paths of the staged files
   * @returns {string[]} The lint commands to run
   */
  "*.{js,mjs,cjs,ts,tsx}": (files) =>
    batched("eslint --fix --max-warnings=0", files),

  /**
   * Formats every staged file Prettier owns.
   * @param {string[]} files - Absolute paths of the staged files
   * @returns {string[]} The formatting commands to run
   */
  "*.{js,mjs,cjs,ts,tsx,css,scss,md,html,json,yaml,yml}": (files) =>
    batched("prettier --write", files),
};
