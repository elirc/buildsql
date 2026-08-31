// d18_http_raw / ex4 - send the bytes that were asked for.
// See lessons/d18_http_raw/README.md, "Problem 4".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * `GET /clip.txt` serves the ten bytes `0123456789`, honouring a `Range`
 * header: 206 with `Content-Range` for a satisfiable range, 416 for one that
 * starts past the end, and a plain 200 when there is no usable range at all.
 */
export function createHandler(): Handler {
  throw new Error("ex4: createHandler() is not implemented yet - edit this file.");
}
