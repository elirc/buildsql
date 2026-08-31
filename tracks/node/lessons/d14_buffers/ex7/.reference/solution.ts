// d14_buffers / ex7 - reference solution (author only, used by `dojo verify`).

export interface FrameReader {
  push(chunk: Buffer): Buffer[];
  pending(): number;
}

const HEADER_BYTES = 4;

export function createFrameReader(): FrameReader {
  //: bytes that arrived but did not add up to a whole frame yet
  let held = Buffer.alloc(0);

  return {
    push(chunk: Buffer): Buffer[] {
      held = held.length === 0 ? Buffer.from(chunk) : Buffer.concat([held, chunk]);

      const frames: Buffer[] = [];
      let offset = 0;

      // A loop, not an if: one chunk can complete any number of frames.
      for (;;) {
        // Is the length prefix even here yet?
        if (held.length - offset < HEADER_BYTES) break;
        const length = held.readUInt32BE(offset);
        // ...and is the whole payload behind it?
        if (held.length - offset - HEADER_BYTES < length) break;

        // Copy: the frame outlives the buffer it was cut from.
        frames.push(Buffer.from(held.subarray(offset + HEADER_BYTES, offset + HEADER_BYTES + length)));
        offset += HEADER_BYTES + length;
      }

      if (offset > 0) held = Buffer.from(held.subarray(offset));
      return frames;
    },

    pending: () => held.length,
  };
}
