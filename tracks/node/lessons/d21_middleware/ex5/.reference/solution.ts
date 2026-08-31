// d21_middleware / ex5 - reference solution (author only, used by `dojo verify`).
import express, {
  type ErrorRequestHandler,
  type Express,
  type RequestHandler,
} from "express";

export const BODY_LIMIT = 200;

/**
 * express.json() skips a content-type it was not asked to parse and says
 * nothing about it, so req.body is left undefined. Both of these checks are
 * ours - the parser raises neither.
 */
const requireJsonBody: RequestHandler = (req, res, next) => {
  if (req.body === undefined) {
    res.status(415).json({ error: "unsupported_media_type" });
    return;
  }
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "empty_body" });
    return;
  }
  next();
};

/** Everything body-parser throws carries a `type`; that is the thing to switch on. */
const bodyErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  const type = (error as { type?: string }).type;
  if (type === "entity.too.large") {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }
  if (type === "entity.parse.failed") {
    res.status(400).json({ error: "invalid_json" });
    return;
  }
  next(error);
};

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: BODY_LIMIT, type: "application/json" }));

  app.post("/notes", requireJsonBody, (req, res) => {
    res.status(201).json({ id: "n1", title: String(req.body.title) });
  });

  app.use(bodyErrorHandler);

  return app;
}
