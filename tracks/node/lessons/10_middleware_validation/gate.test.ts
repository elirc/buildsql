// Gate for node/10_middleware_validation. Quoted verbatim in README.md.
//
// The rate limiter is graded with an injected clock, so no test sleeps and
// nothing here depends on how fast your machine is.
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { createApp as createEcho } from "./ex1/solution";
import { createApp as createValidated } from "./ex2/solution";
import { createApp as createHandled } from "./ex3/solution";
import { createApp as createAsync } from "./ex4/solution";
import { createApp as createLimited } from "./challenge/solution";

describe("10_middleware_validation", () => {
  test("ex1 - the app parses JSON bodies and logs finished requests", async () => {
    const lines: string[] = [];
    const app = createEcho((line) => lines.push(line));

    const echoed = await request(app)
      .post("/echo")
      .set("content-type", "application/json")
      .send({ item: "desk", qty: 2 });

    expect(echoed.status, "a parsed body comes back as a 200").toBe(200);
    expect(
      echoed.body,
      "express.json() puts the parsed body on req.body - without it, req.body " +
        "is undefined and this endpoint answers with nothing",
    ).toEqual({ item: "desk", qty: 2 });

    expect(
      lines,
      "the logger records METHOD PATH STATUS *after* the response is finished, " +
        "which is the only moment the status code is known",
    ).toEqual(["POST /echo 200"]);

    const missing = await request(app).get("/nope");
    expect(missing.status, "an unknown path is still a 404").toBe(404);
    expect(
      lines,
      "the logger runs for every request, including the ones no route answered",
    ).toEqual(["POST /echo 200", "GET /nope 404"]);

    const broken = await request(app)
      .post("/echo")
      .set("content-type", "application/json")
      .send("{ not json");
    expect(
      broken.status,
      "a body that will not parse is rejected by express.json() itself, with " +
        "a 400 - you do not have to write that check",
    ).toBe(400);
  });

  test("ex2 - validateBody() parses with a schema and reports every problem", async () => {
    const app = createValidated();

    const created = await request(app)
      .post("/orders")
      .set("content-type", "application/json")
      .send({ item: "desk", qty: 2, extra: "ignore me" });

    expect(created.status, "a valid body is a 201").toBe(201);
    expect(
      created.body,
      "the handler sees the PARSED value, not the raw one: zod strips keys the " +
        "schema does not mention, which is why `extra` is gone (README ex2)",
    ).toEqual({ id: 1, item: "desk", qty: 2 });

    const invalid = await request(app)
      .post("/orders")
      .set("content-type", "application/json")
      .send({ qty: 0 });

    expect(invalid.status, "a body that fails the schema is a 400").toBe(400);
    expect(
      invalid.body.error,
      "with a stable machine-readable error string",
    ).toBe("validation failed");
    expect(
      (invalid.body.details as { path: string }[]).map((issue) => issue.path).sort(),
      "and one detail per failing field - BOTH of them. Reporting only the " +
        "first problem means the client fixes one field per round trip",
    ).toEqual(["item", "qty"]);
    expect(
      (invalid.body.details as { message: string }[]).every(
        (issue) => typeof issue.message === "string" && issue.message.length > 0,
      ),
      "each detail carries the message zod produced for that field",
    ).toBe(true);

    const wrongType = await request(app)
      .post("/orders")
      .set("content-type", "application/json")
      .send({ item: "desk", qty: "2" });
    expect(
      wrongType.status,
      'a quantity of "2" is a string, and the schema says number. JSON has ' +
        "types, so this is a real mismatch and not a coercion opportunity",
    ).toBe(400);
  });

  test("ex3 - one error handler at the bottom, and nothing leaks out of it", async () => {
    const logged: unknown[] = [];
    const app = createHandled((error) => logged.push(error));

    const found = await request(app).get("/orders/1");
    expect(found.status, "the happy path is untouched").toBe(200);
    expect(found.body).toEqual({ id: "1", item: "keyboard" });

    const missing = await request(app).get("/orders/999");
    expect(
      missing.status,
      "the route throws an AppError with status 404 and the handler uses it",
    ).toBe(404);
    expect(
      missing.body,
      "the shape is the same for every failure: an error code and a message " +
        "the client is allowed to see",
    ).toEqual({ error: "not_found", message: "no such order" });
    expect(
      logged,
      "an expected, operational failure is not worth logging as a defect",
    ).toEqual([]);

    const boom = await request(app).get("/boom");
    expect(boom.status, "an unexpected error is a 500").toBe(500);
    expect(
      boom.body,
      "and the client is told nothing useful to an attacker: no message, no " +
        "stack, no connection string",
    ).toEqual({ error: "internal_error", message: "internal server error" });
    expect(
      JSON.stringify(boom.body).includes("postgres://"),
      "the thrown error's message contains a database URL. If it reaches the " +
        "client you have just leaked a credential (README ex3)",
    ).toBe(false);
    expect(
      logged.length,
      "...but it MUST be logged, with the real error, or nobody will ever fix it",
    ).toBe(1);

    const unmatched = await request(app).get("/nowhere");
    expect(unmatched.status, "an unmatched path is a 404").toBe(404);
    expect(
      unmatched.body,
      "and it uses the same JSON shape - an API that answers HTML on one path " +
        "and JSON on another breaks every client that assumed JSON",
    ).toEqual({ error: "not_found", message: "no such route" });
  });

  test("ex4 - express 5 forwards a rejected promise to the error handler", async () => {
    const app = createAsync();

    const ok = await request(app).get("/ok");
    expect(ok.status, "the async happy path resolves normally").toBe(200);
    expect(ok.body).toEqual({ status: "ok" });

    const unavailable = await request(app).get("/slow-dependency");
    expect(
      unavailable.status,
      "the handler is async and the promise it returns REJECTS. In express 5 " +
        "that reaches the error handler on its own - no try/catch, no " +
        "next(error), no wrapper library (README ex4)",
    ).toBe(503);
    expect(unavailable.body).toEqual({
      error: "upstream_unavailable",
      message: "the pricing service is down",
    });

    const conflict = await request(app).get("/queued");
    expect(
      conflict.status,
      "a middleware that calls next(error) reaches the same handler - the two " +
        "routes into the error path end up in the same place",
    ).toBe(409);
    expect(conflict.body).toEqual({
      error: "conflict",
      message: "that job is already queued",
    });
  });

  test("challenge - the rate limiter counts per key, per window, on a clock you control", async () => {
    const clock = vi.fn(() => 1_000_000);
    const app = createLimited({ limit: 3, windowMs: 60_000, now: clock });

    const first = await request(app).get("/ping").set("x-api-key", "alice");
    expect(first.status, "the first request of a window is allowed").toBe(200);
    expect(
      first.headers["x-ratelimit-limit"],
      "tell the client its budget",
    ).toBe("3");
    expect(
      first.headers["x-ratelimit-remaining"],
      "...and what is left of it after this request",
    ).toBe("2");

    await request(app).get("/ping").set("x-api-key", "alice");
    const third = await request(app).get("/ping").set("x-api-key", "alice");
    expect(third.status, "three requests fit in a limit of three").toBe(200);
    expect(third.headers["x-ratelimit-remaining"], "and none are left").toBe("0");

    const denied = await request(app).get("/ping").set("x-api-key", "alice");
    expect(denied.status, "the fourth is refused with 429").toBe(429);
    expect(denied.body).toEqual({ error: "too many requests" });
    expect(
      denied.headers["retry-after"],
      "a 429 without Retry-After tells the client to guess, and it will guess " +
        "wrong: 60 seconds are left of this window",
    ).toBe("60");

    const bob = await request(app).get("/ping").set("x-api-key", "bob");
    expect(
      bob.status,
      "limits are per key: alice being over her budget must not affect bob",
    ).toBe(200);

    clock.mockReturnValue(1_000_000 + 30_000);
    const midWindow = await request(app).get("/ping").set("x-api-key", "alice");
    expect(midWindow.status, "half way through the window she is still over").toBe(429);
    expect(
      midWindow.headers["retry-after"],
      "and Retry-After now reflects the time actually left: 30 seconds",
    ).toBe("30");

    clock.mockReturnValue(1_000_000 + 60_001);
    const newWindow = await request(app).get("/ping").set("x-api-key", "alice");
    expect(
      newWindow.status,
      "once the window has passed, the count starts again",
    ).toBe(200);
    expect(newWindow.headers["x-ratelimit-remaining"]).toBe("2");

    const anonymous = await request(app).get("/ping");
    expect(
      anonymous.status,
      "a request with no key still needs a bucket - everyone anonymous shares " +
        "one, which is a decision worth making on purpose",
    ).toBe(200);
  });
});
