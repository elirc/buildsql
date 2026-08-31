// d02_module_patterns / ex2 - a registry that refuses to be ambiguous.
// See lessons/d02_module_patterns/README.md, "Problem 2".

export interface Registry<T> {
  /** Throws `duplicate registration: <name>` if the name is taken. */
  register(name: string, value: T): void;
  /** Throws `nothing registered under: <name>` if it is not there. */
  get(name: string): T;
  has(name: string): boolean;
  /** Every registered name, sorted. */
  names(): string[];
}

export function createRegistry<T>(): Registry<T> {
  throw new Error("ex2: createRegistry() is not implemented yet - edit this file.");
}
