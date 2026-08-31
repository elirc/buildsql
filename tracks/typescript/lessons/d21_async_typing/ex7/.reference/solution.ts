// d21_async_typing / ex7 - reference solution (author only).

export interface Queue {
  add<T>(task: () => Promise<T>): Promise<T>;
}

export function createQueue(limit: number): Queue {
  let active = 0;
  const waiting: (() => void)[] = [];

  const release = (): void => {
    active -= 1;
    const next = waiting.shift();
    if (next !== undefined) {
      next();
    }
  };

  return {
    add<T>(task: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const run = (): void => {
          active += 1;
          task().then(resolve, reject).finally(release);
        };
        if (active < limit) {
          run();
        } else {
          waiting.push(run);
        }
      });
    },
  };
}
