// d14_buffers / ex2 - a number whose size depends on how big it is.
// See lessons/d14_buffers/README.md, "Problem 2".

export interface VarInt {
  /** The number that was encoded. */
  value: number;
  /** How many bytes it occupied, so the caller can advance its cursor. */
  bytesRead: number;
}

/** `value` as an unsigned LEB128 varint. */
export function writeVarInt(value: number): Buffer {
  throw new Error("ex2: writeVarInt() is not implemented yet - edit this file.");
}

/** The varint starting at `offset`, and its length. */
export function readVarInt(buffer: Buffer, offset: number): VarInt {
  throw new Error("ex2: readVarInt() is not implemented yet - edit this file.");
}
