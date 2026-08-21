// i2_interview_drills / ex6 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";
import { StringDecoder } from "node:string_decoder";

const REPLACEMENT = "[REDACTED]";

export function createRedactor(secret: string): Transform {
  const decoder = new StringDecoder("utf8");
  // Anything shorter than the secret could still be the start of a match, so
  // it has to wait for the next chunk.
  const keepBack = Math.max(0, secret.length - 1);
  let pending = "";

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      pending = (pending + decoder.write(chunk)).split(secret).join(REPLACEMENT);

      if (pending.length > keepBack) {
        const safe = pending.slice(0, pending.length - keepBack);
        pending = pending.slice(pending.length - keepBack);
        this.push(safe);
      }
      callback();
    },

    flush(callback) {
      pending = (pending + decoder.end()).split(secret).join(REPLACEMENT);
      if (pending.length > 0) this.push(pending);
      callback();
    },
  });
}
