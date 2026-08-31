// d17_backpressure / ex3 - reference solution (author only, used by `dojo verify`).
import { Writable } from "node:stream";

export function createLossySink(options: { capacity: number }): LossySink {
  const kept: unknown[] = [];
  let dropped = 0;

  const stream = new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      kept.push(chunk);
      while (kept.length > options.capacity) {
        kept.shift();
        dropped += 1;
      }
      // Immediately, always. The callback is the only thing that could apply
      // backpressure, and this sink has decided never to.
      callback();
    },
  }) as LossySink;

  stream.items = () => [...kept];
  stream.dropped = () => dropped;
  return stream;
}

export interface LossySink extends Writable {
  items(): unknown[];
  dropped(): number;
}
