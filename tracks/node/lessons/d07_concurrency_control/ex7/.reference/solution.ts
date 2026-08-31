// d07_concurrency_control / ex7 - reference solution (author only, used by `dojo verify`).

export interface PoolOptions<T> {
  create: () => T;
  max: number;
}

export interface Pool<T> {
  acquire(): Promise<T>;
  release(resource: T): void;
  size(): number;
  waiting(): number;
}

export function createPool<T>(options: PoolOptions<T>): Pool<T> {
  const idle: T[] = [];
  const waiters: ((resource: T) => void)[] = [];
  let created = 0;

  return {
    acquire(): Promise<T> {
      // Reuse before creating: the whole point of a pool is that the expensive
      // part already happened.
      if (idle.length > 0) return Promise.resolve(idle.shift() as T);
      if (created < options.max) {
        created += 1;
        return Promise.resolve(options.create());
      }
      return new Promise<T>((resolve) => {
        waiters.push(resolve);
      });
    },

    release(resource: T): void {
      // Guard against a double release, or the same connection ends up lent to
      // two callers at once.
      if (idle.includes(resource)) return;
      const next = waiters.shift();
      if (next) next(resource);
      else idle.push(resource);
    },

    size: () => created,
    waiting: () => waiters.length,
  };
}
