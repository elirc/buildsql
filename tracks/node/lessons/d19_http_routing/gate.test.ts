// Gate for node/d19_http_routing. Quoted verbatim in README.md.
//
// Six of these eight problems are pure functions over strings, so they are
// exact and instant. The two that need a server are handed to supertest as a
// request listener - it picks the port, so nothing here can collide with
// anything else running.
import type { IncomingMessage, ServerResponse } from "node:http";
import request from "supertest";
import { describe, expect, test } from "vitest";

import { splitRoute } from "./ex1/solution";
import { matchPattern } from "./ex2/solution";
import { rankPatterns } from "./ex3/solution";
import { buildLink } from "./ex4/solution";
import { canonicalPath } from "./ex5/solution";
import { mountAt } from "./ex6/solution";
import { createRouter } from "./ex7/solution";
import { resolveRouteTree, type RouteNode } from "./ex8/solution";

/** What a mounted handler is allowed to have been told about its request. */
type Mounted = IncomingMessage & { originalUrl?: string };

function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

describe("d19_http_routing", () => {
  test("ex1 - splitRoute() takes a request line apart", () => {
    expect(
      splitRoute("/orders/42?status=paid"),
      "the path becomes segments and the query becomes an object - two " +
        "different jobs that URL does for you if you let it",
    ).toEqual({ segments: ["orders", "42"], query: { status: "paid" } });

    expect(
      splitRoute("/orders/42/"),
      "a trailing slash is not an empty last segment. Treating it as one is " +
        "why /orders/42/ 404s on a route that /orders/42 matches",
    ).toEqual({ segments: ["orders", "42"], query: {} });

    expect(
      splitRoute("/orders//42"),
      "and neither is a doubled separator",
    ).toEqual({ segments: ["orders", "42"], query: {} });

    expect(splitRoute("/"), "the root has no segments at all").toEqual({
      segments: [],
      query: {},
    });

    expect(
      splitRoute("/orders/order%2042"),
      "segments arrive percent-encoded and have to be decoded, or every id " +
        "with a space in it misses its route",
    ).toEqual({ segments: ["orders", "order 42"], query: {} });

    expect(
      splitRoute("/files/a%2fb"),
      "...and %2f decodes to a slash INSIDE one segment. Splitting the decoded " +
        "path instead of decoding the split parts turns one segment into two, " +
        "which is the bug that lets a filename climb a directory",
    ).toEqual({ segments: ["files", "a/b"], query: {} });

    expect(
      splitRoute("/search?tag=core&tag=io&q=streams"),
      "a repeated key is not a mistake to be silently deduplicated - it is an " +
        "array, and keeping only the last one loses data the client sent on " +
        "purpose",
    ).toEqual({ segments: ["search"], query: { tag: ["core", "io"], q: "streams" } });

    expect(
      splitRoute("/search?tag=a&tag=b&tag=c"),
      "three of them is an array of three, not a nested pair",
    ).toEqual({ segments: ["search"], query: { tag: ["a", "b", "c"] } });

    expect(
      splitRoute("/search?q=event%20loop&empty="),
      "query values are decoded too, and a key with no value is the empty " +
        "string rather than missing",
    ).toEqual({ segments: ["search"], query: { q: "event loop", empty: "" } });
  });

  test("ex2 - matchPattern() answers with the parameters or with nothing", () => {
    expect(
      matchPattern("/orders/:id", "/orders/42"),
      "a param segment matches one segment and binds its value",
    ).toEqual({ id: "42" });

    expect(
      matchPattern("/health", "/health"),
      "a pattern with no params still matches, with nothing to report",
    ).toEqual({});

    expect(
      matchPattern("/orders/:id", "/orders/42/lines"),
      "one param is one segment - a longer path is a different route",
    ).toBeNull();

    expect(matchPattern("/orders/:id", "/orders"), "and so is a shorter one").toBeNull();

    expect(matchPattern("/orders/:id", "/customers/42"), "the literal has to match").toBeNull();

    expect(
      matchPattern("/orders/:id/lines/:line", "/orders/7/lines/3"),
      "two params in one pattern, each bound to its own segment",
    ).toEqual({ id: "7", line: "3" });

    expect(
      matchPattern("/orders/:id?", "/orders"),
      "an optional segment may be absent, and then its name is simply not in " +
        "the answer - not present and undefined, which is a different thing to " +
        "every caller that uses in or hasOwnProperty",
    ).toEqual({});

    expect(
      matchPattern("/orders/:id?", "/orders/42"),
      "...and present when it is there",
    ).toEqual({ id: "42" });

    expect(
      matchPattern("/files/*rest", "/files/a/b/c.txt"),
      "a trailing star takes everything left, joined back together - which is " +
        "the whole reason it exists, because a param cannot cross a separator",
    ).toEqual({ rest: "a/b/c.txt" });

    expect(
      matchPattern("/files/*rest", "/files"),
      "and it is allowed to take nothing at all",
    ).toEqual({ rest: "" });

    expect(
      matchPattern("/orders/:id", "/orders/order%2042"),
      "params come out decoded, because a route parameter is a value and not a " +
        "piece of URL syntax",
    ).toEqual({ id: "order 42" });

    expect(
      matchPattern("/orders/:id", "/orders/42/"),
      "a trailing slash does not change which route this is",
    ).toEqual({ id: "42" });
  });

  test("ex3 - rankPatterns() puts the most specific route first", () => {
    expect(
      rankPatterns(["/orders/*rest", "/orders/:id", "/orders/new", "/orders", "/orders/:id/lines"]),
      "the order a router has to try these in. A literal beats a param, a " +
        "param beats nothing, and nothing beats a wildcard - so /orders/new is " +
        "reachable even though /orders/:id would also match it",
    ).toEqual(["/orders/new", "/orders/:id/lines", "/orders/:id", "/orders", "/orders/*rest"]);

    expect(
      rankPatterns(["/*all", "/health"]),
      "a catch-all is always the last thing you try, whatever order it was " +
        "registered in",
    ).toEqual(["/health", "/*all"]);

    expect(
      rankPatterns(["/a/:x", "/a/:y"]),
      "two patterns of equal specificity keep the order they arrived in. A " +
        "comparator that returns a nonzero value for equal inputs makes your " +
        "routing table depend on the sort implementation",
    ).toEqual(["/a/:x", "/a/:y"]);

    const original = ["/b", "/a/:x"];
    const ranked = rankPatterns(original);
    expect(ranked, "a longer pattern outranks a shorter one that ties on its prefix").toEqual([
      "/a/:x",
      "/b",
    ]);
    expect(
      original,
      "and the caller's array is left alone. Array.sort() sorts IN PLACE, so " +
        "the version of this that reorders the routing table it was asked to " +
        "read is a one-character mistake",
    ).toEqual(["/b", "/a/:x"]);

    expect(rankPatterns([]), "nothing in, nothing out").toEqual([]);
  });

  test("ex4 - buildLink() runs the router backwards", () => {
    expect(
      buildLink("/orders/:id", { id: "42" }),
      "the pattern and the values give you the URL, so the pattern stays the " +
        "single place a route is written down",
    ).toBe("/orders/42");

    expect(
      buildLink("/orders/:id", { id: "order 42" }),
      "values are percent-encoded on the way in - a link is not a template " +
        "string, and a space in an id would otherwise end the URL",
    ).toBe("/orders/order%2042");

    expect(
      buildLink("/orders/:id/lines/:line?", { id: "7", line: "3" }),
      "an optional segment that has a value is just a segment",
    ).toBe("/orders/7/lines/3");

    expect(
      buildLink("/orders/:id/lines/:line?", { id: "7" }),
      "...and one that does not is left off entirely, rather than becoming an " +
        "empty segment or the string undefined",
    ).toBe("/orders/7/lines");

    expect(
      buildLink("/files/*rest", { rest: "a/b/c.txt" }),
      "a wildcard keeps its separators: they are structure, not content, so " +
        "each segment is encoded but the slashes between them survive",
    ).toBe("/files/a/b/c.txt");

    expect(
      buildLink("/orders", {}, { status: "paid", limit: "10" }),
      "the query is sorted by key, so the same link is the same string every " +
        "time - which is what makes it usable as a cache key",
    ).toBe("/orders?limit=10&status=paid");

    expect(
      buildLink("/orders", {}, { tag: ["core", "io"] }),
      "an array becomes a repeated key, in the order given",
    ).toBe("/orders?tag=core&tag=io");

    expect(
      buildLink("/orders", {}, { q: "event loop" }),
      "and query values are encoded too",
    ).toBe("/orders?q=event%20loop");

    expect(buildLink("/orders"), "no params, no query, no question mark").toBe("/orders");

    expect(
      () => buildLink("/orders/:id", {}),
      "a missing required parameter is a programming error, and the message " +
        "has to name the parameter - otherwise the stack trace says only that " +
        "some link somewhere is wrong",
    ).toThrow("id");
  });

  test("ex5 - canonicalPath() decides whether a URL needs redirecting", () => {
    expect(
      canonicalPath("/orders/42"),
      "a path that is already canonical is returned unchanged, and says so - " +
        "which is what stops the caller redirecting it to itself forever",
    ).toEqual({ path: "/orders/42", changed: false });

    expect(canonicalPath("/orders//42"), "a doubled separator is collapsed").toEqual({
      path: "/orders/42",
      changed: true,
    });

    expect(canonicalPath("/orders/./42"), "a dot segment means here, so it goes").toEqual({
      path: "/orders/42",
      changed: true,
    });

    expect(
      canonicalPath("/orders/lines/../42"),
      "and a double dot cancels the segment before it",
    ).toEqual({ path: "/orders/42", changed: true });

    expect(
      canonicalPath("/../../etc/passwd"),
      "climbing above the root is not an error and not an escape - there is " +
        "nothing above the root, so the extra levels are simply discarded",
    ).toEqual({ path: "/etc/passwd", changed: true });

    expect(canonicalPath("/orders/42/"), "a trailing slash is dropped").toEqual({
      path: "/orders/42",
      changed: true,
    });

    expect(
      canonicalPath("/"),
      "except on the root, which IS a single slash and is already canonical",
    ).toEqual({ path: "/", changed: false });

    expect(canonicalPath(""), "an empty path means the root").toEqual({
      path: "/",
      changed: true,
    });

    expect(
      canonicalPath("/orders/42?status=paid"),
      "the query is not part of the path, so it neither moves nor counts as a " +
        "change - the caller reattaches it when it builds the Location",
    ).toEqual({ path: "/orders/42", changed: false });

    expect(
      canonicalPath("/orders/42/?status=paid"),
      "...and a path that does need fixing still reports only the path",
    ).toEqual({ path: "/orders/42", changed: true });

    expect(
      canonicalPath("/a/..%2fb"),
      "%2f is NOT a separator here, and decoding before you normalise is " +
        "exactly how the traversal you just removed gets put back",
    ).toEqual({ path: "/a/..%2fb", changed: false });
  });

  test("ex6 - mountAt() lends a handler a shorter world", async () => {
    const seen: { url?: string; originalUrl?: string }[] = [];
    const inner = (req: IncomingMessage, res: ServerResponse): void => {
      seen.push({ url: req.url, originalUrl: (req as Mounted).originalUrl });
      json(res, 200, { url: req.url });
    };

    const mounted = mountAt("/api/v1", inner);
    const restored: (string | undefined)[] = [];
    // Wraps the mount so the gate can see req.url AFTER the inner handler has
    // run - the rewrite is supposed to be a loan, not a change.
    const observer = (req: IncomingMessage, res: ServerResponse): void => {
      mounted(req, res);
      restored.push(req.url);
    };

    const listed = await request(observer).get("/api/v1/orders");
    expect(listed.status, "a request under the prefix reaches the handler").toBe(200);
    expect(
      listed.body.url,
      "which sees the path WITHOUT the prefix - that is the whole point of " +
        "mounting: the inner routes are written as if they were at the root",
    ).toBe("/orders");
    expect(
      seen[0].originalUrl,
      "and the untouched URL is still available, because a log line or an " +
        "error page needs the address the client actually asked for",
    ).toBe("/api/v1/orders");
    expect(
      restored[0],
      "afterwards req.url is put back. Leaving it rewritten breaks every " +
        "middleware registered after the mount, and the symptom appears " +
        "somewhere else entirely",
    ).toBe("/api/v1/orders");

    const query = await request(observer).get("/api/v1/orders?limit=2");
    expect(
      query.body.url,
      "the query string belongs to the inner handler too - it is the PREFIX " +
        "that is stripped, not everything up to the question mark",
    ).toBe("/orders?limit=2");

    const exact = await request(observer).get("/api/v1");
    expect(
      exact.body.url,
      "a request for the mount point itself leaves nothing behind, and nothing " +
        "is the root - an empty string is not a valid path",
    ).toBe("/");

    const slashed = await request(observer).get("/api/v1/");
    expect(slashed.body.url, "and the same with the slash spelled out").toBe("/");

    const before = seen.length;
    const outside = await request(observer).get("/orders");
    expect(outside.status, "a request outside the prefix is a 404").toBe(404);
    expect(outside.body, "in JSON, like everything else this app says").toEqual({
      error: "not_found",
    });
    expect(
      seen.length,
      "and the inner handler is never called - if it were, it would answer " +
        "/orders from the wrong mount",
    ).toBe(before);

    const lookalike = await request(observer).get("/api/v1extra");
    expect(
      lookalike.status,
      "the prefix has to end on a segment boundary. A startsWith test matches " +
        "/api/v1extra and hands the inner handler the path extra",
    ).toBe(404);

    const nestedSeen: string[] = [];
    const leaf = (req: IncomingMessage, res: ServerResponse): void => {
      nestedSeen.push(req.url ?? "");
      json(res, 200, { url: req.url, original: (req as Mounted).originalUrl });
    };
    const nested = await request(mountAt("/api", mountAt("/v1", leaf))).get("/api/v1/orders");
    expect(nestedSeen[0], "mounts nest, each one taking its own prefix off").toBe("/orders");
    expect(
      nested.body.original,
      "and the original is the outermost URL, not the half-stripped one the " +
        "second mount was handed",
    ).toBe("/api/v1/orders");
  });

  test("ex7 - createRouter() dispatches, refuses and explains", async () => {
    const errors: unknown[] = [];
    const router = createRouter({ onError: (error) => errors.push(error) });

    // Registered BEFORE the literal it would otherwise swallow.
    router.get("/orders/:id", (_req, res, params) => json(res, 200, { route: "show", params }));
    router.get("/orders/new", (_req, res) => json(res, 200, { route: "new" }));
    router.get("/orders", (_req, res) => json(res, 200, { route: "list" }));
    router.post("/orders", (_req, res) => json(res, 201, { route: "create" }));
    router.put("/orders/:id", (_req, res, params) => json(res, 200, { route: "replace", params }));
    router.get("/boom", async () => {
      throw new Error("upstream exploded");
    });

    const literal = await request(router.handler).get("/orders/new");
    expect(
      literal.body,
      "a literal segment wins over a param that would also match, whatever " +
        "order they were registered in. A router that tries routes in " +
        "registration order makes /orders/new unreachable and the fix look " +
        "like superstition",
    ).toEqual({ route: "new" });

    const show = await request(router.handler).get("/orders/42");
    expect(show.body, "and the param route still gets everything else").toEqual({
      route: "show",
      params: { id: "42" },
    });

    const list = await request(router.handler).get("/orders");
    expect(list.body, "the collection is its own route").toEqual({ route: "list" });

    const created = await request(router.handler).post("/orders");
    expect(created.status, "same path, different method, different handler").toBe(201);

    const head = await request(router.handler).head("/orders");
    expect(
      head.status,
      "HEAD is not a method you register: it falls back to the GET handler, " +
        "because a client asking how big something is should not need you to " +
        "have thought of it",
    ).toBe(200);
    expect(head.text, "and it sends no body").toBeFalsy();

    const options = await request(router.handler).options("/orders");
    expect(
      options.status,
      "OPTIONS is answered by the router itself - 204, because there is " +
        "nothing to say beyond the header",
    ).toBe(204);
    expect(
      options.headers.allow,
      "and the header is the point: every method registered for this path, " +
        "plus the two the router provides",
    ).toBe("GET, HEAD, OPTIONS, POST");

    const refused = await request(router.handler).delete("/orders");
    expect(
      refused.status,
      "the path exists and the method does not: that is 405, not 404. The " +
        "difference tells a client whether to fix its URL or its verb",
    ).toBe(405);
    expect(refused.headers.allow, "with the same list").toBe("GET, HEAD, OPTIONS, POST");

    const wrongOnParam = await request(router.handler).delete("/orders/42");
    expect(wrongOnParam.status, "405 works on a param route too").toBe(405);
    expect(
      wrongOnParam.headers.allow,
      "and reports what that path really supports, not what some other path does",
    ).toBe("GET, HEAD, OPTIONS, PUT");

    const nowhere = await request(router.handler).get("/nowhere");
    expect(nowhere.status, "a path with no routes at all is a 404").toBe(404);

    const optionsNowhere = await request(router.handler).options("/nowhere");
    expect(
      optionsNowhere.status,
      "including for OPTIONS - answering 204 with an empty Allow would claim " +
        "the route exists",
    ).toBe(404);

    const exploded = await request(router.handler).get("/boom");
    expect(
      exploded.status,
      "an async handler that rejects must become a 500. If the router does not " +
        "await it, the promise is unhandled, the client waits until it times " +
        "out, and the process prints a warning nobody reads",
    ).toBe(500);
    expect(exploded.body, "with a body that gives an attacker nothing").toEqual({
      error: "internal_error",
    });
    expect(
      (errors[0] as Error).message,
      "...while the real error goes to the reporter you were given, because a " +
        "500 nobody can diagnose is a 500 that happens again tomorrow",
    ).toBe("upstream exploded");
  });

  test("ex8 - resolveRouteTree() walks a nested table and backs out again", () => {
    const tree: RouteNode = {
      index: ["GET"],
      children: {
        health: { index: ["GET"] },
        orders: {
          index: ["GET", "POST"],
          children: { new: { index: ["GET"] } },
          param: {
            name: "id",
            node: {
              index: ["GET", "PUT"],
              children: {
                lines: {
                  index: ["GET"],
                  param: { name: "line", node: { index: ["GET"] } },
                },
              },
            },
          },
        },
      },
    };

    expect(
      resolveRouteTree(tree, "GET", "/"),
      "the root can handle a request itself, and the chain to it is empty",
    ).toEqual({ chain: [], params: {} });

    expect(resolveRouteTree(tree, "GET", "/health"), "a static child, one level down").toEqual({
      chain: ["health"],
      params: {},
    });

    expect(
      resolveRouteTree(tree, "POST", "/orders"),
      "a node can answer several methods",
    ).toEqual({ chain: ["orders"], params: {} });

    expect(
      resolveRouteTree(tree, "DELETE", "/orders"),
      "and only the ones it lists - a node that matches the path but not the " +
        "method has not matched",
    ).toBeNull();

    expect(
      resolveRouteTree(tree, "get", "/health"),
      "the method is compared case-insensitively, because it arrives from the " +
        "wire and you did not write it",
    ).toEqual({ chain: ["health"], params: {} });

    expect(
      resolveRouteTree(tree, "GET", "/orders/new"),
      "a static child is tried before the param child at the same level",
    ).toEqual({ chain: ["orders", "new"], params: {} });

    expect(
      resolveRouteTree(tree, "GET", "/orders/42"),
      "and the param child catches what the static ones do not, binding its name",
    ).toEqual({ chain: ["orders", ":id"], params: { id: "42" } });

    expect(
      resolveRouteTree(tree, "GET", "/orders/7/lines/3"),
      "params from different levels are merged into one object",
    ).toEqual({ chain: ["orders", ":id", "lines", ":line"], params: { id: "7", line: "3" } });

    expect(
      resolveRouteTree(tree, "GET", "/orders/new/lines"),
      "this is the whole exercise. The static child new matches, and then the " +
        "subtree underneath it has no lines - so the walk has to BACK OUT and " +
        "try the param child instead, which does. A greedy walk that commits " +
        "to the first matching child returns null here and the route looks " +
        "unregistered",
    ).toEqual({ chain: ["orders", ":id", "lines"], params: { id: "new" } });

    expect(
      resolveRouteTree(tree, "GET", "/orders/order%2042"),
      "a bound param is decoded, like every other route parameter",
    ).toEqual({ chain: ["orders", ":id"], params: { id: "order 42" } });

    expect(resolveRouteTree(tree, "GET", "/nothing"), "an unknown path is null").toBeNull();

    expect(
      resolveRouteTree(tree, "GET", "/orders/42/lines/3/extra"),
      "and so is a path that runs off the end of the tree",
    ).toBeNull();
  });
});
