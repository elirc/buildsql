// d07_concurrency_control / ex3 - a queue you can keep pushing into.
// See lessons/d07_concurrency_control/README.md, "Problem 3".

export interface TaskQueue {
  /** Resolves or rejects with THIS task's outcome. A failure stops nothing. */
  push<T>(task: () => Promise<T>): Promise<T>;
  /** Queued but not started. */
  size(): number;
  /** In flight. */
  active(): number;
  /** Resolves when nothing is queued and nothing is running. */
  onIdle(): Promise<void>;
}

export function createTaskQueue(options: { concurrency: number }): TaskQueue {
  throw new Error("ex3: createTaskQueue() is not implemented yet - edit this file.");
}
