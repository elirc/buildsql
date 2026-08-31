// d07_concurrency_control / ex1 - reference solution (author only, used by `dojo verify`).

export interface Semaphore {
  acquire(): Promise<() => void>;
  available(): number;
  waiting(): number;
}

export function createSemaphore(limit: number): Semaphore {
  let free = limit;
  //: callers waiting for a permit, oldest first
  const queue: ((release: () => void) => void)[] = [];

  const makeRelease = (): (() => void) => {
    // One flag per permit handed out: this is what makes a double release a
    // no-op instead of an extra permit.
    let returned = false;
    return () => {
      if (returned) return;
      returned = true;
      const next = queue.shift();
      // Hand the permit straight on rather than incrementing and re-checking.
      if (next) next(makeRelease());
      else free += 1;
    };
  };

  return {
    acquire(): Promise<() => void> {
      if (free > 0) {
        free -= 1;
        return Promise.resolve(makeRelease());
      }
      return new Promise<() => void>((resolve) => {
        queue.push(resolve);
      });
    },
    available: () => free,
    waiting: () => queue.length,
  };
}
