// 08_http_core / ex1 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const ORDERS = [
  { id: "1", item: "keyboard" },
  { id: "2", item: "monitor" },
];

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

export function createHandler(): Handler {
  return (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { status: "ok" });
      return;
    }
    if (req.method === "GET" && req.url === "/orders") {
      sendJson(res, 200, ORDERS);
      return;
    }
    sendJson(res, 404, { error: "not found" });
  };
}
