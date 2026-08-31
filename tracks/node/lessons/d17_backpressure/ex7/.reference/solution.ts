// d17_backpressure / ex7 - reference solution (author only, used by `dojo verify`).
import type { Writable } from "node:stream";

export interface BatchingWriter<T> {
  write(item: T): void;
  end(): Promise<void>;
}

export function createBatchingWriter<T>(
  sink: Writable,
  options: { maxBatch: number },
): BatchingWriter<T> {
  const pending: T[] = [];
  let busy = false;
  let ended = false;

  let settle: () => void = () => {};
  let fail: (error: unknown) => void = () => {};
  const finished = new Promise<void>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });

  sink.once("error", (error: Error) => fail(error));

  const flush = (): void => {
    // One write outstanding at a time: that is what turns "waiting" into
    // "collecting" instead of into a second queue inside the sink.
    if (busy) return;

    if (pending.length === 0) {
      if (ended) sink.end(() => settle());
      return;
    }

    const batch = pending.splice(0, options.maxBatch);
    busy = true;
    sink.write(batch, () => {
      busy = false;
      flush();
    });
  };

  return {
    write(item: T): void {
      pending.push(item);
      flush();
    },
    end(): Promise<void> {
      ended = true;
      flush();
      return finished;
    },
  };
}
