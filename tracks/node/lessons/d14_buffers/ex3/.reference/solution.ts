// d14_buffers / ex3 - reference solution (author only, used by `dojo verify`).

export interface RecordHeader {
  flags: number;
  count: number;
  id: number;
  name: string;
}

const HEADER_BYTES = 19;
const MAGIC = "DOJO";

export function parseRecordHeader(buffer: Buffer): RecordHeader {
  // Length first: every read below is an offset, and an offset past the end is
  // an ERR_OUT_OF_RANGE that names a number instead of a problem.
  if (buffer.length < HEADER_BYTES) {
    throw new Error(
      `parseRecordHeader: a record header needs 19 bytes, got ${buffer.length}`,
    );
  }

  const magic = buffer.toString("ascii", 0, 4);
  if (magic !== MAGIC) {
    throw new Error(`parseRecordHeader: bad magic ${JSON.stringify(magic)}, expected "DOJO"`);
  }

  const name = buffer.toString("ascii", 11, 19);
  return {
    flags: buffer.readUInt8(4),
    count: buffer.readUInt32LE(5),
    id: buffer.readUInt16BE(9),
    // The field is fixed width; the padding is not part of the value.
    name: name.replace(/\0+$/, ""),
  };
}
