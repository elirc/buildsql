// 10_middleware_validation / ex1 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export function createApp(log: (line: string) => void): Express {
  const app = express();

  app.use(express.json());

  app.use((req, res, next) => {
    // "finish" fires once the last byte of the response is handed to the
    // socket - the first moment the status code is final.
    res.on("finish", () => {
      log(`${req.method} ${req.path} ${res.statusCode}`);
    });
    next();
  });

  app.post("/echo", (req, res) => {
    res.json(req.body);
  });

  return app;
}
