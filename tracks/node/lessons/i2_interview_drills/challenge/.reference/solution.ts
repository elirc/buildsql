// i2_interview_drills / challenge - reference solution (author only, used by `dojo verify`).
import { createHash } from "node:crypto";
import express, { type Express } from "express";
import { z } from "zod";

export interface Article {
  id: string;
  title: string;
  tag: "node" | "http" | "streams";
}

export const createArticleSchema = z.object({
  title: z.string().min(1),
  tag: z.enum(["node", "http", "streams"]),
});

export const SEED: Article[] = [
  { id: "a-1", title: "Streams in anger", tag: "node" },
  { id: "a-2", title: "The event loop, again", tag: "node" },
  { id: "a-3", title: "Backpressure explained", tag: "streams" },
];

const etagFor = (body: string): string =>
  `"${createHash("sha1").update(body).digest("hex")}"`;

export function createApp(): Express {
  const app = express();
  const articles: Article[] = SEED.map((article) => ({ ...article }));
  let nextId = articles.length + 1;

  app.use(express.json());

  app.get("/articles", (req, res) => {
    const page = Number(req.query.page ?? "1");
    const perPage = Number(req.query.perPage ?? "10");
    if (
      !Number.isInteger(page) || page < 1 ||
      !Number.isInteger(perPage) || perPage < 1 || perPage > 50
    ) {
      res.status(400).json({ error: "invalid_pagination" });
      return;
    }

    const start = (page - 1) * perPage;
    const payload = {
      items: articles.slice(start, start + perPage).map((article) => ({ ...article })),
      page,
      perPage,
      total: articles.length,
    };

    const body = JSON.stringify(payload);
    const etag = etagFor(body);
    res.setHeader("etag", etag);
    res.setHeader("cache-control", "no-cache");

    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304);
      res.end();
      return;
    }

    res.setHeader("content-type", "application/json");
    res.send(body);
  });

  app.post("/articles", (req, res) => {
    const parsed = createArticleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation_failed",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const article: Article = { id: `a-${nextId}`, ...parsed.data };
    nextId += 1;
    articles.push(article);

    res.setHeader("location", `/articles/${article.id}`);
    res.status(201).json(article);
  });

  return app;
}
