// 06_buffers_streams / ex1 - reference solution (author only, used by `dojo verify`).

export interface Frame {
  version: number;
  payload: string;
}

export function encodeFrame({ version, payload }: Frame): Buffer {
  const body = Buffer.from(payload, "utf8");
  const header = Buffer.alloc(3);
  header.writeUInt8(version, 0);
  header.writeUInt16BE(body.length, 1);
  return Buffer.concat([header, body]);
}

export function decodeFrame(buffer: Buffer): Frame {
  const version = buffer.readUInt8(0);
  const length = buffer.readUInt16BE(1);
  return {
    version,
    payload: buffer.subarray(3, 3 + length).toString("utf8"),
  };
}
