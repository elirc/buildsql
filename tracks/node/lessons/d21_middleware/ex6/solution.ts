// d21_middleware / ex6 - who you are, and whether that is enough.
// See lessons/d21_middleware/README.md, "Problem 6".
import { type Request, type RequestHandler } from "express";

export interface Principal {
  name: string;
  roles: string[];
}

export interface BearerAuthOptions {
  /** Turns a token into a principal, or into nothing at all. */
  verify: (token: string) => Principal | undefined | Promise<Principal | undefined>;
}

/** A request that has been through `bearerAuth()`. */
export interface AuthedRequest extends Request {
  principal?: Principal;
}

/**
 * Reads `Authorization: Bearer <token>`, verifies it, and attaches the
 * principal to the request. No token, a token in another scheme, or a token
 * `verify` rejects is `401 { error: "unauthorized" }` with `WWW-Authenticate`.
 */
export function bearerAuth(options: BearerAuthOptions): RequestHandler {
  throw new Error("ex6: bearerAuth() is not implemented yet - edit this file.");
}

/**
 * Lets the request through only if the principal attached by `bearerAuth()` has
 * `role`. Otherwise `403 { error: "forbidden" }` — and no challenge header.
 */
export function requireRole(role: string): RequestHandler {
  throw new Error("ex6: requireRole() is not implemented yet - edit this file.");
}
