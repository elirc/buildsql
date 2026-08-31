// d19_http_routing / ex7 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  params: Record<string, string>,
) => void | Promise<void>;

export interface RouterOptions {
  onError?: (error: unknown) => void;
}

export interface Router {
  get(pattern: string, handler: RouteHandler): void;
  post(pattern: string, handler: RouteHandler): void;
  put(pattern: string, handler: RouteHandler): void;
  delete(pattern: string, handler: RouteHandler): void;
  handler: Handler;
}

interface Route {
  method: string;
  parts: string[];
  handler: RouteHandler;
}

function segmentsOf(path: string): string[] {
  return path.split("/").filter((segment) => segment !== "");
}

function rankAt(parts: string[], index: number): number {
  if (index >= parts.length) return 1;
  const part = parts[index];
  if (part.startsWith("*")) return 0;
  if (part.startsWith(":")) return 2;
  return 3;
}

function match(patternParts: string[], pathParts: string[]): Record<string, string> | null {
  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i];
    if (part.startsWith("*")) {
      params[part.slice(1)] = pathParts.slice(i).join("/");
      return params;
    }
    if (i >= pathParts.length) {
      const remaining = patternParts.slice(i);
      return remaining.every((rest) => rest.startsWith(":") && rest.endsWith("?")) ? params : null;
    }
    if (part.startsWith(":")) {
      const optional = part.endsWith("?");
      params[part.slice(1, optional ? -1 : undefined)] = pathParts[i];
      continue;
    }
    if (part !== pathParts[i]) return null;
  }

  return pathParts.length === patternParts.length ? params : null;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function createRouter(options: RouterOptions = {}): Router {
  const routes: Route[] = [];

  const register = (method: string, pattern: string, handler: RouteHandler): void => {
    routes.push({ method, parts: segmentsOf(pattern), handler });
    // Sorted on the way in rather than on every request. sort() is stable, so
    // equally specific routes keep their registration order.
    routes.sort((a, b) => {
      const length = Math.max(a.parts.length, b.parts.length);
      for (let i = 0; i < length; i += 1) {
        const difference = rankAt(b.parts, i) - rankAt(a.parts, i);
        if (difference !== 0) return difference;
      }
      return 0;
    });
  };

  const handler: Handler = (req, res) => {
    // The listener signature is synchronous, so the async work is started and
    // its failures are caught here - nothing is allowed to escape as an
    // unhandled rejection.
    void (async () => {
      try {
        const url = new URL(req.url ?? "/", "http://localhost");
        const pathParts = segmentsOf(url.pathname).map(decodeURIComponent);
        const method = (req.method ?? "GET").toUpperCase();
        // HEAD is not registered: it runs the GET and Node drops the body.
        const wanted = method === "HEAD" ? "GET" : method;

        for (const route of routes) {
          if (route.method !== wanted) continue;
          const params = match(route.parts, pathParts);
          if (params === null) continue;
          await route.handler(req, res, params);
          return;
        }

        const allowed = new Set<string>();
        for (const route of routes) {
          if (match(route.parts, pathParts) !== null) allowed.add(route.method);
        }

        // No method at all matches this path, so the path is what is missing.
        if (allowed.size === 0) {
          sendJson(res, 404, { error: "not_found" });
          return;
        }

        if (allowed.has("GET")) allowed.add("HEAD");
        allowed.add("OPTIONS");
        const allow = [...allowed].sort().join(", ");

        if (method === "OPTIONS") {
          res.writeHead(204, { allow });
          res.end();
          return;
        }

        res.setHeader("allow", allow);
        sendJson(res, 405, { error: "method_not_allowed" });
      } catch (error) {
        options.onError?.(error);
        // A handler that already started writing cannot be given a 500.
        if (res.headersSent) res.end();
        else sendJson(res, 500, { error: "internal_error" });
      }
    })();
  };

  return {
    get: (pattern, route) => register("GET", pattern, route),
    post: (pattern, route) => register("POST", pattern, route),
    put: (pattern, route) => register("PUT", pattern, route),
    delete: (pattern, route) => register("DELETE", pattern, route),
    handler,
  };
}
