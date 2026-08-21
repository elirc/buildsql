// 06_buffers_streams / ex1 - a frame is bytes, and bytes are not characters.
// See lessons/06_buffers_streams/README.md, "Exercise 1".

export interface Frame {
  version: number;
  payload: string;
}

export function encodeFrame(frame: Frame): Buffer {
  throw new Error("ex1: encodeFrame() is not implemented yet - edit this file.");
}

export function decodeFrame(buffer: Buffer): Frame {
  throw new Error("ex1: decodeFrame() is not implemented yet - edit this file.");
}
