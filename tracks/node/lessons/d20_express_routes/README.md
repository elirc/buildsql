# d20 — Express routes

Eight problems on the express router, drawn from lesson
**09_express_fundamentals** — the mechanics under the routes you have been
writing since then. Nothing in this set is about REST semantics or validation;
it is about what express does with a request between the socket and your
handler, and about the parts of the routing API most people never reach for.

Every problem is graded through supertest against a fresh app from your factory,
so nothing listens on a port and no state survives a test.

## Problem 1 — one path, three verbs

Edit `ex1/solution.ts`. `createApp()` serves `GET`, `PUT` and `DELETE` on
`/notes/:id` through a single `app.route()` chain: 200 with the note, 200 with
the updated note, 204 with nothing. An unknown id is `404 { error: "not_found" }`
on every verb, and a method you did not register falls through to express.

```
uv run dojo test node d20_express_routes ex1
```

## Problem 2 — load it once, before anybody asks

Edit `ex2/solution.ts`. `createApp()` uses `app.param("id", ...)` to look the
note up once per request, answer the 404 centrally, and hand the result to the
handlers — which then contain no lookup at all. `GET /stats` reports the number
of lookups so far; `/health` and `/stats` must never cause one.

```
uv run dojo test node d20_express_routes ex2
```

## Problem 3 — a router that knows where it was mounted

Edit `ex3/solution.ts`. `createApp()` mounts a `Router` at
`/projects/:projectId` serving `/notes` and `/notes/:noteId`. Both routes need
`req.params.projectId` alongside their own parameters, and a router-level guard
answers `404 { error: "no_such_project" }` for the whole subtree.

```
uv run dojo test node d20_express_routes ex3
```

## Problem 4 — the handler that decides it is not the one

Edit `ex4/solution.ts`. `createApp()` registers `/reports/:id` **twice**. The
first route starts with a guard that keeps numeric ids and passes everything
else to the next route with `next("route")`; the second answers those. Each
response carries a `trail` of what actually ran.

```
uv run dojo test node d20_express_routes ex4
```

## Problem 5 — a sub-application, and its three urls

Edit `ex5/solution.ts`. `createApp()` mounts a second express app at `/api/v2`
with a `/notes/:id` route reporting `req.baseUrl`, `req.originalUrl` and
`req.url`. Middleware on the parent sets `x-parent` for everything; middleware
on the sub-app sets `x-sub` only inside the mount.

```
uv run dojo test node d20_express_routes ex5
```

## Problem 6 — settings, app.locals, res.locals

Edit `ex6/solution.ts`. `createApp({ strict, caseSensitive, service })` applies
express's `"strict routing"` and `"case sensitive routing"` settings, puts
`service` on `app.locals`, and has middleware write `res.locals.tenant` from the
`x-tenant` header (default `"public"`). `GET /notes` answers `{ service, tenant,
strict }`.

```
uv run dojo test node d20_express_routes ex6
```

## Problem 7 — the same five routes, for any resource

Edit `ex7/solution.ts`. `mountResource(app, { name, store })` registers list,
create, show, replace and destroy for that resource: `201` with a `Location` of
`/{name}/{id}`, `204` on delete, `404 { error: "not_found" }` for an unknown id.
Two specs on one app must not share anything.

```
uv run dojo test node d20_express_routes ex7
```

## Problem 8 — the status code express will not give you

Edit `ex8/solution.ts`. `createApp()` serves `GET|POST /notes`,
`GET|PATCH|DELETE /notes/:id` and `GET /health`, and answers **405** with a
sorted `Allow` header — including `OPTIONS`, and `HEAD` wherever `GET` exists —
when a known path is asked for with a method it does not have. `OPTIONS` gets
`204` and the same header; an unknown path is still `404`; `HEAD` still reaches
the `GET` handler.

```
uv run dojo test node d20_express_routes ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d20_express_routes. Quoted verbatim in README.md.
//
// Every test builds a fresh app from your factory and drives it with supertest,
// which wraps it in a server on an ephemeral port and shuts it down again. No
// app listens on a fixed port, no state survives between tests, and nothing
// here waits on a clock.
import express from "express";
import request from "supertest";
import { describe, expect, test } from "vitest";

import { createApp as createChained } from "./ex1/solution";
import { createApp as createPreloaded } from "./ex2/solution";
import { createApp as createNested } from "./ex3/solution";
import { createApp as createSkipping } from "./ex4/solution";
import { createApp as createMounted } from "./ex5/solution";
import { createApp as createConfigured } from "./ex6/solution";
import { mountResource } from "./ex7/solution";
import { createApp as createStrictMethods } from "./ex8/solution";

describe("d20_express_routes", () => {
  test("ex1 - app.route() declares one path once and hangs three verbs off it", async () => {
    const app = createChained();

    const found = await request(app).get("/notes/n1");
    expect(found.status, "the seeded note is there").toBe(200);
    expect(found.body, "and comes back whole").toEqual({ id: "n1", title: "buy milk" });

    const replaced = await request(app)
      .put("/notes/n1")
      .set("content-type", "application/json")
      .send({ title: "buy oat milk" });
    expect(replaced.status, "a successful replace is a 200 with the new value").toBe(200);
    expect(replaced.body, "the title really changed").toEqual({ id: "n1", title: "buy oat milk" });

    const readBack = await request(app).get("/notes/n1");
    expect(
      readBack.body.title,
      "and it stuck - the three verbs share one store, because they are three " +
        "handlers on one route and not three separate copies of the lookup",
    ).toBe("buy oat milk");

    const removed = await request(app).delete("/notes/n2");
    expect(removed.status, "a successful delete is 204: it worked, and there is nothing to say").toBe(
      204,
    );
    expect(removed.text, "204 means no body at all").toBeFalsy();
    expect(
      (await request(app).get("/notes/n2")).status,
      "and then it is really gone",
    ).toBe(404);

    for (const missing of [
      await request(app).get("/notes/nope"),
      await request(app).put("/notes/nope").set("content-type", "application/json").send({ title: "x" }),
      await request(app).delete("/notes/nope"),
    ]) {
      expect(
        missing.status,
        "an unknown id is a 404 on every verb, not an empty 200 and not a crash",
      ).toBe(404);
      expect(missing.body, "with the shared error shape").toEqual({ error: "not_found" });
    }

    expect(
      (await request(app).patch("/notes/n1")).status,
      "PATCH was never registered on that route, so express falls through to " +
        "its own final handler - a route is a path AND a method",
    ).toBe(404);
  }, 30_000);

  test("ex2 - app.param() loads the note once, before any handler runs", async () => {
    const app = createPreloaded();

    const shown = await request(app).get("/notes/n1");
    expect(shown.status, "the note exists").toBe(200);
    expect(
      shown.body.note,
      "the handler answered from a note it never looked up: the param " +
        "callback had already put it on the request",
    ).toEqual({ id: "n1", title: "buy milk" });
    expect(
      shown.body.seenBy,
      "and both handlers in the chain saw the same loaded note, in order",
    ).toEqual(["stamp", "show"]);

    expect(
      (await request(app).get("/stats")).body,
      "one request that named an id means exactly one lookup - express calls " +
        "the param callback once per request, however many handlers follow it",
    ).toEqual({ lookups: 1 });

    await request(app).get("/health");
    await request(app).get("/health");
    expect(
      (await request(app).get("/stats")).body,
      "and a route with no :id in its path never triggers it at all. A " +
        "middleware registered with app.use() would have run for all three",
    ).toEqual({ lookups: 1 });

    const renamed = await request(app)
      .put("/notes/n2")
      .set("content-type", "application/json")
      .send({ title: "call ada" });
    expect(renamed.status, "the same preloader serves the write route").toBe(200);
    expect(renamed.body, "which also never looked the note up").toEqual({
      id: "n2",
      title: "call ada",
    });

    const missing = await request(app).get("/notes/nope");
    expect(
      missing.status,
      "the 404 is decided in ONE place. Three routes with three copies of the " +
        "same if-not-found is three chances to word it differently",
    ).toBe(404);
    expect(missing.body).toEqual({ error: "not_found" });

    expect(
      (await request(app).delete("/notes/nope")).body,
      "every route under :id inherits it",
    ).toEqual({ error: "not_found" });
  }, 30_000);

  test("ex3 - a mergeParams router can see the parameter it was mounted under", async () => {
    const app = createNested();

    const one = await request(app).get("/projects/p1/notes/n2");
    expect(one.status, "the nested note exists").toBe(200);
    expect(
      one.body,
      "the router was mounted at /projects/:projectId and its own route " +
        "matched /notes/:noteId - both parameters have to arrive together, and " +
        "without mergeParams the projectId is simply not there",
    ).toEqual({ projectId: "p1", noteId: "n2", title: "call ada" });

    const list = await request(app).get("/projects/p1/notes");
    expect(
      list.body,
      "a route inside the router is written relative to the mount path, and " +
        "still knows which project it is scoped to",
    ).toEqual({ projectId: "p1", noteIds: ["n1", "n2"] });

    const otherProject = await request(app).get("/projects/p2/notes");
    expect(
      otherProject.body,
      "a different value for the mounted parameter selects different data - " +
        "one router, mounted once, serving every project",
    ).toEqual({ projectId: "p2", noteIds: ["n3"] });

    const unknownProject = await request(app).get("/projects/p9/notes/n1");
    expect(
      unknownProject.status,
      "a router-level middleware can reject the whole subtree in one place, " +
        "which is only possible because it can read the parent parameter",
    ).toBe(404);
    expect(unknownProject.body).toEqual({ error: "no_such_project" });

    expect(
      (await request(app).get("/notes/n1")).status,
      "and the router routes exist ONLY under the mount path",
    ).toBe(404);
  }, 30_000);

  test("ex4 - next(route) leaves this route and next() stays inside it", async () => {
    const app = createSkipping();

    const numeric = await request(app).get("/reports/2026");
    expect(
      numeric.body,
      "the guard let it through with next(), so the second handler of the " +
        "SAME route ran",
    ).toEqual({ handled: "numeric", trail: ["guard", "numeric"] });

    const slug = await request(app).get("/reports/annual-summary");
    expect(
      slug.body,
      "the guard called next(route), which abandons the rest of this route " +
        "and offers the request to the next route that matches the same path. " +
        "If numeric appears in this trail you called next() instead",
    ).toEqual({ handled: "slug", trail: ["guard", "slug"] });

    expect(
      slug.body.trail,
      "and the skipped handler left no trace at all - next(route) is not a " +
        "way to run something later",
    ).not.toContain("numeric");

    const third = await request(app).get("/reports/annual-summary/raw");
    expect(
      third.status,
      "a path no route matches is still a 404: next(route) hands the request " +
        "on, it does not invent a handler for it",
    ).toBe(404);

    const answered = await request(app).get("/reports/1");
    expect(
      answered.body.trail,
      "and a handler that RESPONDS ends the line - the slug route is " +
        "registered after this one and never sees the request",
    ).toEqual(["guard", "numeric"]);
  }, 30_000);

  test("ex5 - a mounted sub-application is handed a rewritten url", async () => {
    const app = createMounted();

    const inside = await request(app).get("/api/v2/notes/9?expand=author");
    expect(inside.status, "the sub-app answers under its mount path").toBe(200);
    expect(
      inside.body,
      "three different strings, and knowing which is which is the whole " +
        "trick: baseUrl is where the sub-app was mounted, originalUrl is what " +
        "the client actually asked for, and url is what is left for the " +
        "sub-app to route on - query string included",
    ).toEqual({
      baseUrl: "/api/v2",
      originalUrl: "/api/v2/notes/9?expand=author",
      url: "/notes/9?expand=author",
      id: "9",
    });

    expect(
      inside.headers["x-parent"],
      "middleware on the parent app runs before the mount is even considered",
    ).toBe("ran");
    expect(
      inside.headers["x-sub"],
      "and middleware on the sub-app runs for everything inside the mount",
    ).toBe("ran");

    const outside = await request(app).get("/health");
    expect(outside.status, "the parent has its own routes").toBe(200);
    expect(
      outside.headers["x-sub"],
      "which the sub-app middleware must NOT touch - mounting is what scopes it",
    ).toBeUndefined();
    expect(outside.headers["x-parent"], "while the parent middleware still runs").toBe("ran");

    expect(
      (await request(app).get("/notes/9")).status,
      "and the sub-app routes do not exist outside the mount path",
    ).toBe(404);
  }, 30_000);

  test("ex6 - settings change how routing works and locals change what a response knows", async () => {
    const lenient = createConfigured({ strict: false, caseSensitive: false, service: "notes-api" });

    expect((await request(lenient).get("/notes")).status, "the plain path always works").toBe(200);
    expect(
      (await request(lenient).get("/notes/")).status,
      "by default a trailing slash is the same route",
    ).toBe(200);
    expect(
      (await request(lenient).get("/Notes")).status,
      "and by default the path is matched case-insensitively",
    ).toBe(200);

    const strict = createConfigured({ strict: true, caseSensitive: true, service: "notes-api" });

    expect((await request(strict).get("/notes")).status, "still the same route").toBe(200);
    expect(
      (await request(strict).get("/notes/")).status,
      "strict routing makes the trailing slash a different path. These are " +
        "app settings, read when the router is built, so they have to be set " +
        "BEFORE the routes are registered",
    ).toBe(404);
    expect(
      (await request(strict).get("/Notes")).status,
      "and case sensitive routing makes /Notes a different path too",
    ).toBe(404);

    const first = await request(strict).get("/notes").set("x-tenant", "acme");
    expect(
      first.body,
      "app.locals is application-wide and app.get(name) reads a setting back; " +
        "res.locals is filled in by middleware for this one response",
    ).toEqual({ service: "notes-api", tenant: "acme", strict: true });

    const second = await request(strict).get("/notes");
    expect(
      second.body.tenant,
      "and res.locals starts empty for the next request. If acme leaks into " +
        "this response you stored per-request state on the app, which is the " +
        "bug that only appears once two users are online at the same time",
    ).toBe("public");
  }, 30_000);

  test("ex7 - mountResource() registers the same five routes for any resource", async () => {
    const app = createResourceApp();

    const listed = await request(app).get("/notes");
    expect(listed.status, "the collection route exists").toBe(200);
    expect(listed.body, "and lists what the store holds, in insertion order").toEqual([
      { id: "n1", title: "buy milk" },
      { id: "n2", title: "call ada" },
    ]);

    const created = await request(app)
      .post("/tags")
      .set("content-type", "application/json")
      .send({ title: "urgent" });
    expect(created.status, "a create is a 201").toBe(201);
    expect(
      created.headers.location,
      "with a Location header built from the resource name and the new id",
    ).toBe("/tags/t2");
    expect(created.body, "and the created record comes back").toEqual({
      id: "t2",
      title: "urgent",
    });

    expect(
      (await request(app).get("/tags")).body.map((tag: { id: string }) => tag.id),
      "the two resources are independent: creating a tag did not touch the notes",
    ).toEqual(["t1", "t2"]);
    expect(
      (await request(app).get("/notes")).body.length,
      "and the notes are still exactly what they were",
    ).toBe(2);

    const one = await request(app).get("/tags/t1");
    expect(one.body, "the member route works for the second resource too").toEqual({
      id: "t1",
      title: "later",
    });

    const updated = await request(app)
      .put("/notes/n1")
      .set("content-type", "application/json")
      .send({ title: "buy oat milk" });
    expect(updated.body, "so does the update route").toEqual({ id: "n1", title: "buy oat milk" });

    expect((await request(app).delete("/notes/n2")).status, "and the delete route").toBe(204);
    expect(
      (await request(app).get("/notes")).body.map((note: { id: string }) => note.id),
      "which really removed it",
    ).toEqual(["n1"]);

    for (const missing of [
      await request(app).get("/notes/nope"),
      await request(app).put("/notes/nope").set("content-type", "application/json").send({ title: "x" }),
      await request(app).delete("/notes/nope"),
      await request(app).get("/tags/nope"),
    ]) {
      expect(
        missing.status,
        "an unknown id is a 404 in every resource, because there is only one " +
          "copy of this code - that is the entire point of generating the routes",
      ).toBe(404);
    }
  }, 30_000);

  test("ex8 - a path that exists with another method is a 405, and says what is allowed", async () => {
    const app = createStrictMethods();

    const listed = await request(app).get("/notes");
    expect(listed.status, "the real routes are untouched").toBe(200);
    expect(listed.body, "and answer normally").toEqual([{ id: "n1", title: "buy milk" }]);

    const wrongOnCollection = await request(app).delete("/notes");
    expect(
      wrongOnCollection.status,
      "express has no idea what a 405 is: an unregistered method simply " +
        "matches no route and falls through to the 404. Telling the client " +
        "that /notes does not exist, when it does and it just does not take " +
        "DELETE, is a lie it cannot debug",
    ).toBe(405);
    expect(
      wrongOnCollection.headers.allow,
      "a 405 MUST carry Allow - it is the part of the answer that is useful. " +
        "Sorted, comma separated, and it advertises OPTIONS and HEAD as well " +
        "as the methods you registered",
    ).toBe("GET, HEAD, OPTIONS, POST");
    expect(wrongOnCollection.body, "with the shared error shape").toEqual({
      error: "method_not_allowed",
    });

    const wrongOnMember = await request(app).post("/notes/n1");
    expect(wrongOnMember.status, "the member path has its own set of methods").toBe(405);
    expect(
      wrongOnMember.headers.allow,
      "and its own Allow header - one list per PATH, not one list for the app",
    ).toBe("DELETE, GET, HEAD, OPTIONS, PATCH");

    const options = await request(app).options("/notes");
    expect(
      options.status,
      "OPTIONS is a question about the path rather than a method that was " +
        "refused, so it is answered, not rejected",
    ).toBe(204);
    expect(options.headers.allow, "with the same list").toBe("GET, HEAD, OPTIONS, POST");
    expect(options.text, "and no body").toBeFalsy();

    const head = await request(app).head("/notes");
    expect(
      head.status,
      "HEAD is routed to the GET handler by express itself, so it must not be " +
        "caught by your method check on the way past",
    ).toBe(200);

    const unknown = await request(app).get("/nope");
    expect(
      unknown.status,
      "a path that is not in the table at all is still a 404 - 405 is a claim " +
        "that the path exists",
    ).toBe(404);
    expect(unknown.body).toEqual({ error: "not_found" });

    const unknownMethod = await request(app).delete("/nope");
    expect(unknownMethod.status, "whatever the method").toBe(404);

    expect(
      (await request(app).get("/health")).status,
      "and a path with a single method still serves it",
    ).toBe(200);
    expect(
      (await request(app).post("/health")).headers.allow,
      "while refusing the others",
    ).toBe("GET, HEAD, OPTIONS");
  });
});

/** ex7 drives two resources on one app; the stores are the gate's, not yours. */
function createResourceApp() {
  const app = express();
  app.use(express.json());
  mountResource(app, { name: "notes", store: createStore("n", [{ title: "buy milk" }, { title: "call ada" }]) });
  mountResource(app, { name: "tags", store: createStore("t", [{ title: "later" }]) });
  return app;
}

/** A tiny in-memory store, so ex7 is about routing and nothing else. */
function createStore(prefix: string, seed: { title: string }[]) {
  const records: { id: string; title: string }[] = [];
  let next = 1;
  const add = (title: string) => {
    const record = { id: `${prefix}${next}`, title };
    next += 1;
    records.push(record);
    return { ...record };
  };
  for (const item of seed) add(item.title);

  return {
    list: () => records.map((record) => ({ ...record })),
    get: (id: string) => {
      const found = records.find((record) => record.id === id);
      return found ? { ...found } : undefined;
    },
    create: (input: { title: string }) => add(input.title),
    update: (id: string, input: { title: string }) => {
      const found = records.find((record) => record.id === id);
      if (!found) return undefined;
      found.title = input.title;
      return { ...found };
    },
    remove: (id: string) => {
      const index = records.findIndex((record) => record.id === id);
      if (index === -1) return false;
      records.splice(index, 1);
      return true;
    },
  };
}
```

In plain English:

- **ex1** drives all three verbs, checks the update stuck, then hits every verb
  with an unknown id and PATCHes a route that has no PATCH.
- **ex2** counts lookups across requests that have an `:id` and requests that do
  not, and checks two handlers in one chain saw one load.
- **ex3** reads the mounted parameter from two routes, switches projects, and
  checks the subtree guard and the mount boundary.
- **ex4** compares the trail left by `next()` with the trail left by
  `next("route")`, and checks the skipped handler left none.
- **ex5** reads the three url properties in one response and checks each
  middleware ran on exactly its own side of the mount.
- **ex6** builds two apps with different settings, then checks `res.locals` did
  not leak from one request into the next.
- **ex7** mounts `notes` and `tags` on one app and drives both, including a
  create on one that must not disturb the other.
- **ex8** asks for a known path with the wrong method, reads `Allow`, then
  checks OPTIONS, HEAD, an unknown path and the real routes.

Next: **d21_middleware**, the layer above these.
