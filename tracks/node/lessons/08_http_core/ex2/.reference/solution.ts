// 08_http_core / ex2 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

export function createHandler(): Handler {
  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (req.method !== "GET" || url.pathname !== "/search") {
      sendJson(res, 404, { error: "not found" });
      return;
    }

    const q = url.searchParams.get("q");
    if (q === null || q === "") {
      sendJson(res, 400, { error: "q is required" });
      return;
    }

    const rawLimit = url.searchParams.get("limit");
    const limit = rawLimit === null ? 10 : Number(rawLimit);

    sendJson(res, 200, { q, limit, tags: url.searchParams.getAll("tag") });
  };
}
