# 11 — The REST capstone

Eleven lessons of pieces; this one is the machine. You are going to build a
small task API — list, read, create, patch, delete — with an in-memory store,
schema validation at the edge, one error handler at the bottom, and a request
id on every response. It is graded end to end with supertest, the same way you
would test it at work.

Nothing here is a new concept. The store is closure state (lesson 01) with
defensive copies. The endpoints are express routes (lesson 09). The validation
is zod in a middleware (lesson 10). The error handling is the funnel you built
in 10 ex3, and the async semantics are express 5's. What is new is that they
all have to work *at once*, on the same object, without contradicting each
other — which is a genuinely different skill from getting each one right in
isolation.

The four exercises build up in layers, each one a complete, gradeable app:
the store on its own, then reads, then writes, then the whole thing wired
together with the error funnel. You are expected to copy your own earlier code
forward. That is what a capstone is.

## Concept — the layers, and where each decision lives

```
   HTTP layer            express routes, status codes, headers
        │                  ↑ throws AppError            ↓ res.json
   validation             zod schemas at the edge
        │                  ↑ returns parsed data
   store / repository     the data, and the rules about the data
```

**The store knows nothing about HTTP.** No `req`, no `res`, no status codes.
It answers `undefined` for "not there" and lets the layer above decide that
this means 404. That separation is what lets you swap an array for Postgres
later without touching a route, and — more immediately — it is what lets ex1
be tested in microseconds with no server at all.

**The store hands out copies.** This is the rule people skip, and it is the
reason "the data changed and nothing wrote to it" bugs happen:

```ts
const task = store.get("task-1");
task.title = "whatever";          // if this is the store's own object...
store.get("task-1").title;        // ..."whatever". Your store is not in charge.
```

A `{ ...task }` on the way out costs nothing and makes the store the only
thing that can change its own data.

**The HTTP layer owns the vocabulary.** Which status, which headers, which
body shape:

| operation | success | failure |
|---|---|---|
| `GET /tasks` | 200 `{ items, total }` | 400 for a bad filter |
| `GET /tasks/:id` | 200 the task | 404 |
| `POST /tasks` | **201** + `Location` | 400 validation |
| `PATCH /tasks/:id` | 200 the new value | 400 validation, 404 |
| `DELETE /tasks/:id` | **204**, no body | 404 |

`POST` returns 201 with a `Location` header because the client did not choose
the id and needs to be told it. `DELETE` returns 204 because there is nothing
left to describe. `PATCH` is partial by definition — a body of
`{ "status": "done" }` must not blank the title, which is exactly what `PUT`
*would* mean.

**Errors go one way: up.** Routes throw; one handler converts. That is what
makes every error response in the API the same shape, including the ones from
paths nobody tested.

## Exercise 1 — the store

Edit `ex1/solution.ts`. Implement `createTaskStore(seed?)` returning an object
with five methods:

- `list(filter?)` — everything, in insertion order; `list({ status })`
  filters;
- `get(id)` — the task, or `undefined`;
- `create({ title, status? })` — assigns the next id (`task-1`, `task-2`, …),
  defaults the status to `"todo"`, returns the new task;
- `update(id, patch)` — merges only the fields the patch mentions, returns the
  updated task, or `undefined` if there is no such id;
- `remove(id)` — returns whether it removed anything.

And the rule that is easy to miss: **everything the store returns is a copy.**
The gate mutates a task it was handed and then checks the store is unchanged.

```
uv run dojo test node 11_rest_capstone ex1
```

## Exercise 2 — the read endpoints

Edit `ex2/solution.ts`. Implement `createApp()` over the provided `SEED`:

- `GET /tasks` → `{ items, total }`;
- `GET /tasks?status=done` → the filtered list, with `total` following the
  filter;
- `GET /tasks?status=elephant` → **400**
  `{"error":"invalid_status","message":"status must be one of todo, doing,
  done"}`;
- `GET /tasks/:id` → the task, or **404**
  `{"error":"not_found","message":"no such task"}`;
- any unmatched route → **404**
  `{"error":"not_found","message":"no such route"}`.

You may copy your ex1 store into this file or keep a plain array — the gate
only speaks HTTP.

```
uv run dojo test node 11_rest_capstone ex2
```

## Exercise 3 — the write endpoints

Edit `ex3/solution.ts`. The zod schemas are provided. Implement:

- `POST /tasks` → **201**, `Location: /tasks/task-1`, the created task.
  Invalid body → **400**
  `{"error":"validation_failed","details":[{"path":"title","message":"..."}]}`;
- `PATCH /tasks/:id` → **200** with the updated task; unknown id → 404;
  invalid body → 400 in the same shape;
- `DELETE /tasks/:id` → **204** with no body; unknown id → 404.

Two details the gate checks and both are about parsing rather than
validating. A `POST` with an extra key it did not ask for comes back without
it. And a `PATCH` carrying `{"id":"hacked"}` leaves the id alone — not because
you wrote a check, but because the schema never mentioned `id` and parsing
removed it.

```
uv run dojo test node 11_rest_capstone ex3
```

## Exercise 4 — the whole API

Edit `ex4/solution.ts`. Everything from ex2 and ex3, in one app, plus:

- an **`x-request-id` header on every response**, counted from `req-1` by a
  middleware at the top of the stack — including on error responses;
- routes that **throw** `AppError` (provided) instead of answering failures
  themselves;
- a "no such route" middleware after the routes;
- one **error handler** last, which maps:
  - a validation failure → 400 `{ error: "validation_failed", details: [...] }`
  - any other `AppError` → its status, `{ error: <code>, message: <message> }`
  - anything else → 500 `{"error":"internal_error","message":"internal server
    error"}`.

The gate runs a whole lifecycle: list, create, read back at the `Location`
URL, see it in a filtered list, patch it, delete it, and confirm it is gone —
then checks that validation still applies and that an unknown route is a JSON
404. That sequence is what "it works" actually means for an API.

```
uv run dojo test node 11_rest_capstone ex4
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import request from "supertest";
import { describe, expect, test } from "vitest";

import { createTaskStore } from "./ex1/solution";
import { createApp as createReadApi } from "./ex2/solution";
import { createApp as createWriteApi } from "./ex3/solution";
import { createApp as createApi } from "./ex4/solution";

describe("11_rest_capstone", () => {
  test("ex1 - createTaskStore() is a repository, not a shared mutable array", () => {
    const store = createTaskStore([
      { id: "seed-1", title: "write the readme", status: "done" },
      { id: "seed-2", title: "ship it", status: "todo" },
    ]);

    expect(
      store.list().map((task) => task.id),
      "list() returns everything, in insertion order",
    ).toEqual(["seed-1", "seed-2"]);
    expect(
      store.list({ status: "done" }).map((task) => task.id),
      "list({ status }) filters",
    ).toEqual(["seed-1"]);

    const created = store.create({ title: "add tests" });
    expect(
      created.id,
      "ids are assigned by the store, in creation order, starting at task-1 - " +
        "the caller does not get to choose one",
    ).toBe("task-1");
    expect(
      created.status,
      'a new task defaults to "todo" when no status is given',
    ).toBe("todo");
    expect(
      store.create({ title: "and another", status: "doing" }),
      "the second created task is task-2, and an explicit status is kept",
    ).toEqual({ id: "task-2", title: "and another", status: "doing" });

    const fetched = store.get("task-1");
    expect(fetched, "get() finds it").toEqual({
      id: "task-1",
      title: "add tests",
      status: "todo",
    });
    expect(
      store.get("nope"),
      "a missing id is undefined - the store does not throw, the caller decides",
    ).toBeUndefined();

    if (fetched) fetched.title = "MUTATED";
    expect(
      store.get("task-1")?.title,
      "the value you hand out must be a COPY. If a caller can mutate the " +
        "object you returned, your store has no control over its own data " +
        "(README ex1)",
    ).toBe("add tests");

    const updated = store.update("task-1", { status: "done" });
    expect(
      updated,
      "update() merges the patch and returns the new value - fields the patch " +
        "does not mention are left alone",
    ).toEqual({ id: "task-1", title: "add tests", status: "done" });
    expect(
      store.update("nope", { status: "done" }),
      "updating something that is not there is undefined, not a throw",
    ).toBeUndefined();

    expect(store.remove("task-1"), "remove() reports whether it removed anything").toBe(true);
    expect(store.remove("task-1"), "...and a second removal removes nothing").toBe(false);
    expect(
      store.list().map((task) => task.id),
      "the list reflects it",
    ).toEqual(["seed-1", "seed-2", "task-2"]);
  });

  test("ex2 - the read endpoints answer honestly", async () => {
    const app = createReadApi();

    const all = await request(app).get("/tasks");
    expect(all.status).toBe(200);
    expect(
      all.body,
      "a collection response carries the items and the total, so the client " +
        "never has to count the array to know what it has",
    ).toEqual({
      items: [
        { id: "seed-1", title: "write the readme", status: "done" },
        { id: "seed-2", title: "ship it", status: "todo" },
        { id: "seed-3", title: "review the pull request", status: "doing" },
      ],
      total: 3,
    });

    const filtered = await request(app).get("/tasks?status=done");
    expect(
      filtered.body,
      "?status filters, and the total follows the filter",
    ).toEqual({
      items: [{ id: "seed-1", title: "write the readme", status: "done" }],
      total: 1,
    });

    const bogus = await request(app).get("/tasks?status=elephant");
    expect(
      bogus.status,
      "a status outside the allowed set is a 400: the client asked something " +
        "that cannot be answered, and an empty list would be a lie",
    ).toBe(400);
    expect(bogus.body).toEqual({
      error: "invalid_status",
      message: "status must be one of todo, doing, done",
    });

    const one = await request(app).get("/tasks/seed-2");
    expect(one.status).toBe(200);
    expect(one.body).toEqual({ id: "seed-2", title: "ship it", status: "todo" });

    const missing = await request(app).get("/tasks/nope");
    expect(missing.status, "an unknown id is a 404").toBe(404);
    expect(missing.body).toEqual({ error: "not_found", message: "no such task" });

    const nowhere = await request(app).get("/nowhere");
    expect(nowhere.status, "an unknown route is a 404 too").toBe(404);
    expect(
      nowhere.body,
      "...in the same JSON shape. An API that answers HTML on one path and " +
        "JSON on another breaks every client that assumed JSON",
    ).toEqual({ error: "not_found", message: "no such route" });
  });

  test("ex3 - the write endpoints validate before they touch anything", async () => {
    const app = createWriteApi();

    const created = await request(app)
      .post("/tasks")
      .set("content-type", "application/json")
      .send({ title: "add tests", extra: "ignored" });

    expect(created.status, "a create is a 201").toBe(201);
    expect(
      created.headers.location,
      "with a Location header pointing at the new resource",
    ).toBe("/tasks/task-1");
    expect(
      created.body,
      "the created task: an id from the server, the title from the client, a " +
        "default status - and no trace of the key that was not in the schema",
    ).toEqual({ id: "task-1", title: "add tests", status: "todo" });

    const invalid = await request(app)
      .post("/tasks")
      .set("content-type", "application/json")
      .send({ title: "", status: "urgent" });

    expect(invalid.status, "an invalid body is a 400").toBe(400);
    expect(invalid.body.error).toBe("validation_failed");
    expect(
      (invalid.body.details as { path: string }[]).map((issue) => issue.path).sort(),
      "both problems are reported: an empty title and a status that is not one " +
        "of the three",
    ).toEqual(["status", "title"]);

    const patched = await request(app)
      .patch("/tasks/seed-2")
      .set("content-type", "application/json")
      .send({ status: "doing" });
    expect(patched.status, "a successful patch is a 200 with the new value").toBe(200);
    expect(
      patched.body,
      "PATCH is partial: the title is untouched",
    ).toEqual({ id: "seed-2", title: "ship it", status: "doing" });

    const forged = await request(app)
      .patch("/tasks/seed-2")
      .set("content-type", "application/json")
      .send({ id: "hacked", status: "done" });
    expect(
      forged.body.id,
      "the id is not a field the client may patch - the schema does not " +
        "mention it, so parsing strips it before your handler ever sees it",
    ).toBe("seed-2");

    const patchMissing = await request(app)
      .patch("/tasks/nope")
      .set("content-type", "application/json")
      .send({ status: "done" });
    expect(patchMissing.status, "patching something that is not there is a 404").toBe(404);

    const deleted = await request(app).delete("/tasks/seed-1");
    expect(
      deleted.status,
      "a successful delete is 204: it worked, and there is nothing to say",
    ).toBe(204);
    expect(deleted.text, "204 means no body at all").toBeFalsy();

    const deletedAgain = await request(app).delete("/tasks/seed-1");
    expect(
      deletedAgain.status,
      "deleting it twice is a 404 the second time - the resource is gone",
    ).toBe(404);
  });

  test("ex4 - the whole API, end to end", async () => {
    const app = createApi();

    const first = await request(app).get("/tasks");
    expect(
      first.headers["x-request-id"],
      "every response carries a request id, counted from 1 by the middleware " +
        "at the top of the stack",
    ).toBe("req-1");
    expect(first.body.total, "the app starts with the three seeded tasks").toBe(3);

    const created = await request(app)
      .post("/tasks")
      .set("content-type", "application/json")
      .send({ title: "deploy on friday", status: "doing" });
    expect(created.status).toBe(201);
    expect(created.headers.location).toBe("/tasks/task-1");
    expect(created.headers["x-request-id"], "the second request of this app").toBe("req-2");

    const fetched = await request(app).get("/tasks/task-1");
    expect(
      fetched.body,
      "what you created is what you can read back - the whole point of the " +
        "Location header is that this URL works",
    ).toEqual({ id: "task-1", title: "deploy on friday", status: "doing" });

    const listed = await request(app).get("/tasks?status=doing");
    expect(
      listed.body.items.map((task: { id: string }) => task.id),
      "and it appears in the filtered collection alongside the seeded one",
    ).toEqual(["seed-3", "task-1"]);

    const patched = await request(app)
      .patch("/tasks/task-1")
      .set("content-type", "application/json")
      .send({ status: "done" });
    expect(patched.body.status, "the patch sticks").toBe("done");

    const removed = await request(app).delete("/tasks/task-1");
    expect(removed.status).toBe(204);

    const gone = await request(app).get("/tasks/task-1");
    expect(gone.status, "and then it is really gone").toBe(404);
    expect(gone.body, "with the shared error shape").toEqual({
      error: "not_found",
      message: "no such task",
    });

    const invalid = await request(app)
      .post("/tasks")
      .set("content-type", "application/json")
      .send({ title: 42 });
    expect(invalid.status, "validation still applies").toBe(400);
    expect(invalid.body.error).toBe("validation_failed");
    expect(
      invalid.headers["x-request-id"],
      "an error response is still a response: it carries the request id, which " +
        "is what lets a user paste an id into a support ticket and have you " +
        "find the exact request in the logs",
    ).toBeTruthy();

    const nowhere = await request(app).post("/nowhere");
    expect(nowhere.status, "an unknown route, any method, is a 404").toBe(404);
    expect(nowhere.body).toEqual({ error: "not_found", message: "no such route" });
  });
});
```

In plain English:

- **ex1** exercises the store directly — no HTTP at all — including the
  copy-semantics check (mutate what you were given, then look again) and the
  "second remove returns false" case.
- **ex2** checks both shapes of the collection response, the invalid filter,
  the found and missing single task, and the unmatched route.
- **ex3** creates (checking the `Location` header and the stripped extra key),
  fails validation with *two* problems at once, patches partially, tries to
  forge an id, patches something missing, and deletes twice.
- **ex4** is a single lifecycle from an empty-handed client to a deleted
  resource, with the request id checked on the first two responses and on an
  error response.

## The teaching point

What you have built is the shape of every service you will be handed. A thin
HTTP layer that knows about status codes; a validation boundary where
untrusted input becomes typed data; a store that owns its data and hands out
copies; one error funnel; observability (the request id) that costs four lines
and is the difference between "a user reported an error" and "here is the
exact request".

Swap the in-memory array for a database and almost nothing above it changes —
the routes still call `store.get`, the schemas still parse, the funnel still
funnels. That is not an accident of this exercise; it is what the layering is
*for*, and it is the answer to "how would you structure a Node service?" in an
interview.

You have now finished the main course: the runtime, the loop, async, errors,
files, buffers, streams, HTTP by hand, express, and a real API. What is left
is the part that gets you hired.

Next: **i1_interview_concepts**, the question bank — fifty-odd questions with
the answers a strong candidate actually gives, plus four exercises that check
the concepts a whiteboard cannot.
