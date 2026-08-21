// 08_http_core / ex4 - reference solution (author only, used by `dojo verify`).
import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export const ORDERS: Record<string, { id: string; item: string }> = {
  "1": { id: "1", item: "keyboard" },
  "2": { id: "2", item: "monitor" },
};

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
    const segments = url.pathname.split("/").filter((segment) => segment !== "");

    if (req.method !== "GET" || segments.length !== 2 || segments[0] !== "orders") {
      sendJson(res, 404, { error: "not found" });
      return;
    }

    const order = ORDERS[segments[1]];
    if (order === undefined) {
      sendJson(res, 404, { error: "not found" });
      return;
    }

    const body = JSON.stringify(order);
    const etag = `"${createHash("sha1").update(body).digest("hex")}"`;
    res.setHeader("etag", etag);
    res.setHeader("cache-control", "no-cache");

    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304);
      res.end();
      return;
    }

    res.writeHead(200, {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(body),
    });
    res.end(body);
  };
}
