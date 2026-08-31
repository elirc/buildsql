// d14_buffers / ex6 - a whole file inlined in a string.
// See lessons/d14_buffers/README.md, "Problem 6".

export interface DataUrl {
  /** The declared media type, or the spec's default when none was given. */
  mediaType: string;
  /** The payload, as bytes. */
  data: Buffer;
}

/** Parse a `data:` URL, or `null` if `text` is not one. */
export function parseDataUrl(text: string): DataUrl | null {
  throw new Error("ex6: parseDataUrl() is not implemented yet - edit this file.");
}
