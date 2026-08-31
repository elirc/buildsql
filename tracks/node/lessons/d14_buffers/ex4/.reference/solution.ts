// d14_buffers / ex4 - reference solution (author only, used by `dojo verify`).

export function splitBuffer(buffer: Buffer, delimiter: Buffer): Buffer[] {
  if (delimiter.length === 0) {
    throw new Error("splitBuffer: the delimiter must be at least one byte");
  }

  const pieces: Buffer[] = [];
  let start = 0;

  for (;;) {
    // Buffer#indexOf takes a Buffer and searches bytes, not characters.
    const at = buffer.indexOf(delimiter, start);
    if (at === -1) break;
    pieces.push(buffer.subarray(start, at));
    start = at + delimiter.length;
  }

  // Whatever is left after the last delimiter is the final piece - including
  // the empty one when the buffer ends on a delimiter.
  pieces.push(buffer.subarray(start));
  return pieces;
}
