# 09 — Express fundamentals

You just wrote a router, a query-string parser, a body reader and a JSON
response helper from scratch. Express is those four things, plus a
middleware stack, plus twenty years of accumulated defaults — and now that you
have built the parts, none of it is magic.

This course uses **express 5**, which became the default release in 2024 after
a decade of 4.x. Most of what you will find on the internet is written for 4,
and the differences are small but load-bearing: async handlers that reject now
reach your error handler without a `try`/`catch`, the router's path syntax got
stricter (a bare `*` is no longer a valid pattern — it must be named, like
`/*splat`), and a few long-deprecated helpers are gone. Where a difference
matters in this course, it is called out.

The mental model to carry through the next three lessons: **an express app is
a list of functions, tried in order.** Every one of them gets
`(req, res, next)`. Each either sends a response, or calls `next()` to pass
the request along, or calls `next(error)` to jump to the error handler. Routes
are just entries in that list with a method and a path attached. That is the
entire architecture, and once you see it, express stops having surprises.

## Concept — the stack, and what express adds to `req`/`res`

```ts
import express from "express";

const app = express();

app.use((req, res, next) => {          // runs for every request
  res.setHeader("x-request-id", crypto.randomUUID());
  next();                              // pass it on
});

app.get("/orders/:id", (req, res) => { // runs for GET /orders/<anything>
  res.json({ id: req.params.id });
});

export default app;                    // note: no listen() here
```

**Why a factory, not a module-level app.** Every exercise in this lesson
exports `createApp()`, and the reason is testability: the gate calls it fresh
for each test, so no state leaks between them, and nothing binds a port.
supertest takes the app object, starts a server on an ephemeral port, makes
the request and shuts it down. In a real project `createApp()` lives in
`app.ts` and `server.ts` does `createApp().listen(port)` — one line, one
place, and everything else is testable.

**What express adds to the request:**

```ts
req.params.id        // "/orders/:id" -> the matched segment, always a string
req.query.limit      // parsed query string: string | string[] | undefined
req.body             // ONLY after a body-parsing middleware (lesson 10)
req.headers["x-api-key"]
```

`req.query` deserves a warning. A client can send `?tag=a&tag=b`, so a value
you expect to be a string can arrive as an array. In express 5 `req.query` is
also a getter, computed once per request — you cannot assign to it the way
some 4.x middleware used to.

**What express adds to the response:**

```ts
res.json(value);                 // serialise + content-type + end
res.status(404).json({ ... });   // chainable
res.setHeader("x-total", "5");   // same as node's
res.send("plain text");          // content-type guessed from the argument
```

**Middleware, precisely.** Three signatures, distinguished by arity:

```ts
app.use((req, res, next) => { ... });                    // middleware
app.get("/path", (req, res) => { ... });                 // handler
app.use((err, req, res, next) => { ... });               // error handler (4 args - lesson 10)
```

Order is registration order. A `app.use` registered after your routes only
runs for requests that no route answered. A middleware that sends a response
and *also* calls `next()` causes the next handler to try to send a second one,
which is the "Cannot set headers after they are sent" error every express
developer meets exactly once.

**Routers** are mountable sub-stacks:

```ts
const api = express.Router();
api.use(authenticate);              // applies to everything in this router
api.get("/orders", listOrders);     // relative to wherever it is mounted
app.use("/api/v1", api);            // now GET /api/v1/orders
```

That is how a real app is organised: one router per resource, mounted under a
version prefix, with the middleware that applies to that area registered on
the router rather than globally.

## Exercise 1 — the smallest app that works

Edit `ex1/solution.ts`. Implement `createApp()` returning an express app with:

- `GET /health` → `{"status":"ok"}`
- `GET /orders` → the `ORDERS` array already in the file

Do not call `listen()`, and do not write a 404 handler — express has one, and
the gate checks that `GET /nope` and `DELETE /orders` both fall through to it.

```
uv run dojo test node 09_express_fundamentals ex1
```

## Exercise 2 — parameters, and validating what a client sends

Edit `ex2/solution.ts`. Implement:

- `GET /orders/:id` → the matching order, or **404** with
  `{"error":"not found"}`;
- `GET /orders` → the whole list, or the first `limit` of them when
  `?limit=n` is given;
- `?limit=abc` (or `0`, or `-1`) → **400** with
  `{"error":"limit must be a positive number"}`.

The 400 is the real exercise. `Number("abc")` is `NaN`, `slice(0, NaN)`
returns an empty array, and an endpoint that answers `[]` to a malformed
request has told the client a lie. Query parameters are untrusted strings;
convert and check them at the door.

```
uv run dojo test node 09_express_fundamentals ex2
```

## Exercise 3 — middleware order, and stopping the line

Edit `ex3/solution.ts`. Implement `createApp()` with three pieces of
middleware and two routes:

- an **app-level** middleware (`app.use`) that sets an `x-request-id` header
  on every response — including responses to paths that match no route — and
  starts a trail array in `res.locals`;
- `GET /trail`, with a **route-level** middleware that adds `"route"` to the
  trail; the handler adds `"handler"` and responds with `{ trail }`. The
  result must be `["app", "route", "handler"]`;
- `GET /admin`, guarded by a middleware that requires the header
  `x-api-key: let-me-in`. Without it: **401** `{"error":"unauthorized"}` and
  the handler must not run. With it: `{"secret":"the cake is a lie"}`.

The guard is the exercise. Sending a response and then calling `next()` anyway
is the most common middleware bug there is, and the gate catches it by
checking the *body* of the 401 as well as the status.

```
uv run dojo test node 09_express_fundamentals ex3
```

## Exercise 4 — mount a router

Edit `ex4/solution.ts`. Implement `createApp()` with:

- `GET /health` registered directly on the app;
- an `express.Router()` carrying `GET /orders` and `GET /orders/:id`, plus a
  router-level middleware that sets `x-api-version: v1`;
- the router mounted at `/api/v1`.

The gate checks the scoping in both directions: `/api/v1/orders` gets the
version header, `/health` does not, and `/orders` — the unmounted path — is a
404.

```
uv run dojo test node 09_express_fundamentals ex4
```

## Challenge — the collection endpoint

Edit `challenge/solution.ts`. Implement `GET /orders` over the five seeded
orders, supporting:

| parameter | meaning | default | invalid → |
|---|---|---|---|
| `status` | exact-match filter | no filter | — |
| `sort` | `id` or `amount` | `id` | 400 `{"error":"invalid sort"}` |
| `order` | `asc` or `desc` | `asc` | 400 `{"error":"invalid order"}` |
| `page` | 1-based page number | `1` | 400 `{"error":"invalid pagination"}` |
| `perPage` | page size, 1–50 | `10` | 400 `{"error":"invalid pagination"}` |

The response is:

```json
{ "items": [...], "page": 2, "perPage": 2, "total": 5 }
```

`total` is the number of rows **after filtering and before pagination** — the
number the client needs to draw a pager. A page past the end is an empty
`items` array, not a 404: the collection exists, that page of it is just
empty.

Honest difficulty note: no single step is hard, and there are five of them
that have to happen in the right order (validate, filter, sort, slice,
report). The `perPage` cap is not busywork either — an endpoint that will
return a million rows if asked is an endpoint that will be asked.

```
uv run dojo test node 09_express_fundamentals challenge
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import request from "supertest";
import { describe, expect, test } from "vitest";

import { createApp as createBasics } from "./ex1/solution";
import { createApp as createLookup } from "./ex2/solution";
import { createApp as createMiddleware } from "./ex3/solution";
import { createApp as createMounted } from "./ex4/solution";
import { createApp as createCatalogue } from "./challenge/solution";

describe("09_express_fundamentals", () => {
  test("ex1 - createApp() answers two routes and lets express handle the rest", async () => {
    const app = createBasics();

    const health = await request(app).get("/health");
    expect(health.status, "GET /health is a 200").toBe(200);
    expect(
      health.headers["content-type"],
      "res.json() sets the content-type for you - that is one of the things " +
        "you are buying by using a framework",
    ).toContain("application/json");
    expect(health.body).toEqual({ status: "ok" });

    const orders = await request(app).get("/orders");
    expect(orders.status).toBe(200);
    expect(
      orders.body,
      "the seeded orders, straight from the ORDERS array in your file",
    ).toEqual([
      { id: "1", item: "keyboard", amount: 80, status: "paid" },
      { id: "2", item: "monitor", amount: 240, status: "pending" },
    ]);

    const unknown = await request(app).get("/nope");
    expect(
      unknown.status,
      "you do not write a 404 handler in express: a request that matches no " +
        "route falls through to the built-in final handler",
    ).toBe(404);

    const wrongMethod = await request(app).delete("/orders");
    expect(
      wrongMethod.status,
      "app.get() registers GET only, so DELETE falls through the same way",
    ).toBe(404);
  });

  test("ex2 - params and query strings, with honest status codes", async () => {
    const app = createLookup();

    const found = await request(app).get("/orders/2");
    expect(found.status, "order 2 exists").toBe(200);
    expect(
      found.body,
      "req.params.id is the :id segment, as a string",
    ).toEqual({ id: "2", item: "monitor", amount: 240, status: "pending" });

    const missing = await request(app).get("/orders/999");
    expect(missing.status, "an unknown id is a 404, not an empty 200").toBe(404);
    expect(
      missing.body,
      "and the body is your JSON, not the express HTML page - res.status(404)" +
        ".json({...}) is the shape",
    ).toEqual({ error: "not found" });

    const limited = await request(app).get("/orders?limit=1");
    expect(
      limited.body,
      "limit trims the list from the front",
    ).toEqual([{ id: "1", item: "keyboard", amount: 80, status: "paid" }]);

    const unlimited = await request(app).get("/orders");
    expect(
      unlimited.body.length,
      "without a limit you get everything - the default is not zero",
    ).toBe(3);

    const nonsense = await request(app).get("/orders?limit=abc");
    expect(
      nonsense.status,
      "req.query values are strings and a client can send anything. " +
        'Number("abc") is NaN, and slicing by NaN silently returns nothing - ' +
        "so validate and answer 400 (README ex2)",
    ).toBe(400);
    expect(nonsense.body).toEqual({ error: "limit must be a positive number" });
  });

  test("ex3 - middleware runs in order, and can stop the line", async () => {
    const app = createMiddleware();

    const trail = await request(app).get("/trail");
    expect(trail.status).toBe(200);
    expect(
      trail.body.trail,
      "app-level middleware first, then the route-level middleware, then the " +
        "handler - the order they were registered in",
    ).toEqual(["app", "route", "handler"]);

    const first = await request(app).get("/trail");
    expect(
      first.headers["x-request-id"],
      "the app-level middleware stamps every response with an id",
    ).toBeTruthy();

    const missingRoute = await request(app).get("/nope");
    expect(missingRoute.status, "still a 404").toBe(404);
    expect(
      missingRoute.headers["x-request-id"],
      "...and the id is there even on a 404, which is only possible if the " +
        "middleware is registered with app.use() rather than inside a route",
    ).toBeTruthy();

    const denied = await request(app).get("/admin");
    expect(denied.status, "no api key means 401").toBe(401);
    expect(denied.body, "with a JSON reason").toEqual({ error: "unauthorized" });

    const allowed = await request(app).get("/admin").set("x-api-key", "let-me-in");
    expect(
      allowed.status,
      "with the key, the guard calls next() and the handler runs",
    ).toBe(200);
    expect(
      allowed.body,
      "the handler is only reached when the guard allows it - a 401 body here " +
        "would mean your guard responded AND called next()",
    ).toEqual({ secret: "the cake is a lie" });
  });

  test("ex4 - a Router is a mountable mini-application", async () => {
    const app = createMounted();

    const health = await request(app).get("/health");
    expect(health.status, "the app-level route is untouched by the router").toBe(200);
    expect(
      health.headers["x-api-version"],
      "the router's middleware must NOT run for routes outside the mount path",
    ).toBeUndefined();

    const list = await request(app).get("/api/v1/orders");
    expect(list.status, "the router is mounted at /api/v1").toBe(200);
    expect(list.body).toEqual([
      { id: "1", item: "keyboard", amount: 80, status: "paid" },
      { id: "2", item: "monitor", amount: 240, status: "pending" },
    ]);
    expect(
      list.headers["x-api-version"],
      "middleware registered on the router applies to every route in it",
    ).toBe("v1");

    const one = await request(app).get("/api/v1/orders/1");
    expect(
      one.body,
      "routes inside the router are written relative to the mount path: the " +
        'router says "/orders/:id", not "/api/v1/orders/:id"',
    ).toEqual({ id: "1", item: "keyboard", amount: 80, status: "paid" });

    const unmounted = await request(app).get("/orders");
    expect(
      unmounted.status,
      "and they exist ONLY under the mount path",
    ).toBe(404);
  });

  test("challenge - the catalogue endpoint filters, sorts and paginates", async () => {
    const app = createCatalogue();

    const all = await request(app).get("/orders");
    expect(
      all.body,
      "with no parameters: every order, sorted by id ascending, page 1 of 10 " +
        "per page, and the total alongside",
    ).toEqual({
      items: [
        { id: "1", item: "keyboard", amount: 80, status: "paid" },
        { id: "2", item: "monitor", amount: 240, status: "pending" },
        { id: "3", item: "desk", amount: 410, status: "paid" },
        { id: "4", item: "mouse", amount: 25, status: "paid" },
        { id: "5", item: "chair", amount: 150, status: "cancelled" },
      ],
      page: 1,
      perPage: 10,
      total: 5,
    });

    const paid = await request(app).get("/orders?status=paid");
    expect(
      paid.body.items.map((order: { id: string }) => order.id),
      "status filters exactly",
    ).toEqual(["1", "3", "4"]);
    expect(
      paid.body.total,
      "total counts the rows that survived the FILTER, before pagination - " +
        "otherwise the client cannot render a page count",
    ).toBe(3);

    const expensive = await request(app).get("/orders?sort=amount&order=desc");
    expect(
      expensive.body.items.map((order: { id: string }) => order.id),
      "sort=amount&order=desc: 410, 240, 150, 80, 25",
    ).toEqual(["3", "2", "5", "1", "4"]);

    const page2 = await request(app).get("/orders?sort=amount&order=desc&page=2&perPage=2");
    expect(
      page2.body,
      "page 2 with 2 per page is items 3 and 4 of the sorted list",
    ).toEqual({
      items: [
        { id: "5", item: "chair", amount: 150, status: "cancelled" },
        { id: "1", item: "keyboard", amount: 80, status: "paid" },
      ],
      page: 2,
      perPage: 2,
      total: 5,
    });

    const beyond = await request(app).get("/orders?page=9");
    expect(
      beyond.body.items,
      "a page past the end is an empty list, not a 404 - the collection exists",
    ).toEqual([]);
    expect(beyond.body.total, "and the total is still the total").toBe(5);

    const badSort = await request(app).get("/orders?sort=elephant");
    expect(badSort.status, "an unsupported sort field is a 400").toBe(400);
    expect(badSort.body).toEqual({ error: "invalid sort" });

    const badPage = await request(app).get("/orders?page=0");
    expect(badPage.status, "pages are 1-based, so page=0 is a 400").toBe(400);
    expect(badPage.body).toEqual({ error: "invalid pagination" });

    const badPerPage = await request(app).get("/orders?perPage=500");
    expect(
      badPerPage.status,
      "perPage is capped at 50: an unbounded page size is how one client " +
        "downloads your whole database in a single request",
    ).toBe(400);
    expect(badPerPage.body).toEqual({ error: "invalid pagination" });
  });
});
```

In plain English:

- Every test calls your `createApp()` and hands the result to `request(...)`.
  supertest and express know each other well: passing the app is enough.
- **ex1** checks both routes, the content-type express sets for you, and two
  different ways of reaching the built-in 404.
- **ex2** checks the found and not-found paths, the limit, the default, and
  the malformed limit — the last one is the difference between an API and a
  demo.
- **ex3** reads the trail array to prove ordering, then checks the
  `x-request-id` header on a **404** (only an `app.use` produces that), then
  runs the guard with and without the key.
- **ex4** proves the router's middleware is scoped by asserting the header is
  *absent* on `/health`, which is the assertion people forget to write.
- **challenge** walks every parameter, including a page past the end and all
  three validation failures.

## The teaching point

Express is a small framework with a big ecosystem, and what it actually gives
you is a convention: a stack of `(req, res, next)` functions. Everything you
will add later — authentication, logging, CORS, compression, rate limiting,
body parsing, error handling — is a function with that signature, registered
in the right place in the list.

Which makes "the right place in the list" the skill worth having. Middleware
registered before your routes runs on the way in; middleware registered after
runs only when nothing answered; middleware on a router runs only for that
mount path. Nearly every "why did my middleware not run" question is answered
by looking at the order of the registrations, and now you have written all
three kinds by hand.

Next: **10_middleware_validation**, where the stack gets a body parser, real
input validation with zod, and one error handler at the bottom that turns
every failure into an honest response.
