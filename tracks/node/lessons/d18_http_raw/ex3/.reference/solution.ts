// d18_http_raw / ex3 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (header === undefined) return cookies;

  for (const entry of header.split(";")) {
    const pair = entry.trim();
    if (pair === "") continue;

    // The FIRST equals sign only: a base64 value ends in padding, and
    // split("=") would throw the padding away.
    const separator = pair.indexOf("=");
    if (separator === -1) continue;

    const name = pair.slice(0, separator).trim();
    if (name === "") continue;
    cookies[name] = decodeURIComponent(pair.slice(separator + 1).trim());
  }
  return cookies;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function createHandler(): Handler {
  //: the id counter lives in the closure, so each handler owns its own
  let issued = 0;

  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const method = (req.method ?? "GET").toUpperCase();

    if (url.pathname !== "/session") {
      sendJson(res, 404, { error: "not_found" });
      return;
    }

    if (method === "POST") {
      issued += 1;
      // One setHeader call with an ARRAY. Calling it twice replaces the first
      // header rather than adding a second one.
      res.setHeader("set-cookie", [
        `sid=s-${issued}; Path=/; HttpOnly; Max-Age=3600`,
        "theme=dark; Path=/; Max-Age=86400",
      ]);
      sendJson(res, 201, { session: `s-${issued}` });
      return;
    }

    sendJson(res, 200, { cookies: parseCookies(req.headers.cookie) });
  };
}
