// d20_express_routes / ex1 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Note {
  id: string;
  title: string;
}

export const SEED: Note[] = [
  { id: "n1", title: "buy milk" },
  { id: "n2", title: "call ada" },
];

export function createApp(): Express {
  const app = express();
  const notes: Note[] = SEED.map((note) => ({ ...note }));

  app.use(express.json());

  app
    .route("/notes/:id")
    .get((req, res) => {
      const note = notes.find((candidate) => candidate.id === req.params.id);
      if (note === undefined) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json(note);
    })
    .put((req, res) => {
      const note = notes.find((candidate) => candidate.id === req.params.id);
      if (note === undefined) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      note.title = String(req.body.title);
      res.json(note);
    })
    .delete((req, res) => {
      const index = notes.findIndex((candidate) => candidate.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      notes.splice(index, 1);
      // 204 says "done, and there is nothing to send" - so send nothing.
      res.status(204).end();
    });

  return app;
}
