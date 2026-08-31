// d23_rest_patterns / ex6 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Payment {
  id: string;
  amount: number;
}

/** What was answered the first time a key was seen. */
interface Recorded {
  fingerprint: string;
  status: number;
  body: unknown;
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  const payments: Payment[] = [];
  const seen = new Map<string, Recorded>();
  let nextId = 1;

  app.get("/payments", (_req, res) => {
    res.json(payments);
  });

  app.post("/payments", (req, res) => {
    const key = req.get("idempotency-key");
    const fingerprint = JSON.stringify(req.body ?? null);

    if (key !== undefined) {
      const previous = seen.get(key);
      if (previous !== undefined) {
        if (previous.fingerprint !== fingerprint) {
          // Replaying the old answer would tell the client that THIS request
          // succeeded, when it was never attempted.
          res.status(409).json({ error: "idempotency_key_reuse" });
          return;
        }
        // The original answer, unchanged, plus the one header that lets the
        // client tell a retry that worked from a charge that happened twice.
        res.status(previous.status).set("Idempotency-Replayed", "true").json(previous.body);
        return;
      }
    }

    const amount = (req.body as { amount?: unknown }).amount;
    if (typeof amount !== "number") {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const payment: Payment = { id: `pay-${nextId}`, amount };
    nextId += 1;
    payments.push(payment);

    // Record the answer, not just the fact that the key was used.
    if (key !== undefined) seen.set(key, { fingerprint, status: 201, body: payment });
    res.status(201).json(payment);
  });

  return app;
}
