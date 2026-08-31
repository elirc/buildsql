// d07_concurrency_control / ex1 - the primitive everything else is built from.
// See lessons/d07_concurrency_control/README.md, "Problem 1".

export interface Semaphore {
  /** Resolves with a release function once a permit is free. */
  acquire(): Promise<() => void>;
  /** Permits not currently lent out. */
  available(): number;
  /** Callers queued for a permit. */
  waiting(): number;
}

/**
 * `limit` permits, handed out first come first served. Each release function is
 * idempotent: calling it twice returns one permit, not two.
 */
export function createSemaphore(limit: number): Semaphore {
  throw new Error("ex1: createSemaphore() is not implemented yet - edit this file.");
}
