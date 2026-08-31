// d14_buffers / ex5 - reference solution (author only, used by `dojo verify`).
import { StringDecoder } from "node:string_decoder";

export interface Utf8Decoder {
  push(chunk: Buffer): string;
  end(): string;
}

export function createUtf8Decoder(): Utf8Decoder {
  // StringDecoder holds an incomplete multi-byte sequence internally and emits
  // it once the rest of it arrives. This is what a Readable in string mode is
  // using under the hood.
  const decoder = new StringDecoder("utf8");

  return {
    push: (chunk: Buffer) => decoder.write(chunk),
    // end() flushes what is held: a sequence that can never be completed comes
    // out as the replacement character rather than disappearing.
    end: () => decoder.end(),
  };
}
