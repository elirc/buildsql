// d18_http_raw / ex7 - reference solution (author only, used by `dojo verify`).
import { readFile, stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function createStaticServer(root: string): Handler {
  const base = path.resolve(root);

  return (req, res) => {
    void (async () => {
      const method = (req.method ?? "GET").toUpperCase();
      if (method !== "GET" && method !== "HEAD") {
        res.setHeader("allow", "GET, HEAD");
        sendJson(res, 405, { error: "method_not_allowed" });
        return;
      }

      const url = new URL(req.url ?? "/", "http://localhost");
      let decoded: string;
      try {
        // The pathname is still percent-encoded, and %2f is how an attacker
        // smuggles a separator past a client that would have normalised "/../".
        decoded = decodeURIComponent(url.pathname);
      } catch {
        sendJson(res, 400, { error: "bad_request" });
        return;
      }

      // Strip the leading slash so the path is resolved UNDER the root rather
      // than as an absolute path that replaces it.
      const relative = decoded.replace(/^\/+/, "");
      const target = path.resolve(base, relative);

      // Resolve first, judge second - and judge by segment, so a directory
      // honestly called "..config" is not mistaken for an escape.
      const fromBase = path.relative(base, target);
      const inside =
        fromBase !== "" && !path.isAbsolute(fromBase) && fromBase.split(path.sep)[0] !== "..";
      if (!inside) {
        sendJson(res, 403, { error: "forbidden" });
        return;
      }

      try {
        const info = await stat(target);
        // A directory is not a file, and inventing a listing leaks filenames.
        if (!info.isFile()) {
          sendJson(res, 404, { error: "not_found" });
          return;
        }

        const contents = await readFile(target);
        res.writeHead(200, {
          "content-type":
            CONTENT_TYPES[path.extname(target).toLowerCase()] ?? "application/octet-stream",
          "content-length": contents.length,
        });
        if (method === "HEAD") res.end();
        else res.end(contents);
      } catch {
        sendJson(res, 404, { error: "not_found" });
      }
    })();
  };
}
