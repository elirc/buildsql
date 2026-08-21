// 09_express_fundamentals / ex3 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type NextFunction, type Request, type Response } from "express";

export function createApp(): Express {
  const app = express();
  let requests = 0;

  // App-level: runs for every request, including ones that match no route.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    requests += 1;
    res.setHeader("x-request-id", `req-${requests}`);
    res.locals.trail = ["app"];
    next();
  });

  const markRoute = (_req: Request, res: Response, next: NextFunction): void => {
    (res.locals.trail as string[]).push("route");
    next();
  };

  app.get("/trail", markRoute, (_req, res) => {
    const trail = res.locals.trail as string[];
    trail.push("handler");
    res.json({ trail });
  });

  const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
    if (req.headers["x-api-key"] !== "let-me-in") {
      res.status(401).json({ error: "unauthorized" });
      return; // no next(): the line stops here
    }
    next();
  };

  app.get("/admin", requireApiKey, (_req, res) => {
    res.json({ secret: "the cake is a lie" });
  });

  return app;
}
