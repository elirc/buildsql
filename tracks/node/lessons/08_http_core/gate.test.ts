// Gate for node/08_http_core. Quoted verbatim in README.md.
//
// supertest is given your request listener directly. It wraps it in an
// http.Server, listens on an ephemeral port chosen by the OS, makes the
// request and shuts the server down again - so nothing here binds a fixed
// port and two gates can never collide.
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
