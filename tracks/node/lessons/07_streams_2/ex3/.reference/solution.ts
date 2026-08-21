// 07_streams_2 / ex3 - reference solution (author only, used by `dojo verify`).
import { StringDecoder } from "node:string_decoder";
import { Transform } from "node:stream";

const withoutCarriageReturn = (line: string): string =>
  line.endsWith("\r") ? line.slice(0, -1) : line;

export function createLineSplitter(): Transform {
  const decoder = new StringDecoder("utf8");
  let pending = "";

  return new Transform({
    readableObjectMode: true,

    transform(chunk: Buffer, _encoding, callback) {
      pending += decoder.write(chunk);
      const lines = pending.split("\n");
      // The last piece has no newline after it yet: keep it for next time.
      pending = lines.pop() ?? "";
      for (const line of lines) this.push(withoutCarriageReturn(line));
      callback();
    },

    flush(callback) {
      pending += decoder.end();
      if (pending.length > 0) this.push(withoutCarriageReturn(pending));
      callback();
    },
  });
}
