// d07_concurrency_control / ex7 - a resource pool.
// See lessons/d07_concurrency_control/README.md, "Problem 7".

export interface PoolOptions<T> {
  create: () => T;
  max: number;
}

export interface Pool<T> {
  /** A free resource, a newly created one, or a wait until somebody releases. */
  acquire(): Promise<T>;
  /** Give it back. Releasing the same resource twice must not duplicate it. */
  release(resource: T): void;
  /** How many resources have ever been created. */
  size(): number;
  /** Callers queued for one. */
  waiting(): number;
}

/** Creates lazily, never more than `max`, and hands releases to the oldest waiter. */
export function createPool<T>(options: PoolOptions<T>): Pool<T> {
  throw new Error("ex7: createPool() is not implemented yet - edit this file.");
}
