// d10_generic_constraints / ex8 - a constrained class type parameter.
// See lessons/d10_generic_constraints/README.md, "ex8".
//
// The constraint names the id and forgets the version the body compares.

export class VersionedStore<T extends { id: string }> {
  put(item: T): boolean {
    throw new Error("ex8: VersionedStore.put() is not implemented yet - edit this file.");
  }

  get(id: string): T | undefined {
    throw new Error("ex8: VersionedStore.get() is not implemented yet - edit this file.");
  }

  all(): T[] {
    throw new Error("ex8: VersionedStore.all() is not implemented yet - edit this file.");
  }

  get size(): number {
    throw new Error("ex8: VersionedStore.size is not implemented yet - edit this file.");
  }
}
