// 07_streams_2 / review1 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export function createJsonParser(): Transform {
  return new Transform({
    readableObjectMode: true,

    transform(chunk: Buffer, _encoding, callback) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(chunk.toString("utf8"));
      } catch (error) {
        callback(error as Error);
        return;
      }
      callback(null, parsed);
    },
  });
}
