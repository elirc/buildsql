// d24_mixed_gauntlet / ex6 - reference solution (author only, used by `dojo verify`).
import { createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import express, { type Express } from "express";

export interface UploadDeps {
  dir: string;
  limit: number;
  nextId: () => string;
}

export function createApp(deps: UploadDeps): Express {
  const app = express();
  //: id -> bytes stored. No express.json() anywhere: a body parser here would
  //: read the whole upload into memory before the route ever saw it.
  const stored = new Map<string, number>();

  app.post("/uploads", (req, res, next) => {
    const id = deps.nextId();
    const file = path.join(deps.dir, id);
    const out = createWriteStream(file);
    let size = 0;
    let tooLarge = false;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      // Past the limit: keep draining the request, but stop keeping the bytes.
      if (size > deps.limit) {
        tooLarge = true;
        return;
      }
      out.write(chunk);
    });

    req.on("error", next);

    req.on("end", () => {
      out.end(() => {
        if (!tooLarge) {
          stored.set(id, size);
          res.setHeader("location", `/uploads/${id}`);
          res.status(201).json({ id, bytes: size });
          return;
        }
        rm(file, { force: true }).then(() => {
          res.status(413).json({ error: "payload_too_large" });
        }, next);
      });
    });
  });

  app.get("/uploads/:id", (req, res) => {
    const bytes = stored.get(req.params.id);
    if (bytes === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ id: req.params.id, bytes });
  });

  return app;
}
