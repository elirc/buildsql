# 08 — HTTP, without a framework

You are going to write a web server with no dependencies. Not because that is
how you should build production services — the next three lessons are express
— but because express is a thin layer over exactly what you are about to
write, and every one of its conveniences is a thing you will now recognise
rather than memorise.

Here is the whole API:

```ts
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("hello");
});

server.listen(3000);
```

That callback — the *request listener* — is called once per request. `req` is
a `Readable` stream carrying the body, with the method, URL and headers hung
off it. `res` is a `Writable` stream you write the response into. There is no
router, no `req.query`, no `req.body`, no JSON parsing, no `res.json()`. Those
are all express, and by the end of this lesson you will have written each of
them yourself.

The reason this is worth a whole lesson: nearly every "why is my API doing
that" question is at this layer. Why did the request hang? Because nothing
called `res.end()`. Why 404 instead of 405? Because the router only compared
paths. Why did the upload take down the process? Because nothing bounded the
body. Frameworks answer these questions for you until the day they do not.

## Concept — request in, response out

**What arrives.** `req` is an `IncomingMessage`:

```ts
req.method;                       // "GET", "POST", ...
req.url;                          // "/search?q=node"  <- path AND query, never the host
req.headers["content-type"];      // headers, keys lowercased for you
req.headers["if-none-match"];
// req itself is a Readable stream of the body
```

Note what `req.url` is not: it is not a parsed object, and it is not just the
path. Parse it with the standard `URL` class, which needs a base because
`/search?q=node` is relative:

```ts
const url = new URL(req.url ?? "/", "http://localhost");
url.pathname;                     // "/search"
url.searchParams.get("q");        // "node"     (first value, or null)
url.searchParams.getAll("tag");   // ["core", "io"]  (every value)
```

**What you send.** `res` is a `ServerResponse`:

```ts
res.setHeader("etag", '"abc"');            // one header, before anything is sent
res.writeHead(201, { "content-type": "application/json" });  // status + headers
res.end(JSON.stringify(body));             // body, and the response is over
```

Three rules that account for most beginner bugs. Headers can only be sent
once — a second `writeHead` throws `ERR_HTTP_HEADERS_SENT`. Nothing is sent to
the client until you call `end()`, so a handler that forgets it leaves the
request hanging until the client times out. And `writeHead` merges with
anything you set earlier via `setHeader`, with `writeHead`'s values winning.

**The body is a stream.** This is the part that surprises people coming from
other platforms: there is no `req.body`. The body may not have arrived yet, so
you read it:

```ts
const chunks: Buffer[] = [];
req.on("data", (chunk) => chunks.push(chunk));
req.on("end", () => {
  const text = Buffer.concat(chunks).toString("utf8");
  // ...now you can answer
});
```

Which means your handler answers *later*, from a callback — and it means an
unbounded `push` is a denial-of-service waiting to happen. Every body parser
in the world takes a size limit, and this is why.

**Status codes worth knowing precisely**, because the exercises grade them:

| code | when |
|---|---|
| 200 | here it is |
| 201 | created — plus a `Location` header pointing at the new thing |
| 304 | you already have this version (a conditional GET) |
| 400 | the client sent something malformed |
| 404 | no such path |
| 405 | the path exists, that method does not — plus an `Allow` header |
| 413 | the body was too big |
| 500 | we broke |

## Exercise 1 — route by hand

Edit `ex1/solution.ts`. Implement `createHandler()`, returning a request
listener that answers:

- `GET /health` → 200, JSON `{"status":"ok"}`
- `GET /orders` → 200, JSON `[{"id":"1","item":"keyboard"},{"id":"2","item":"monitor"}]`
  (the `ORDERS` array already in the file)
- anything else, including `POST /health` → 404, JSON `{"error":"not found"}`

Every response carries `content-type: application/json`. Write yourself a
small `sendJson(res, status, body)` helper — you will use it in all four
exercises, and it is the seed of what express calls `res.json()`.

```
uv run dojo test node 08_http_core ex1
```

## Exercise 2 — parse the query string

Edit `ex2/solution.ts`. Implement `GET /search`, which reads three parameters:

- `q` — required. Missing → 400, `{"error":"q is required"}`
- `limit` — optional, **a number**, default `10`
- `tag` — optional and repeatable; collect every value into `tags`

`GET /search?q=node&limit=2` → `{"q":"node","limit":2,"tags":[]}`
`GET /search?q=streams&tag=core&tag=io` → `{"q":"streams","limit":10,"tags":["core","io"]}`

Two traps live here. `req.url` includes the query string, so ex1's exact
comparison no longer matches. And everything in a query string is a string:
`limit` arrives as `"2"` and the gate compares against the number `2`.

```
uv run dojo test node 08_http_core ex2
```

## Exercise 3 — read a body, and refuse a big one

Edit `ex3/solution.ts`. Implement `POST /orders`:

- read the body, parse it as JSON, assign an incrementing `id` starting at 1,
  and respond **201** with the stored order and a `Location: /orders/<id>`
  header;
- a body that does not parse → **400** `{"error":"invalid json"}`;
- more than `BODY_LIMIT` (1024) bytes → **413** `{"error":"payload too large"}`;
- any other method on `/orders` → **405** with an `Allow: POST` header;
- any other path → 404.

The limit is the point of the exercise. Stop *accumulating* once you are over
it — do not buffer the whole body and check afterwards, because then the
attack has already succeeded. (Production code goes further and destroys the
connection; this exercise keeps reading and discarding so that the response is
guaranteed to reach the client.)

```
uv run dojo test node 08_http_core ex3
```

## Exercise 4 — path parameters and a conditional GET

Edit `ex4/solution.ts`. Implement `GET /orders/:id` over the provided
`ORDERS` map:

- exactly two path segments, the first `orders`; anything else is a 404
  (`/orders/1/extra` included);
- an unknown id is a 404;
- a hit responds 200 with the order as JSON, plus `Cache-Control: no-cache`
  and an `ETag` header — any string that changes when the body changes;
- if the request carries `If-None-Match` equal to that ETag, respond **304**
  with no body at all.

That last part is the whole caching protocol of the web in four lines. The
client keeps the ETag it was given and offers it back; the server either says
"still valid, use your copy" or sends the new one. Every CDN, every browser
cache and every `fetch` you have ever made speaks this.

```
uv run dojo test node 08_http_core ex4
```

## Challenge — write the router

Edit `challenge/solution.ts`. Implement `createRouter()`:

```ts
const router = createRouter();
router.get("/orders", handler);
router.get("/orders/:id", handler);       // params.id
router.get("/orders/:id/lines/:line", handler);
router.post("/orders", handler);
createServer(router.handler);
```

- a `:name` segment matches exactly one segment and its value is passed to the
  handler as `params.name`;
- match on the **pathname**, so a query string does not break the route;
- no route at all → 404;
- the path matches but the method does not → **405**, with an `Allow` header
  listing every method registered for that path.

The 405 requirement is what makes this a router rather than a lookup table:
you cannot decide it until you have checked *every* route, because the answer
depends on what else is registered.

Honest difficulty note: the matcher is twenty lines and the dispatch loop is
ten. What takes the time is the realisation that "no handler ran" has two
different causes and they deserve different answers.

```
uv run dojo test node 08_http_core challenge
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import request from "supertest";
import { describe, expect, test } from "vitest";

import { createHandler as createRoutes } from "./ex1/solution";
import { createHandler as createSearch } from "./ex2/solution";
import { createHandler as createOrders } from "./ex3/solution";
import { createHandler as createCache } from "./ex4/solution";
import { createRouter } from "./challenge/solution";

describe("08_http_core", () => {
  test("ex1 - the handler routes on method and path, and answers in JSON", async () => {
    const handler = createRoutes();

    const health = await request(handler).get("/health");
    expect(health.status, "GET /health is a 200").toBe(200);
    expect(
      health.headers["content-type"],
      "say what you are sending: content-type must start with application/json. " +
        "Without it a browser guesses, and guesses wrong",
    ).toContain("application/json");
    expect(health.body, "the body is the JSON object from README ex1").toEqual({
      status: "ok",
    });

    const orders = await request(handler).get("/orders");
    expect(orders.status, "GET /orders is a 200").toBe(200);
    expect(
      orders.body,
      "the two seeded orders, in the order given in the README",
    ).toEqual([
      { id: "1", item: "keyboard" },
      { id: "2", item: "monitor" },
    ]);

    const missing = await request(handler).get("/nope");
    expect(
      missing.status,
      "an unknown path is a 404 - not a 200 with an empty body, and not a crash",
    ).toBe(404);
    expect(missing.body, "even the error is JSON").toEqual({ error: "not found" });

    const wrongMethod = await request(handler).post("/health");
    expect(
      wrongMethod.status,
      "the route is GET /health: a POST to the same path does not match, so it " +
        "falls through to the 404 (README ex1)",
    ).toBe(404);
  });

  test("ex2 - the query string is parsed with URL, not with split", async () => {
    const handler = createSearch();

    const basic = await request(handler).get("/search?q=node&limit=2");
    expect(basic.status, "a valid search is a 200").toBe(200);
    expect(
      basic.body,
      "q comes back as a string, limit as a NUMBER, tags as an array",
    ).toEqual({ q: "node", limit: 2, tags: [] });

    const repeated = await request(handler).get("/search?q=streams&tag=core&tag=io");
    expect(
      repeated.body,
      "a repeated parameter is not a bug: searchParams.getAll gives you every " +
        "value, in order. Reading only the first one silently loses data",
    ).toEqual({ q: "streams", limit: 10, tags: ["core", "io"] });

    const encoded = await request(handler).get("/search?q=event%20loop");
    expect(
      encoded.body.q,
      "URL decoding is done for you - %20 is a space by the time you read it",
    ).toBe("event loop");

    const missing = await request(handler).get("/search");
    expect(missing.status, "no q at all is a 400, not a 500").toBe(400);
    expect(missing.body, "and it says which parameter was missing").toEqual({
      error: "q is required",
    });
  });

  test("ex3 - the request body is a stream you have to read, and to bound", async () => {
    const handler = createOrders();

    const created = await request(handler)
      .post("/orders")
      .set("content-type", "application/json")
      .send('{"item":"desk","qty":2}');

    expect(created.status, "a successful create is a 201, not a 200").toBe(201);
    expect(
      created.headers.location,
      "a 201 carries a Location header pointing at the thing you made",
    ).toBe("/orders/1");
    expect(
      created.body,
      "the stored order, with the id the server assigned",
    ).toEqual({ id: 1, item: "desk", qty: 2 });

    const second = await request(handler)
      .post("/orders")
      .set("content-type", "application/json")
      .send('{"item":"lamp","qty":1}');
    expect(
      second.body.id,
      "ids come from the handler, so the second order is 2 - the state lives " +
        "in the closure createHandler() returns",
    ).toBe(2);

    const broken = await request(handler)
      .post("/orders")
      .set("content-type", "application/json")
      .send("{ not json");
    expect(
      broken.status,
      "a body that will not parse is the client's fault: 400. A 500 here means " +
        "you let JSON.parse throw",
    ).toBe(400);
    expect(broken.body).toEqual({ error: "invalid json" });

    const huge = await request(handler)
      .post("/orders")
      .set("content-type", "application/json")
      .send(JSON.stringify({ item: "x".repeat(2000), qty: 1 }));
    expect(
      huge.status,
      "over 1024 bytes must be refused with 413. Without a limit, any client " +
        "can hand you a body as large as your heap (README ex3)",
    ).toBe(413);
    expect(huge.body).toEqual({ error: "payload too large" });

    const wrongMethod = await request(handler).get("/orders");
    expect(
      wrongMethod.status,
      "the path exists but the method does not: that is 405, not 404",
    ).toBe(405);
    expect(
      wrongMethod.headers.allow,
      "a 405 MUST say what is allowed - the Allow header is part of the spec",
    ).toBe("POST");
  });

  test("ex4 - path parameters, and a conditional GET", async () => {
    const handler = createCache();

    const found = await request(handler).get("/orders/1");
    expect(found.status, "order 1 exists").toBe(200);
    expect(found.body, "and comes back as JSON").toEqual({ id: "1", item: "keyboard" });
    expect(
      found.headers["cache-control"],
      "the response says how it may be cached",
    ).toBe("no-cache");
    const etag = found.headers.etag;
    expect(
      typeof etag === "string" && etag.length > 0,
      "an ETag identifies this version of this resource - any stable string " +
        "derived from the body will do",
    ).toBe(true);

    const unchanged = await request(handler).get("/orders/1").set("if-none-match", etag);
    expect(
      unchanged.status,
      "the client already has this version, so send 304 and no body. This is " +
        "the cheapest optimisation in HTTP and it is four lines of code",
    ).toBe(304);
    expect(
      unchanged.text,
      "a 304 has no body at all",
    ).toBeFalsy();

    const stale = await request(handler).get("/orders/1").set("if-none-match", '"nope"');
    expect(
      stale.status,
      "a non-matching ETag means the client is out of date: send the whole thing",
    ).toBe(200);

    const missing = await request(handler).get("/orders/999");
    expect(missing.status, "an unknown id is a 404").toBe(404);

    const tooDeep = await request(handler).get("/orders/1/extra");
    expect(
      tooDeep.status,
      "/orders/1/extra is three segments and matches nothing: 404",
    ).toBe(404);
  });

  test("challenge - createRouter() dispatches by pattern and knows its own methods", async () => {
    const router = createRouter();
    router.get("/orders", (_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ route: "list" }));
    });
    router.get("/orders/:id", (_req, res, params) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ route: "show", params }));
    });
    router.post("/orders", (_req, res) => {
      res.writeHead(201, { "content-type": "application/json" });
      res.end(JSON.stringify({ route: "create" }));
    });
    router.get("/orders/:id/lines/:line", (_req, res, params) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ route: "line", params }));
    });

    const list = await request(router.handler).get("/orders");
    expect(list.body, "a literal route matches exactly").toEqual({ route: "list" });

    const show = await request(router.handler).get("/orders/42");
    expect(
      show.body,
      "a :param segment matches one segment and its value is handed to the " +
        "handler as a named parameter",
    ).toEqual({ route: "show", params: { id: "42" } });

    const line = await request(router.handler).get("/orders/42/lines/7");
    expect(
      line.body,
      "two parameters in one pattern, in order",
    ).toEqual({ route: "line", params: { id: "42", line: "7" } });

    const created = await request(router.handler).post("/orders");
    expect(
      created.status,
      "same path, different method, different handler",
    ).toBe(201);

    const query = await request(router.handler).get("/orders/42?expand=lines");
    expect(
      query.body,
      "req.url includes the query string, so match on the PATHNAME - otherwise " +
        "every link with a ?foo=bar on it 404s (README challenge)",
    ).toEqual({ route: "show", params: { id: "42" } });

    const unknown = await request(router.handler).get("/customers");
    expect(unknown.status, "no route at all is a 404").toBe(404);

    const wrongMethod = await request(router.handler).delete("/orders");
    expect(
      wrongMethod.status,
      "the path matches but the method does not: 405, and the Allow header " +
        "lists every method registered for that path",
    ).toBe(405);
    expect(
      wrongMethod.headers.allow?.split(",").map((m) => m.trim()).sort(),
      "both registered methods for /orders, in any order",
    ).toEqual(["GET", "POST"]);
  });
});
```

In plain English:

- Each test hands `request(...)` your handler function directly. supertest
  wraps it in a server, listens on a port the OS picks, makes the request and
  closes the server — so no gate in this course ever binds a fixed port.
- **ex1** checks all three routes plus the "right path, wrong method" case,
  and asserts the content-type as well as the body.
- **ex2** covers the normal case, a repeated parameter, a percent-encoded
  value and the missing-`q` 400.
- **ex3** creates two orders (proving the id counter lives in your closure),
  then sends unparseable JSON, then a 2 KB body, then a wrong method — and
  checks the `Location` and `Allow` headers, not just the statuses.
- **ex4** reads the ETag from the first response and offers it back on the
  second, which is exactly what a browser does. It also tries a *wrong* ETag
  to make sure you compare rather than assume.
- **challenge** registers four routes and then exercises literal matching,
  one parameter, two parameters, a second method on the same path, a query
  string, an unknown path, and the 405 with its `Allow` list.

## The teaching point

Everything express gives you is on this page. `res.json()` is `sendJson`.
`req.query` is `url.searchParams`. `express.json()` is the `data`/`end` loop
with a limit. `app.get("/orders/:id")` is the matcher you just wrote.
Middleware is a list of functions called in order, which is lesson 09.

The reason to know that is not purity, it is debugging. When a framework does
something surprising — a route that will not match, a body that is
`undefined`, a response that arrives twice — the question "what would the raw
handler be doing here?" almost always produces the answer, because there is
nothing underneath the framework except this.

Next: **09_express_fundamentals**, where you get all of it back for free, and
find out what the framework actually adds.
