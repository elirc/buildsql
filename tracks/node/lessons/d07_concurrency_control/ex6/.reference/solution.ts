// d07_concurrency_control / ex6 - reference solution (author only, used by `dojo verify`).

export interface KeyedLock {
  withLock<T>(key: string, fn: () => Promise<T>): Promise<T>;
  held(key: string): boolean;
}

export function createKeyedLock(): KeyedLock {
  //: key -> a promise that settles when the current holder is finished
  const tails = new Map<string, Promise<void>>();

  return {
    withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
      const previous = tails.get(key) ?? Promise.resolve();

      // Chaining onto the tail is the queue: each new caller waits for the one
      // in front of it, and becomes the new tail.
      const result = previous.then(fn);

      const tail = result.then(
        () => undefined,
        () => undefined, // a failed holder still releases the lock
      );
      tails.set(key, tail);

      void tail.then(() => {
        // Only the last waiter clears the entry, or a key in active use would
        // be forgotten mid-queue.
        if (tails.get(key) === tail) tails.delete(key);
      });

      return result;
    },

    held(key: string): boolean {
      return tails.has(key);
    },
  };
}
