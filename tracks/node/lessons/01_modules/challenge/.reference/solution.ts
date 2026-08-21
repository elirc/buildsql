// 01_modules / challenge - reference solution (author only, used by `dojo verify`).

export interface ModuleCache<T> {
  get(key: string): Promise<T>;
  size(): number;
}

export function createModuleCache<T>(load: (key: string) => Promise<T>): ModuleCache<T> {
  const entries = new Map<string, Promise<T>>();

  return {
    get(key: string): Promise<T> {
      const cached = entries.get(key);
      if (cached !== undefined) return cached;

      const pending = load(key);
      entries.set(key, pending);
      // A load that failed is not a module: drop it so the next get retries.
      pending.catch(() => {
        if (entries.get(key) === pending) entries.delete(key);
      });
      return pending;
    },
    size(): number {
      return entries.size;
    },
  };
}
