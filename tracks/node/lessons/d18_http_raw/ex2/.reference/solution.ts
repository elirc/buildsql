// d18_http_raw / ex2 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const STATUS = { service: "café-api", ready: true };

export function createHandler(): Handler {
  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const method = (req.method ?? "GET").toUpperCase();

    // Decide the whole response first. A HEAD differs from a GET at exactly one
    // point - the last line - and nowhere else.
    const found = url.pathname === "/status";
    const status = found ? 200 : 404;
    const payload = JSON.stringify(found ? STATUS : { error: "not_found" });

    res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      // BYTES, not characters. The e-acute in this payload is two bytes, so
      // payload.length would understate the size by one and the client would
      // be told to expect less than is coming.
      "content-length": Buffer.byteLength(payload),
    });

    if (method === "HEAD") {
      res.end();
      return;
    }
    res.end(payload);
  };
}
