// d14_buffers / ex7 - frames out of chunks that do not line up with them.
// See lessons/d14_buffers/README.md, "Problem 7".

export interface FrameReader {
  /** Every whole frame this chunk completed, in order. */
  push(chunk: Buffer): Buffer[];
  /** How many bytes are being held back for the next push. */
  pending(): number;
}

/**
 * A reader for a stream of `uint32BE length` + `length` payload bytes. Chunks
 * may split anywhere, including in the middle of a length prefix.
 */
export function createFrameReader(): FrameReader {
  throw new Error("ex7: createFrameReader() is not implemented yet - edit this file.");
}
