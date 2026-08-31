// d22_validation_zod / ex2 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";
import { z } from "zod";

export const eventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("keypress"), key: z.string().min(1) }),
  z.object({ type: z.literal("scroll"), delta: z.number() }),
]);

export type AppEvent = z.infer<typeof eventSchema>;

function summarise(event: AppEvent): string {
  // The union is discriminated, so TypeScript narrows on `type` here for free.
  switch (event.type) {
    case "click":
      return `click at ${event.x},${event.y}`;
    case "keypress":
      return `key ${event.key}`;
    case "scroll":
      return `scroll by ${event.delta}`;
  }
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.post("/events", (req, res) => {
    const result = eventSchema.safeParse(req.body);
    if (result.success) {
      res.status(202).json({ summary: summarise(result.data) });
      return;
    }

    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      code: issue.code,
      message: issue.message,
    }));

    // The discriminator failing and a branch failing are different answers:
    // one means "no such event", the other means "that event, spelled wrong".
    const unknownType = result.error.issues.some(
      (issue) => issue.code === "invalid_union_discriminator",
    );
    if (unknownType) {
      res.status(400).json({ error: "unknown_event_type", discriminator: "type", issues });
      return;
    }

    res.status(400).json({ error: "invalid_event", issues });
  });

  return app;
}
