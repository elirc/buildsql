// d07_concurrency_control / ex6 - lock the row, not the table.
// See lessons/d07_concurrency_control/README.md, "Problem 6".

export interface KeyedLock {
  /**
   * Run `fn` while holding `key`. Calls on the same key run one at a time, in
   * call order; calls on different keys do not wait for each other. The lock
   * is released whatever `fn` does, and `fn`s outcome reaches the caller.
   */
  withLock<T>(key: string, fn: () => Promise<T>): Promise<T>;
  held(key: string): boolean;
}

export function createKeyedLock(): KeyedLock {
  throw new Error("ex6: createKeyedLock() is not implemented yet - edit this file.");
}
