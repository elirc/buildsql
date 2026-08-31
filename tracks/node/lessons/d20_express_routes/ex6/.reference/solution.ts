// d20_express_routes / ex6 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface AppConfig {
  strict: boolean;
  caseSensitive: boolean;
  service: string;
}

export function createApp(config: AppConfig): Express {
  const app = express();

  // Both settings are read when the router is built, so they have to be set
  // before any route is registered - afterwards they change nothing.
  app.set("strict routing", config.strict);
  app.set("case sensitive routing", config.caseSensitive);

  // Application-wide, shared by every request.
  app.locals.service = config.service;

  app.use((req, res, next) => {
    // Per response, thrown away when it is finished.
    res.locals.tenant = req.get("x-tenant") ?? "public";
    next();
  });

  app.get("/notes", (_req, res) => {
    res.json({
      service: app.locals.service,
      tenant: res.locals.tenant,
      strict: app.get("strict routing") as boolean,
    });
  });

  return app;
}
