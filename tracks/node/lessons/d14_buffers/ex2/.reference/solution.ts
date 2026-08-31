// d14_buffers / ex2 - reference solution (author only, used by `dojo verify`).

export interface VarInt {
  value: number;
  bytesRead: number;
}

export function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  let rest = value;
  // do/while, not while: zero is one byte, and a loop with the test at the top
  // encodes it as nothing at all.
  do {
    const seven = rest % 128;
    rest = Math.floor(rest / 128);
    bytes.push(rest > 0 ? seven | 0x80 : seven);
  } while (rest > 0);
  return Buffer.from(bytes);
}

export function readVarInt(buffer: Buffer, offset: number): VarInt {
  let value = 0;
  // Multiply rather than shift: << is a 32-bit operator in JavaScript, so the
  // fifth group of seven bits would wrap round to nothing.
  let scale = 1;
  let cursor = offset;

  for (;;) {
    if (cursor >= buffer.length) {
      throw new Error(
        "readVarInt: truncated varint - the buffer ended before a byte with the top bit clear",
      );
    }
    const byte = buffer[cursor];
    cursor += 1;
    value += (byte & 0x7f) * scale;
    if ((byte & 0x80) === 0) break;
    scale *= 128;
  }

  return { value, bytesRead: cursor - offset };
}
