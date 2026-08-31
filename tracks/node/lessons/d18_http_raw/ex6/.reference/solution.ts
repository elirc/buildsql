// d18_http_raw / ex6 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(res: ServerResponse, status: number, body: unknown, etag?: string): void {
  const payload = JSON.stringify(body);
  const headers: Record<string, string | number> = {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  };
  if (etag !== undefined) headers.etag = etag;
  res.writeHead(status, headers);
  res.end(payload);
}

export function createHandler(): Handler {
  let config = { id: "cfg-1", threshold: 10 };
  let version = 1;
  //: an entity tag is a QUOTED string in the message - the quotes are syntax
  const etag = (): string => `"v${version}"`;

  return (req, res) => {
    void (async () => {
      const url = new URL(req.url ?? "/", "http://localhost");
      const method = (req.method ?? "GET").toUpperCase();

      if (url.pathname !== "/config") {
        sendJson(res, 404, { error: "not_found" });
        return;
      }

      if (method === "GET") {
        sendJson(res, 200, config, etag());
        return;
      }

      if (method !== "PUT") {
        sendJson(res, 405, { error: "method_not_allowed" });
        return;
      }

      // Drain the body first: answering without reading it leaves bytes in the
      // socket that the next response has to step over.
      const raw = await readBody(req);
      const ifMatch = req.headers["if-match"];

      if (ifMatch === undefined) {
        // Not "forgive it and write anyway". The client has to read first.
        sendJson(res, 428, { error: "precondition_required" });
        return;
      }
      if (ifMatch.trim() !== "*" && ifMatch.trim() !== etag()) {
        sendJson(res, 412, { error: "precondition_failed" });
        return;
      }

      let parsed: { threshold?: unknown };
      try {
        parsed = JSON.parse(raw) as { threshold?: unknown };
      } catch {
        sendJson(res, 400, { error: "invalid_json" });
        return;
      }
      if (typeof parsed.threshold !== "number") {
        sendJson(res, 400, { error: "invalid_body" });
        return;
      }

      config = { ...config, threshold: parsed.threshold };
      version += 1;
      sendJson(res, 200, config, etag());
    })();
  };
}
