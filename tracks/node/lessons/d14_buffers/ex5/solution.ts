// d14_buffers / ex5 - decoding text that arrives in the wrong places.
// See lessons/d14_buffers/README.md, "Problem 5".

export interface Utf8Decoder {
  /** The complete characters this chunk finished. Partial ones are held. */
  push(chunk: Buffer): string;
  /** Whatever is left when no more bytes are coming. */
  end(): string;
}

/** A decoder that survives multi-byte characters split across chunks. */
export function createUtf8Decoder(): Utf8Decoder {
  throw new Error("ex5: createUtf8Decoder() is not implemented yet - edit this file.");
}
