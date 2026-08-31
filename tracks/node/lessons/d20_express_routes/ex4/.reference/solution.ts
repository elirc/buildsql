// d20_express_routes / ex4 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type NextFunction, type Request, type Response } from "express";

interface TrailedRequest extends Request {
  trail?: string[];
}

export function createApp(): Express {
  const app = express();

  const guard = (req: TrailedRequest, _res: Response, next: NextFunction) => {
    req.trail = req.trail ?? [];
    req.trail.push("guard");
    // next("route") is not an error and not a skip-one: it abandons the rest of
    // THIS route and offers the request to the next route that matches.
    if (!/^\d+$/.test(String(req.params.id))) {
      next("route");
      return;
    }
    next();
  };

  app.get("/reports/:id", guard, (req: TrailedRequest, res) => {
    req.trail?.push("numeric");
    res.json({ handled: "numeric", trail: req.trail });
  });

  app.get("/reports/:id", (req: TrailedRequest, res) => {
    req.trail?.push("slug");
    res.json({ handled: "slug", trail: req.trail });
  });

  return app;
}
