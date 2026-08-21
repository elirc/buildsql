// 06_buffers_streams / review1 - reference solution (author only, used by `dojo verify`).

export interface Frame {
  version: number;
  payload: string;
}

export function readFrames(buffer: Buffer): Frame[] {
  const frames: Frame[] = [];
  let offset = 0;

  while (offset + 3 <= buffer.length) {
    const version = buffer.readUInt8(offset);
    const length = buffer.readUInt16BE(offset + 1);
    const start = offset + 3;
    frames.push({
      version,
      payload: buffer.subarray(start, start + length).toString("utf8"),
    });
    offset = start + length;
  }

  return frames;
}
