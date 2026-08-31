// d14_buffers / ex3 - a fixed layout, read field by field.
// See lessons/d14_buffers/README.md, "Problem 3".

export interface RecordHeader {
  flags: number;
  count: number;
  id: number;
  name: string;
}

/**
 * The 19-byte header at the front of `buffer`:
 * magic "DOJO" (4) | flags uint8 (1) | count uint32LE (4) | id uint16BE (2) |
 * name, 8 bytes of ASCII padded with NUL.
 */
export function parseRecordHeader(buffer: Buffer): RecordHeader {
  throw new Error("ex3: parseRecordHeader() is not implemented yet - edit this file.");
}
