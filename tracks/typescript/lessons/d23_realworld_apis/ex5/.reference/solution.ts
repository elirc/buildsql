// d23_realworld_apis / ex5 - reference solution (author only).

export interface TtlCache<T> {
  set(key: string, value: T): void;
  get(key: string): T | undefined;
  size(): number;
}

export function createTtlCache<T>(ttlMs: number, now: () => number): TtlCache<T> {
  const entries = new Map<string, { value: T; writtenAt: number }>();

  return {
    set(key: string, value: T): void {
      entries.set(key, { value, writtenAt: now() });
    },
    get(key: string): T | undefined {
      const entry = entries.get(key);
      if (entry === undefined) {
        return undefined;
      }
      if (now() - entry.writtenAt >= ttlMs) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },
    size(): number {
      return entries.size;
    },
  };
}
