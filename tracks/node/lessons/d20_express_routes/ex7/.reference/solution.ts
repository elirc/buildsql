// d20_express_routes / ex7 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface ResourceRecord {
  id: string;
  title: string;
}

export interface ResourceStore {
  list(): ResourceRecord[];
  get(id: string): ResourceRecord | undefined;
  create(input: { title: string }): ResourceRecord;
  update(id: string, input: { title: string }): ResourceRecord | undefined;
  remove(id: string): boolean;
}

export interface ResourceSpec {
  name: string;
  store: ResourceStore;
}

export function mountResource(app: Express, spec: ResourceSpec): void {
  const { name, store } = spec;
  // A Router keeps the paths relative and the closure keeps `store` private to
  // this resource - which is what makes two mounts independent.
  const router = express.Router();

  router.get("/", (_req, res) => {
    res.json(store.list());
  });

  router.post("/", (req, res) => {
    const created = store.create({ title: String(req.body.title) });
    res.setHeader("location", `/${name}/${created.id}`);
    res.status(201).json(created);
  });

  router.get("/:id", (req, res) => {
    const found = store.get(req.params.id);
    if (found === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(found);
  });

  router.put("/:id", (req, res) => {
    const updated = store.update(req.params.id, { title: String(req.body.title) });
    if (updated === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    if (!store.remove(req.params.id)) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.status(204).end();
  });

  app.use(`/${name}`, router);
}
