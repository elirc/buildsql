// d10_generic_constraints / ex8 - reference solution (author only).

export class VersionedStore<T extends { id: string; version: number }> {
  private readonly items = new Map<string, T>();

  put(item: T): boolean {
    const current = this.items.get(item.id);
    if (current !== undefined && current.version >= item.version) {
      return false;
    }
    this.items.set(item.id, item);
    return true;
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  all(): T[] {
    return [...this.items.values()].sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    );
  }

  get size(): number {
    return this.items.size;
  }
}
