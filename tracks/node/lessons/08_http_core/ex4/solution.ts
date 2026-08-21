// 08_http_core / ex4 - path parameters and a conditional GET.
// See lessons/08_http_core/README.md, "Exercise 4".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/** The data this handler serves. Do not change it. */
export const ORDERS: Record<string, { id: string; item: string }> = {
  "1": { id: "1", item: "keyboard" },
  "2": { id: "2", item: "monitor" },
};

/** Provided: the JSON response helper from ex1. */
export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

export function createHandler(): Handler {
  throw new Error("ex4: createHandler() is not implemented yet - edit this file.");
}
