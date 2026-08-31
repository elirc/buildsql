// d02_module_patterns / ex2 - reference solution (author only, used by `dojo verify`).

export interface Registry<T> {
  register(name: string, value: T): void;
  get(name: string): T;
  has(name: string): boolean;
  names(): string[];
}

export function createRegistry<T>(): Registry<T> {
  // A Map, not a plain object: no prototype keys to collide with, and a real
  // has() that does not confuse "registered as undefined" with "absent".
  const entries = new Map<string, T>();

  return {
    register(name: string, value: T): void {
      if (entries.has(name)) {
        throw new Error(`duplicate registration: ${name}`);
      }
      entries.set(name, value);
    },
    get(name: string): T {
      if (!entries.has(name)) {
        throw new Error(`nothing registered under: ${name}`);
      }
      return entries.get(name) as T;
    },
    has(name: string): boolean {
      return entries.has(name);
    },
    names(): string[] {
      return [...entries.keys()].sort();
    },
  };
}
