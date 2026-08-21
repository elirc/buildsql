# 10 — Middleware, validation and error handling

An express app is a list of functions. This lesson is about the three
functions every real service has in that list and most tutorials skip: one
that reads the body, one that checks it is what you asked for, and one at the
very bottom that turns every failure in the whole application into an honest
response.

The last one deserves its own sentence. Without a central error handler, every
route needs its own `try`/`catch`, every `catch` invents its own JSON shape,
and one of them eventually forgets and sends a stack trace to a customer. With
one, a route can simply `throw` — express catches it, your handler decides
what the client is allowed to know, and the real error goes to your logs. The
same funnel handles a 404, a validation failure and a database outage, which
is why an API built this way answers consistently even on the paths nobody
tested.

Validation is the other half of the same idea. Everything arriving from
outside — body, query, params, headers — is `unknown` no matter what
TypeScript says, because types are erased before the request arrives. A schema
is the runtime check that makes the type true, and once you have parsed at the
edge, every line downstream is working with data that provably has the shape
it claims.

## Concept — parse at the edge, fail into one funnel

**Body parsing** is a middleware, not a feature:

```ts
app.use(express.json());          // JSON bodies -> req.body
app.use(express.json({ limit: "100kb" }));       // the default limit
app.use(express.urlencoded({ extended: true })); // HTML form posts
```

Without it `req.body` is `undefined` — the body is a stream that nobody read
(lesson 08 ex3, now built in). With it, a body that will not parse produces a
400 automatically, because the parser calls `next(error)` with an error that
already carries a status.

**Validation with zod.** A schema is a value that can both check data at run
time and describe its type at compile time:

```ts
import { z } from "zod";

const createOrder = z.object({
  item: z.string().min(1),
  qty: z.number().int().positive(),
});

type CreateOrder = z.infer<typeof createOrder>;   // { item: string; qty: number }

const result = createOrder.safeParse(req.body);
if (!result.success) {
  result.error.issues;      // [{ path: ["qty"], message: "..." }, ...]
} else {
  result.data;              // typed, and with unknown keys stripped
}
```

Two things to notice. `safeParse` returns a result object rather than
throwing, which makes it pleasant in a middleware. And it reports **every**
problem, so a client can fix a whole form in one round trip instead of
discovering the errors one at a time.

The phrase to remember is *parse, don't validate*. A validator says "this
looks fine" and hands you back the same untyped thing. A parser hands you a
new value that is, by construction, the shape you asked for — which is why the
exercise makes you assign `result.data` back onto `req.body`.

**Error handling.** An error handler is a middleware with **four**
parameters, registered **last**:

```ts
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  // ...
});
```

Four is not a style choice; it is how express tells an error handler from an
ordinary one. Three parameters and it is never called with an error, which is
the most confusing bug in express and always looks like "my error handler does
not work".

Errors reach it three ways: a `throw` in a synchronous handler, a call to
`next(error)` from anywhere, and — **new in express 5** — a rejected promise
returned by an `async` handler. That third road is why express 5 matters:

```ts
// express 4: hangs the request, logs an unhandled rejection
// express 5: reaches the error handler
app.get("/prices", async (req, res) => {
  const prices = await fetchPrices();   // rejects
  res.json(prices);
});
```

If you have seen `express-async-handler`, `asyncHandler(fn)` wrappers, or a
`try`/`catch` in literally every route, that was the express 4 workaround, and
it is no longer needed.

**What the handler decides.** The rule from lesson 04, applied: errors you
produced deliberately carry a status and a message the client may see; errors
you did not produce get a 500 and a generic body, with the real one in your
logs. A thrown `Error` whose message contains a connection string is not
hypothetical — it is what a failed database call looks like.

## Exercise 1 — a body parser and a middleware factory

Edit `ex1/solution.ts`. Implement `createApp(log)`:

- parse JSON bodies;
- a middleware that, **after each response is finished**, calls
  `log("METHOD PATH STATUS")` — e.g. `"POST /echo 200"`, and also
  `"GET /nope 404"` for a request no route answered;
- `POST /echo` responds with the parsed body.

The logging middleware cannot log when it runs: at that point nothing has
happened yet and `res.statusCode` is still the default. Register a listener
for the response's `"finish"` event and log from there — `res` is a `Writable`
(lesson 06) and this is the same event you waited on then.

```
uv run dojo test node 10_middleware_validation ex1
```

## Exercise 2 — validation as a middleware

Edit `ex2/solution.ts`. Implement:

- `validateBody(schema)` — a middleware factory. On success, replace
  `req.body` with the **parsed** value and call `next()`. On failure, respond
  400 with:

  ```json
  { "error": "validation failed",
    "details": [{ "path": "qty", "message": "..." }] }
  ```

  One detail per failing field, `path` joined with `"."`.

- `createApp()` — `POST /orders`, validated with `createOrderSchema`,
  responding 201 with the order plus an incrementing `id`.

The gate posts a body with an extra key and checks it is *gone* from the
response. That only happens if you assign the parsed value back — which is the
difference between validating and parsing.

```
uv run dojo test node 10_middleware_validation ex2
```

## Exercise 3 — one error handler for the whole app

Edit `ex3/solution.ts`. Implement `createApp(logError)` with:

- `GET /orders/:id` → the order, or `throw new AppError(404, "not_found",
  "no such order")`;
- `GET /boom` → throws a plain `Error` whose message contains a database URL
  with a password in it;
- a middleware after the routes that turns "nothing matched" into
  `AppError(404, "not_found", "no such route")`;
- an error handler, registered last, that answers:
  - for an `AppError`: its status, `{ error: <code>, message: <message> }`;
  - for anything else: **500**, `{"error":"internal_error","message":"internal
    server error"}` — and calls `logError(error)` with the real error.

The gate checks that the database URL does not appear in any response, and
that `logError` was called exactly once — for the unknown error, and not for
either 404. An expected failure is not a defect; logging it as one is how a
log becomes noise nobody reads.

```
uv run dojo test node 10_middleware_validation ex3
```

## Exercise 4 — async handlers that fail

Edit `ex4/solution.ts`. The `AppError` class, a failing dependency
(`fetchPrices`) and the error handler are provided. Implement `createApp()`
with three routes:

- `GET /ok` — an `async` handler that resolves and responds `{"status":"ok"}`;
- `GET /slow-dependency` — an `async` handler that `await`s `fetchPrices()`,
  with **no** `try`/`catch`. The rejection must reach the error handler and
  produce a 503;
- `GET /queued` — a middleware that calls `next(new AppError(409, "conflict",
  "that job is already queued"))`, followed by a handler that must never run.

…and the provided `errorHandler` registered last.

```
uv run dojo test node 10_middleware_validation ex4
```

## Challenge — a rate limiter you can actually test

Edit `challenge/solution.ts`. Implement `createRateLimiter({ limit, windowMs,
now })` and a `createApp(options)` that guards `GET /ping` with it.

- the key is the `x-api-key` header, or `"anonymous"` when it is absent;
- up to `limit` requests per key per fixed window of `windowMs`;
- allowed requests set `x-ratelimit-limit` and `x-ratelimit-remaining`;
- a refused request is **429** with `{"error":"too many requests"}` and a
  `Retry-After` header in **seconds**, rounded up, until the window ends;
- when the clock passes the end of a window, the count starts again.

`now` is injected, which is the whole reason this is testable: the gate moves
the clock forward 30 seconds and then 60 without a single `setTimeout`. Any
time-dependent logic you write should take its clock as an argument for
exactly this reason.

Honest difficulty note: the bookkeeping is fifteen lines. The two things that
take a second attempt are the `Retry-After` arithmetic (the gate checks both
60 and 30) and remembering that `remaining` is counted *after* the current
request.

```
uv run dojo test node 10_middleware_validation challenge
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
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
```

In plain English:

- **ex1** passes a log sink into your factory, so the assertions are about
  what your middleware recorded — including the line for a request no route
  answered, which only appears if the middleware is app-level.
- **ex2** posts a valid body with an extra key (checking it is stripped), an
  invalid one with *two* problems (checking both are reported), and a
  string where a number belongs.
- **ex3** passes a logger in, then checks four paths: success, a deliberate
  404, an unexpected error (status, body, no leak, one log entry) and an
  unmatched route.
- **ex4** exercises both roads into the error handler — a rejected promise
  and an explicit `next(error)` — plus the async happy path.
- **challenge** drives a `vi.fn()` clock: three allowed requests, one refused
  with `Retry-After: 60`, a second key unaffected, the same key still refused
  at +30s with `Retry-After: 30`, and allowed again at +60.001s.

## The teaching point

Three habits, and they compose into most of what people mean by "a
well-behaved API".

**Parse at the edge.** One schema per endpoint, applied in middleware, and
everything downstream works with data that has already been proved. The
alternative — defensive checks scattered through the handler — is more code
and less certainty.

**One error funnel.** Routes throw; the handler decides. That is what makes
error responses consistent, what keeps stack traces out of client payloads,
and what makes "add a request id to every error response" a one-line change
instead of a hundred.

**Inject anything you cannot control.** The clock, the logger, the
dependencies. It is what made the rate limiter testable without sleeping and
the error handler testable without reading log output, and it is the same
instinct that made every app in this lesson a `createApp()` factory rather
than a module-level singleton.

Next: **11_rest_capstone**, where all of it goes into one small REST API,
graded end to end.
