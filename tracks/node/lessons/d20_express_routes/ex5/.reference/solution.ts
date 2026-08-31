// d20_express_routes / ex5 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export function createApp(): Express {
  const app = express();

  // Registered on the parent, so it runs for everything - mounted or not.
  app.use((_req, res, next) => {
    res.setHeader("x-parent", "ran");
    next();
  });

  const api = express();

  // Registered on the sub-app, so mounting is what scopes it to /api/v2.
  api.use((_req, res, next) => {
    res.setHeader("x-sub", "ran");
    next();
  });

  api.get("/notes/:id", (req, res) => {
    res.json({
      // where this app was mounted
      baseUrl: req.baseUrl,
      // what the client asked for, untouched
      originalUrl: req.originalUrl,
      // what is left for this app to route on, query string included
      url: req.url,
      id: req.params.id,
    });
  });

  app.use("/api/v2", api);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
