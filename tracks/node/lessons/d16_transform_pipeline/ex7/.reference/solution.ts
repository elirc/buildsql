// d16_transform_pipeline / ex7 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export function createOrderedParallelStage<T, R>(
  worker: (item: T) => Promise<R>,
  limit: number,
): Transform {
  //: started work, in input order. The head is the next thing that may be
  //: emitted, whatever order the workers actually finish in.
  const queue: Promise<R>[] = [];

  return new Transform({
    objectMode: true,
    transform(chunk: T, _encoding, callback) {
      const started = worker(chunk);
      // Handled below via the queue; this only stops the rejection being
      // "unhandled" in the window before its turn at the head comes round.
      started.catch(() => {});
      queue.push(started);

      if (queue.length < limit) {
        // Room for another: take the next chunk without waiting for anything.
        callback();
        return;
      }

      // At capacity. Retiring the HEAD is what frees the slot - not whichever
      // worker happens to finish first, because that would reorder the output.
      queue[0].then(
        (value) => {
          queue.shift();
          this.push(value);
          callback();
        },
        (error: unknown) => callback(error as Error),
      );
    },

    flush(callback) {
      const drain = async (): Promise<void> => {
        while (queue.length > 0) {
          const value = await queue[0];
          queue.shift();
          this.push(value);
        }
      };
      drain().then(
        () => callback(),
        (error: unknown) => callback(error as Error),
      );
    },
  });
}
