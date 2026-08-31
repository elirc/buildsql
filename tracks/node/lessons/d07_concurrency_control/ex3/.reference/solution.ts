// d07_concurrency_control / ex3 - reference solution (author only, used by `dojo verify`).

export interface TaskQueue {
  push<T>(task: () => Promise<T>): Promise<T>;
  size(): number;
  active(): number;
  onIdle(): Promise<void>;
}

export function createTaskQueue(options: { concurrency: number }): TaskQueue {
  //: each entry starts its task and settles its own caller's promise
  const queued: (() => void)[] = [];
  const idleWaiters: (() => void)[] = [];
  let running = 0;

  const finish = (): void => {
    running -= 1;
    pump();
    if (running === 0 && queued.length === 0) {
      while (idleWaiters.length > 0) idleWaiters.shift()?.();
    }
  };

  const pump = (): void => {
    while (running < options.concurrency && queued.length > 0) {
      running += 1;
      queued.shift()?.();
    }
  };

  return {
    push<T>(task: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        queued.push(() => {
          // Each task's outcome goes to ITS caller. The queue itself never
          // sees a rejection, so one bad task cannot stop the pipeline.
          Promise.resolve()
            .then(task)
            .then(resolve, reject)
            .finally(finish);
        });
        pump();
      });
    },
    size: () => queued.length,
    active: () => running,
    onIdle(): Promise<void> {
      if (running === 0 && queued.length === 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        idleWaiters.push(resolve);
      });
    },
  };
}
