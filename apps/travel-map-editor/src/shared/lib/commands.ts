/**
 * One thing the command palette can do.
 * @property {string} id - Stable identifier, unique across contributors
 * @property {string} label - What the author reads
 * @property {string} [hint] - Where the command comes from, shown beside it
 * @property {() => void} run - Performs the command
 */
export interface Command {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

/*
 * A module-level registry rather than a context, because the palette lives in
 * the app shell while most commands come from whatever screen is open. A
 * context would force every screen to render inside a provider it does not
 * otherwise need.
 */
let commands: Command[] = [];
const listeners = new Set<() => void>();

/**
 * Publishes the current command list to the palette.
 * @returns {void}
 */
function publish(): void {
  for (const listener of listeners) listener();
}

/**
 * Reads every registered command. The array identity is stable between
 * changes so it is safe as a `useSyncExternalStore` snapshot.
 * @returns {Command[]} Registered commands
 */
export function getCommands(): Command[] {
  return commands;
}

/**
 * Subscribes to command registrations.
 * @param {() => void} listener - Called whenever the list changes
 * @returns {() => void} Unsubscribes the listener
 */
export function subscribeToCommands(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Registers a screen's commands, replacing any it registered before.
 * @param {string} owner - Which screen the commands belong to
 * @param {Command[]} contributed - The commands to offer
 * @returns {() => void} Removes the owner's commands again
 */
export function registerCommands(
  owner: string,
  contributed: Command[],
): () => void {
  commands = [
    ...commands.filter((command) => !command.id.startsWith(`${owner}:`)),
    ...contributed.map((command) => ({
      ...command,
      id: `${owner}:${command.id}`,
    })),
  ];
  publish();

  return () => {
    commands = commands.filter(
      (command) => !command.id.startsWith(`${owner}:`),
    );
    publish();
  };
}
