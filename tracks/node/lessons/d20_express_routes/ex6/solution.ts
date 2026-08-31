// d20_express_routes / ex6 - settings, app.locals and res.locals.
// See lessons/d20_express_routes/README.md, "Problem 6".
import { type Express } from "express";

export interface AppConfig {
  /** Sets express's "strict routing" setting. */
  strict: boolean;
  /** Sets express's "case sensitive routing" setting. */
  caseSensitive: boolean;
  /** An application-wide value every response may use. */
  service: string;
}

/**
 * `GET /notes` answers `{ service, tenant, strict }`, where `service` comes
 * from `app.locals`, `strict` is read back out of the app's settings, and
 * `tenant` is written into `res.locals` by middleware from the `x-tenant`
 * header, defaulting to `"public"`.
 */
export function createApp(config: AppConfig): Express {
  throw new Error("ex6: createApp() is not implemented yet - edit this file.");
}
