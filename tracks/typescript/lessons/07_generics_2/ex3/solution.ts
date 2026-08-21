// 07_generics_2 / ex3 - a generic class, with a default type argument.
// See lessons/07_generics_2/README.md, "Exercise 3".
//
// This registry stores `unknown`, so everything that comes out of it is
// useless to the caller. Give the class a type parameter - and a default.

export class Registry {
  private readonly entries = new Map<string, unknown>();

  set(key: string, value: unknown): void {
    throw new Error("ex3: Registry.set() is not implemented yet - edit this file.");
  }

  get(key: string): unknown {
    throw new Error("ex3: Registry.get() is not implemented yet - edit this file.");
  }

  has(key: string): boolean {
    throw new Error("ex3: Registry.has() is not implemented yet - edit this file.");
  }

  get size(): number {
    throw new Error("ex3: Registry.size is not implemented yet - edit this file.");
  }
}
