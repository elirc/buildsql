// d19_unknown_any_never / ex4 - reference solution (author only).

export interface Cache {
  set(key: string, value: unknown): void;
  get<T>(key: string, guard: (value: unknown) => value is T): T | null;
  has(key: string): boolean;
}

export function createCache(): Cache {
  const entries = new Map<string, unknown>();
  return {
    set(key: string, value: unknown): void {
      entries.set(key, value);
    },
    get<T>(key: string, guard: (value: unknown) => value is T): T | null {
      if (!entries.has(key)) {
        return null;
      }
      const value = entries.get(key);
      return guard(value) ? value : null;
    },
    has(key: string): boolean {
      return entries.has(key);
    },
  };
}
