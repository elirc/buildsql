// d18_http_raw / ex7 - serving a directory, and only that directory.
// See lessons/d18_http_raw/README.md, "Problem 7".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * A handler that serves files from `root`: content-type from the extension,
 * 404 for anything missing or for a directory, 405 with `Allow: GET, HEAD` for
 * any other method, and 403 for a path that resolves outside `root`.
 */
export function createStaticServer(root: string): Handler {
  throw new Error("ex7: createStaticServer() is not implemented yet - edit this file.");
}
