// d14_buffers / ex1 - reference solution (author only, used by `dojo verify`).

export function toBase64Url(buffer: Buffer): string {
  // Node has known this encoding name since v14: it strips the padding and
  // swaps the two unsafe characters for you.
  return buffer.toString("base64url");
}

export function fromBase64Url(text: string): Buffer {
  // Decoding with "base64url" also accepts the ordinary alphabet and tolerates
  // missing padding, which is exactly the liberal behaviour that is wanted.
  return Buffer.from(text, "base64url");
}
