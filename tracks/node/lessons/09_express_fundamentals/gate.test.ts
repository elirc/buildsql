// Gate for node/09_express_fundamentals. Quoted verbatim in README.md.
//
// Every test builds a fresh app from your factory and drives it with
// supertest. No app listens on a fixed port, and no state leaks between
// tests, because createApp() is called again each time.
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
