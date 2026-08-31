// d09_emitters / ex5 - reference solution (author only, used by `dojo verify`).
import type { EventEmitter } from "node:events";

export function iterateEvents<T>(emitter: EventEmitter, name: string): AsyncIterable<T> {
  const queue: T[] = [];
  let finished = false;
  let failed = false;
  let failure: unknown;
  let wake: (() => void) | undefined;

  const notify = (): void => {
    const resume = wake;
    wake = undefined;
    resume?.();
  };

  const onData = (value: T): void => {
    queue.push(value);
    notify();
  };
  const onEnd = (): void => {
    finished = true;
    notify();
  };
  const onError = (error: unknown): void => {
    failed = true;
    failure = error;
    finished = true;
    notify();
  };

  // Attached NOW, not on the first next(): a generator body does not run until
  // it is pulled, and events emitted in the meantime would be lost.
  emitter.on(name, onData as (...args: unknown[]) => void);
  emitter.on("end", onEnd);
  emitter.on("error", onError);

  const cleanup = (): void => {
    emitter.off(name, onData as (...args: unknown[]) => void);
    emitter.off("end", onEnd);
    emitter.off("error", onError);
  };

  async function* iterate(): AsyncGenerator<T, void, undefined> {
    try {
      for (;;) {
        // Drain what is buffered before looking at the terminal states, so an
        // error never swallows values that already arrived.
        while (queue.length > 0) yield queue.shift() as T;
        if (failed) throw failure;
        if (finished) return;
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
    } finally {
      cleanup();
    }
  }

  return { [Symbol.asyncIterator]: iterate };
}
