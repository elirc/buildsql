// 06_buffers_streams / review1 - many frames, one buffer.
// See lessons/06_buffers_streams/README.md, "Review".

export interface Frame {
  version: number;
  payload: string;
}

export function readFrames(buffer: Buffer): Frame[] {
  throw new Error("review1: readFrames() is not implemented yet - edit this file.");
}
