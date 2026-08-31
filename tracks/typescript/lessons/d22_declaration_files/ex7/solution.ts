// d22_declaration_files / ex7 - a registry other files can extend.
// See lessons/d22_declaration_files/README.md, "ex7".
//
// The stub gives the registry an index signature, so every name
// is allowed, every payload is unknown, and nothing is checked.

export interface CommandRegistry {
  [name: string]: unknown;
}

export type CommandName = keyof CommandRegistry;

export function dispatch<K extends CommandName>(name: K, payload: CommandRegistry[K]): string {
  throw new Error("ex7: dispatch() is not implemented yet - edit this file.");
}
