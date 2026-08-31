// d14_buffers / ex8 - reference solution (author only, used by `dojo verify`).

export interface HeadAndBody {
  headers: Record<string, string>;
  body: Buffer;
}

const SEPARATOR = Buffer.from("\r\n\r\n", "ascii");

export function splitHeadersAndBody(buffer: Buffer): HeadAndBody {
  // Find the boundary in BYTES. Decoding first is what corrupts the body.
  const at = buffer.indexOf(SEPARATOR);
  if (at === -1) {
    throw new Error(
      "splitHeadersAndBody: no blank line - the header block is not terminated by CRLF CRLF",
    );
  }

  const head = buffer.toString("utf8", 0, at);
  const body = Buffer.from(buffer.subarray(at + SEPARATOR.length));

  const headers: Record<string, string> = {};
  for (const line of head.split("\r\n")) {
    if (line === "") continue;

    // The FIRST colon only: values contain colons all the time.
    const colon = line.indexOf(":");
    if (colon === -1) {
      throw new Error(`splitHeadersAndBody: header line without a colon: ${line}`);
    }

    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    headers[name] = headers[name] === undefined ? value : `${headers[name]}, ${value}`;
  }

  return { headers, body };
}
