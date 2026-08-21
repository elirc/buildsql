// 08_http_core / challenge - a router of your own.
// See lessons/08_http_core/README.md, "Challenge".
import type { IncomingMessage, ServerResponse } from "node:http";

export type RouteParams = Record<string, string>;

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  params: RouteParams,
) => void;

export interface Router {
  get(pattern: string, handler: RouteHandler): void;
  post(pattern: string, handler: RouteHandler): void;
  /** The request listener to hand to http.createServer(). */
  handler: (req: IncomingMessage, res: ServerResponse) => void;
}

export function createRouter(): Router {
  throw new Error("challenge: createRouter() is not implemented yet - edit this file.");
}
