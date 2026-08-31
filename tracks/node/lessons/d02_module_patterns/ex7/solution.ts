// d02_module_patterns / ex7 - a container, with cycle detection.
// See lessons/d02_module_patterns/README.md, "Problem 7".

export interface Container {
  register(name: string, factory: (container: Container) => unknown): void;
  /**
   * Build (or return the already-built) instance.
   * Throws `nothing registered under: <name>`, or
   * `circular dependency: a -> b -> a` naming the whole path.
   */
  resolve<T>(name: string): T;
}

export function createContainer(): Container {
  throw new Error("ex7: createContainer() is not implemented yet - edit this file.");
}
