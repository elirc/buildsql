// d20_express_routes / ex2 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type Request } from "express";

export interface Note {
  id: string;
  title: string;
}

export const SEED: Note[] = [
  { id: "n1", title: "buy milk" },
  { id: "n2", title: "call ada" },
];

/** What the param callback adds to the request, for the handlers below it. */
interface LoadedRequest extends Request {
  note?: Note;
  seenBy?: string[];
}

export function createApp(): Express {
  const app = express();
  const notes: Note[] = SEED.map((note) => ({ ...note }));
  let lookups = 0;

  app.use(express.json());

  // Registered once, for every route whose path contains :id - and only those.
  app.param("id", (req: LoadedRequest, res, next, id: string) => {
    lookups += 1;
    const note = notes.find((candidate) => candidate.id === id);
    if (note === undefined) {
      // The one place the 404 is worded.
      res.status(404).json({ error: "not_found" });
      return;
    }
    req.note = note;
    req.seenBy = [];
    next();
  });

  const stamp = (req: LoadedRequest, _res: express.Response, next: express.NextFunction) => {
    req.seenBy?.push("stamp");
    next();
  };

  app.get("/notes/:id", stamp, (req: LoadedRequest, res) => {
    req.seenBy?.push("show");
    res.json({ note: req.note, seenBy: req.seenBy });
  });

  app.put("/notes/:id", (req: LoadedRequest, res) => {
    const note = req.note as Note;
    note.title = String(req.body.title);
    res.json(note);
  });

  app.delete("/notes/:id", (req: LoadedRequest, res) => {
    const index = notes.findIndex((candidate) => candidate.id === (req.note as Note).id);
    notes.splice(index, 1);
    res.status(204).end();
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/stats", (_req, res) => {
    res.json({ lookups });
  });

  return app;
}
