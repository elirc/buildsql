// d19_http_routing / ex7 - the router, assembled.
// See lessons/d19_http_routing/README.md, "Problem 7".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  params: Record<string, string>,
) => void | Promise<void>;

export interface RouterOptions {
  /** Told about anything a handler threw, before the 500 goes out. */
  onError?: (error: unknown) => void;
}

export interface Router {
  get(pattern: string, handler: RouteHandler): void;
  post(pattern: string, handler: RouteHandler): void;
  put(pattern: string, handler: RouteHandler): void;
  delete(pattern: string, handler: RouteHandler): void;
  /** The request listener to hand to http.createServer(). */
  handler: Handler;
}

/**
 * Routes tried most-specific first, async handlers awaited, OPTIONS and HEAD
 * answered by the router, 404 for an unknown path and 405 with `Allow` for a
 * known one.
 */
export function createRouter(options: RouterOptions = {}): Router {
  throw new Error("ex7: createRouter() is not implemented yet - edit this file.");
}
