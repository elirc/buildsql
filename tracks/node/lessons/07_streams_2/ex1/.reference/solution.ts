// 07_streams_2 / ex1 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export function createUppercase(): Transform {
  let chunks = 0;

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      chunks += 1;
      callback(null, chunk.toString("utf8").toUpperCase());
    },

    flush(callback) {
      this.push(`[${chunks} chunks]`);
      callback();
    },
  });
}
