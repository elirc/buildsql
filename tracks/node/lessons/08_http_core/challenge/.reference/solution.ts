// 08_http_core / challenge - reference solution (author only, used by `dojo verify`).
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
  handler: (req: IncomingMessage, res: ServerResponse) => void;
}

interface Route {
  method: string;
  segments: string[];
  handler: RouteHandler;
}

const split = (pathname: string): string[] =>
  pathname.split("/").filter((segment) => segment !== "");

function match(route: Route, segments: string[]): RouteParams | null {
  if (route.segments.length !== segments.length) return null;
  const params: RouteParams = {};
  for (const [index, pattern] of route.segments.entries()) {
    if (pattern.startsWith(":")) params[pattern.slice(1)] = segments[index];
    else if (pattern !== segments[index]) return null;
  }
  return params;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

export function createRouter(): Router {
  const routes: Route[] = [];

  const add = (method: string, pattern: string, handler: RouteHandler): void => {
    routes.push({ method, segments: split(pattern), handler });
  };

  return {
    get: (pattern, handler) => add("GET", pattern, handler),
    post: (pattern, handler) => add("POST", pattern, handler),

    handler: (req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      const segments = split(url.pathname);
      const allowed = new Set<string>();

      for (const route of routes) {
        const params = match(route, segments);
        if (params === null) continue;
        if (route.method === req.method) {
          route.handler(req, res, params);
          return;
        }
        allowed.add(route.method);
      }

      if (allowed.size > 0) {
        res.setHeader("allow", [...allowed].join(", "));
        sendJson(res, 405, { error: "method not allowed" });
        return;
      }
      sendJson(res, 404, { error: "not found" });
    },
  };
}
