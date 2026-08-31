// d21_middleware / ex6 - reference solution (author only, used by `dojo verify`).
import { type Request, type RequestHandler } from "express";

export interface Principal {
  name: string;
  roles: string[];
}

export interface BearerAuthOptions {
  verify: (token: string) => Principal | undefined | Promise<Principal | undefined>;
}

export interface AuthedRequest extends Request {
  principal?: Principal;
}

/** The challenge belongs on every 401 and on no 403. */
function unauthorized(res: Parameters<RequestHandler>[1]): void {
  res.setHeader("www-authenticate", 'Bearer realm="api"');
  res.status(401).json({ error: "unauthorized" });
}

export function bearerAuth(options: BearerAuthOptions): RequestHandler {
  return async (req: AuthedRequest, res, next) => {
    const header = req.get("authorization");
    // Scheme first: a header in some other scheme is not a bearer token, and
    // handing its contents to verify() is how a Basic password ends up in a
    // token lookup.
    const [scheme, token] = (header ?? "").split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
      unauthorized(res);
      return;
    }

    const principal = await options.verify(token);
    if (principal === undefined) {
      unauthorized(res);
      return;
    }

    req.principal = principal;
    next();
  };
}

export function requireRole(role: string): RequestHandler {
  return (req: AuthedRequest, res, next) => {
    if (req.principal === undefined) {
      // Nobody has said who they are yet, so this is still an authentication
      // problem and not an authorisation one.
      unauthorized(res);
      return;
    }
    if (!req.principal.roles.includes(role)) {
      // Authenticated, and still not allowed. Retrying will not help, so there
      // is no challenge to send.
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}
