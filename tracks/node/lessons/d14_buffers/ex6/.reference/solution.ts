// d14_buffers / ex6 - reference solution (author only, used by `dojo verify`).

export interface DataUrl {
  mediaType: string;
  data: Buffer;
}

const DEFAULT_MEDIA_TYPE = "text/plain;charset=US-ASCII";
const BASE64_MARKER = ";base64";

export function parseDataUrl(text: string): DataUrl | null {
  if (!text.startsWith("data:")) return null;

  // The first comma is the boundary; commas after it belong to the payload.
  const comma = text.indexOf(",");
  if (comma === -1) return null;

  const meta = text.slice("data:".length, comma);
  const isBase64 = meta.endsWith(BASE64_MARKER);
  const declared = isBase64 ? meta.slice(0, -BASE64_MARKER.length) : meta;
  const payload = text.slice(comma + 1);

  return {
    mediaType: declared === "" ? DEFAULT_MEDIA_TYPE : declared,
    data: isBase64
      ? Buffer.from(payload, "base64")
      : // Percent-escapes are BYTES; decodeURIComponent turns them back into
        // the characters they encoded, and utf8 re-encodes them unchanged.
        Buffer.from(decodeURIComponent(payload), "utf8"),
  };
}
