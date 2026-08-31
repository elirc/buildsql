// d14_buffers / ex8 - where the text ends and the bytes begin.
// See lessons/d14_buffers/README.md, "Problem 8".

export interface HeadAndBody {
  /** Lower-cased header names; a repeated header joined with ", ". */
  headers: Record<string, string>;
  /** Everything after the blank line, untouched. */
  body: Buffer;
}

/**
 * Split a header block from the bytes behind it. The block is CRLF-separated
 * `Name: value` lines and ends at the first CRLF CRLF.
 */
export function splitHeadersAndBody(buffer: Buffer): HeadAndBody {
  throw new Error("ex8: splitHeadersAndBody() is not implemented yet - edit this file.");
}
