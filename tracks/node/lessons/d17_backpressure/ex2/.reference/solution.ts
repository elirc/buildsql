// d17_backpressure / ex2 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export interface DemandSource extends Readable {
  produced(): number;
}

export function createDemandSource<T>(
  items: readonly T[],
  highWaterMark: number,
): DemandSource {
  let index = 0;

  const stream = new Readable({
    objectMode: true,
    highWaterMark,
    // _read() is the stream asking for more. It is called only while the
    // internal buffer is below the highWaterMark, so producing exactly one
    // item per call is what keeps the source in step with its consumer.
    read() {
      if (index >= items.length) {
        this.push(null);
        return;
      }
      this.push(items[index]);
      index += 1;
    },
  }) as DemandSource;

  stream.produced = () => index;
  return stream;
}
