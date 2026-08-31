# d23 — REST patterns

Eight problems on the part of an API that is not code you write but promises you
keep. Lesson **11_rest_capstone** built the task service — a store, a
collection, the four verbs, one error shape. This set drills what the capstone
had no room for: what each verb owes the client, how a collection is paged when
it is changing, what an error body looks like when it follows a standard, and
the two hard ones — retries and batches.

Validation is deliberately trivial here. The schemas are one `typeof` check
apiece so that nothing distracts from the status codes, and every app is a fresh
`createApp()` driven by supertest on a port the OS picks.

## Problem 1 — the verb decides the code

Edit `ex1/solution.ts`. `createApp()` serves `/tasks` (seeded with `seed-1`,
"write the spec", not done). `POST` creates with 201 and a `Location`. `PUT
/tasks/:id` **creates** an id nobody is using (201 + `Location`) and
**replaces** one that exists (200) — replace meaning a field the body omits
returns to its default. `PATCH` merges, and 404s rather than creating. `DELETE`
is 204, and 404 the second time. `GET /tasks` lists.

```
uv run dojo test node d23_rest_patterns ex1
```

## Problem 2 — send what was asked for

Edit `ex2/solution.ts`. `createApp()` serves `GET /tasks` (as
`{ items, total }`) and `GET /tasks/:id` over resources with
`id`, `title`, `done`, `owner` and `createdAt`. `?fields=title,owner` returns
only those — plus `id`, always, and never twice. An absent or empty `fields` is
the whole resource. An unknown name is 400
`{ error: "unknown_field", field }`.

```
uv run dojo test node d23_rest_patterns ex2
```

## Problem 3 — one error shape, and nothing leaking through it

Edit `ex3/solution.ts`. `problem(input)` builds an RFC 9457 document —
`{ type, title, status, detail, instance }`, `type` defaulting to
`about:blank`. `createApp(logError)` answers every failure with one, sent as
`application/problem+json`: a 404 for an unknown task, a 400 for
`?status=elephant` (detail `status must be one of open, done`), a 409 for
re-archiving `seed-1` (type
`https://example.com/probs/already-archived`), and — for the throw at
`GET /boom` — a 500 whose detail is `an unexpected error occurred` while the
real error goes to `logError`.

```
uv run dojo test node d23_rest_patterns ex3
```

## Problem 4 — pages that do not slip

Edit `ex4/solution.ts`. `createApp()` serves `GET /tasks?limit=&cursor=` over
five tasks `t-1`…`t-5` in id order, answering `{ items, nextCursor }`. The
cursor is the last id served, base64url-encoded and opaque; the last page
carries `nextCursor: null`. `limit` defaults to 2 and is **capped** at 3. A
cursor that names no task in the collection is 400
`{ error: "invalid_cursor" }`.

```
uv run dojo test node d23_rest_patterns ex4
```

## Problem 5 — a resource inside another one

Edit `ex5/solution.ts`. `createApp()` serves `/projects/:projectId/tasks` over
projects `p-1` and `p-2`. Listing answers `{ items, total }` for that parent
only; a parent that does not exist is 404
`{ error: "project_not_found" }`, not an empty list. `POST` creates with 201 and
a **nested** `Location`. `GET /projects/:projectId/tasks/:id` matches on both
halves, so a real task read through the wrong parent is a 404.

```
uv run dojo test node d23_rest_patterns ex5
```

## Problem 6 — the retry that must not charge twice

Edit `ex6/solution.ts`. `createApp()` serves `POST /payments` (`{ amount }`) and
`GET /payments`. A request carrying `Idempotency-Key` is executed once: a replay
with the same key **and the same body** returns the original status and body
with `Idempotency-Replayed: true` and creates nothing. The same key with a
different body is 409 `{ error: "idempotency_key_reuse" }`. Different keys are
different payments, and no key at all means no de-duplication.

```
uv run dojo test node d23_rest_patterns ex6
```

## Problem 7 — all of it or none of it

Edit `ex7/solution.ts`. `createApp()` serves `POST /tasks/bulk` with
`{ operations: [...] }` — `{ op: "create", title }`, `{ op: "update", id, title }`,
`{ op: "delete", id }` — over tasks `t-1` and `t-2`. Every operation is checked
**before any is applied**, walking the batch as if it were running. Success is
200 `{ results }` in request order. A failure is 422
`{ error: "bulk_failed", index, reason }` with the store untouched.

```
uv run dojo test node d23_rest_patterns ex7
```

## Problem 8 — the whole small service

Edit `ex8/solution.ts`. `createApp(deps)` — `deps.seed` overriding the built-in
tasks — assembles it: `GET /tasks` with cursor pagination *and* `?fields=`,
`POST /tasks` (201 + `Location`), `GET /tasks/:id`, `PATCH /tasks/:id`,
`PATCH /tasks/:id/subtasks/:subtaskId`, `DELETE /tasks/:id`. Every failure is
`application/problem+json`, and one business rule: moving a task to `done` while
a subtask is still open is a 409 with type
`https://example.com/probs/open-subtasks`.

```
uv run dojo test node d23_rest_patterns ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d23_rest_patterns. Quoted verbatim in README.md.
//
// Every test builds a fresh app from the learner's factory and drives it with
// supertest, which binds a port the OS chooses - no fixed ports, and no state
// carried from one test to the next. Nothing here sleeps or reads a clock.
import request from "supertest";
import { describe, expect, test } from "vitest";

import { createApp as createVerbs } from "./ex1/solution";
import { createApp as createSparse } from "./ex2/solution";
import { createApp as createProblems } from "./ex3/solution";
import { createApp as createPages } from "./ex4/solution";
import { createApp as createNested } from "./ex5/solution";
import { createApp as createPayments } from "./ex6/solution";
import { createApp as createBulk } from "./ex7/solution";
import { createApp as createService } from "./ex8/solution";

describe("d23_rest_patterns", () => {
  test("ex1 - each write verb owes the client a different answer", async () => {
    const app = createVerbs();

    const created = await request(app)
      .post("/tasks")
      .set("content-type", "application/json")
      .send({ title: "Ship the drills" });
    expect(created.status, "a POST to a collection creates and answers 201").toBe(201);
    expect(
      created.headers.location,
      "with a Location header pointing at what was made - the server chose the " +
        "id, so this is the only way the client can learn it",
    ).toBe("/tasks/task-1");
    expect(created.body, "and the created resource comes back").toEqual({
      id: "task-1",
      title: "Ship the drills",
      done: false,
    });

    const put = await request(app)
      .put("/tasks/custom-9")
      .set("content-type", "application/json")
      .send({ title: "Made by PUT", done: true });
    expect(
      put.status,
      "PUT names the resource itself, so a PUT to an id nobody is using CREATES " +
        "it - and a creation is a 201 whichever verb caused it",
    ).toBe(201);
    expect(put.headers.location, "with the same Location promise as a POST").toBe(
      "/tasks/custom-9",
    );
    expect(put.body, "at the id the client picked").toEqual({
      id: "custom-9",
      title: "Made by PUT",
      done: true,
    });

    const replaced = await request(app)
      .put("/tasks/custom-9")
      .set("content-type", "application/json")
      .send({ title: "Replaced" });
    expect(
      replaced.status,
      "the second PUT to the same id replaces rather than creates, so it is a " +
        "200 - nothing new came into existence",
    ).toBe(200);
    expect(
      replaced.body,
      "and REPLACE means replace: done was true and the new representation does " +
        "not mention it, so it goes back to its default. A PUT that merges is a " +
        "PATCH wearing the wrong verb",
    ).toEqual({ id: "custom-9", title: "Replaced", done: false });

    const patched = await request(app)
      .patch("/tasks/custom-9")
      .set("content-type", "application/json")
      .send({ done: true });
    expect(patched.status, "a PATCH of something that exists is a 200").toBe(200);
    expect(
      patched.body,
      "and PATCH really is partial - the title it never mentioned survives",
    ).toEqual({ id: "custom-9", title: "Replaced", done: true });

    const patchMissing = await request(app)
      .patch("/tasks/nope")
      .set("content-type", "application/json")
      .send({ done: true });
    expect(
      patchMissing.status,
      "PATCH has nothing to be partial ABOUT when the resource is missing: 404, " +
        "and never a quiet create",
    ).toBe(404);

    const removed = await request(app).delete("/tasks/task-1");
    expect(removed.status, "a successful delete is 204").toBe(204);
    expect(removed.text, "which means there is no body at all").toBeFalsy();

    const removedAgain = await request(app).delete("/tasks/task-1");
    expect(
      removedAgain.status,
      "and the second delete is a 404. DELETE is idempotent in its EFFECT - the " +
        "resource is gone either way - but the status still reports what this " +
        "request actually did",
    ).toBe(404);

    const list = await request(app).get("/tasks");
    expect(
      list.body.map((task: { id: string }) => task.id),
      "the seeded task and the one PUT created, and nothing the failed PATCH " +
        "left behind",
    ).toEqual(["seed-1", "custom-9"]);
  });

  test("ex2 - the client asks for the fields it is going to use", async () => {
    const app = createSparse();

    const whole = await request(app).get("/tasks/seed-1");
    expect(whole.status, "no fields parameter is not an empty resource").toBe(200);
    expect(whole.body, "it is the whole thing").toEqual({
      id: "seed-1",
      title: "write the spec",
      done: false,
      owner: "ada",
      createdAt: "2026-01-05T09:00:00.000Z",
    });

    const sparse = await request(app).get("/tasks/seed-1?fields=title,owner");
    expect(
      sparse.body,
      "two fields asked for, three delivered: id comes whether or not it was " +
        "requested, because a resource the client cannot identify is not worth " +
        "sending",
    ).toEqual({ id: "seed-1", title: "write the spec", owner: "ada" });

    const withId = await request(app).get("/tasks/seed-1?fields=id,title");
    expect(withId.body, "asking for id explicitly does not duplicate it").toEqual({
      id: "seed-1",
      title: "write the spec",
    });

    const empty = await request(app).get("/tasks/seed-1?fields=");
    expect(
      Object.keys(empty.body).sort(),
      "an empty fields parameter is the same as not sending one - the " +
        "alternative is a 200 carrying nothing but an id, which no client asked " +
        "for",
    ).toEqual(["createdAt", "done", "id", "owner", "title"]);

    const unknown = await request(app).get("/tasks/seed-1?fields=title,colour");
    expect(
      unknown.status,
      "a field that does not exist is a 400. Silently ignoring it means the " +
        "client waits forever for a key that is never coming",
    ).toBe(400);
    expect(unknown.body, "and the answer names the one it could not serve").toEqual({
      error: "unknown_field",
      field: "colour",
    });

    const collection = await request(app).get("/tasks?fields=title");
    expect(
      collection.body.items,
      "the same parameter applies to a collection, item by item",
    ).toEqual([
      { id: "seed-1", title: "write the spec" },
      { id: "seed-2", title: "review the pull request" },
    ]);
  });

  test("ex3 - one error shape, and nothing leaking through it", async () => {
    const logged: unknown[] = [];
    const app = createProblems((error) => logged.push(error));

    const missing = await request(app).get("/tasks/nope");
    expect(missing.status, "an unknown task is a 404").toBe(404);
    expect(
      missing.headers["content-type"],
      "and it is application/problem+json, not application/json. The media type " +
        "is how a client knows the body follows RFC 9457 rather than being " +
        "whatever this API felt like",
    ).toContain("application/problem+json");
    expect(missing.body, "with all five members").toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "no task with id nope",
      instance: "/tasks/nope",
    });

    const bad = await request(app).get("/tasks?status=elephant");
    expect(bad.status, "an unusable query parameter is a 400").toBe(400);
    expect(bad.body.title, "the title is the human-readable summary of the TYPE").toBe(
      "Bad Request",
    );
    expect(
      bad.body.detail,
      "and the detail is about THIS request, which is what makes it worth " +
        "reading",
    ).toBe("status must be one of open, done");

    const conflict = await request(app).post("/tasks/seed-1/archive");
    expect(conflict.status, "archiving something already archived is a 409").toBe(409);
    expect(
      conflict.body.type,
      "and here the type is a real URI rather than about:blank. That field is " +
        "the machine-readable identity of the problem: a client switches on it, " +
        "and it survives the day somebody rewords the title",
    ).toBe("https://example.com/probs/already-archived");
    expect(conflict.body.instance, "the instance is the path this happened at").toBe(
      "/tasks/seed-1/archive",
    );

    const boom = await request(app).get("/boom");
    expect(boom.status, "an unexpected failure is a 500").toBe(500);
    expect(
      boom.headers["content-type"],
      "in the same media type as every other failure",
    ).toContain("application/problem+json");
    expect(
      boom.body,
      "and it says nothing. The thrown error carries a connection string, and " +
        "an API that repeats a thrown message back to the client has just " +
        "published a credential",
    ).toEqual({
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      detail: "an unexpected error occurred",
      instance: "/boom",
    });
    expect(
      JSON.stringify(boom.body).includes("hunter2"),
      "specifically, this must not be in the response",
    ).toBe(false);
    expect(
      logged.length,
      "...but it MUST reach the log with the real error, or nobody will ever " +
        "fix it",
    ).toBe(1);
    expect(
      (logged[0] as Error).message,
      "and the log gets the whole thing, credential and all - that is what a " +
        "log is for",
    ).toContain("hunter2");
  });

  test("ex4 - pages that survive the list changing underneath them", async () => {
    const app = createPages();

    const first = await request(app).get("/tasks?limit=2");
    expect(first.status, "a first page needs no cursor").toBe(200);
    expect(
      first.body.items.map((task: { id: string }) => task.id),
      "the first two, in id order",
    ).toEqual(["t-1", "t-2"]);

    const cursor = first.body.nextCursor;
    expect(typeof cursor, "the cursor is a string").toBe("string");
    expect(
      cursor.includes("t-2"),
      "and it is OPAQUE. A cursor the client can read is a cursor the client " +
        "will construct, and then you can never change what it means",
    ).toBe(false);
    expect(
      /^[A-Za-z0-9_-]+$/.test(cursor),
      "base64url, so it survives being pasted into a query string without " +
        "escaping - no plus, no slash, no equals",
    ).toBe(true);

    const second = await request(app).get(`/tasks?limit=2&cursor=${cursor}`);
    expect(
      second.body.items.map((task: { id: string }) => task.id),
      "the next two: no overlap with the first page and no gap after it. " +
        "Offsets cannot promise that - insert a row and page 2 repeats an item " +
        "page 1 already showed",
    ).toEqual(["t-3", "t-4"]);

    const third = await request(app).get(`/tasks?limit=2&cursor=${second.body.nextCursor}`);
    expect(third.body.items.map((task: { id: string }) => task.id), "the short last page").toEqual([
      "t-5",
    ]);
    expect(
      third.body.nextCursor,
      "and a null cursor is how the client knows to stop. An absent key would " +
        "mean the same thing to a human and something else entirely to JSON.parse",
    ).toBeNull();

    const capped = await request(app).get("/tasks?limit=99");
    expect(
      capped.body.items.length,
      "the limit is capped rather than obeyed: one client asking for everything " +
        "must not be able to ask for everything",
    ).toBe(3);

    const corrupt = await request(app).get("/tasks?cursor=bm90LWEtY3Vyc29y");
    expect(
      corrupt.status,
      "a cursor that decodes to nothing this collection knows about is a 400 - " +
        "not an empty page, and not the first page again",
    ).toBe(400);
    expect(corrupt.body, "with a code the client can act on").toEqual({
      error: "invalid_cursor",
    });
  });

  test("ex5 - a task belongs to its project and to nothing else", async () => {
    const app = createNested();

    const listed = await request(app).get("/projects/p-1/tasks");
    expect(listed.status, "the parent exists, so the collection does").toBe(200);
    expect(listed.body, "and it holds only that parent tasks").toEqual({
      items: [{ id: "t-1", projectId: "p-1", title: "draw the wireframes" }],
      total: 1,
    });

    const orphan = await request(app).get("/projects/nope/tasks");
    expect(
      orphan.status,
      "a collection under a parent that does not exist is a 404, not an empty " +
        "list. An empty list says the project is real and has no tasks, which " +
        "is a different fact",
    ).toBe(404);
    expect(orphan.body, "and it says which half was missing").toEqual({
      error: "project_not_found",
    });

    const created = await request(app)
      .post("/projects/p-2/tasks")
      .set("content-type", "application/json")
      .send({ title: "pick a push provider" });
    expect(created.status, "creating under a parent is a 201").toBe(201);
    expect(
      created.headers.location,
      "and the Location is the NESTED url - the path the resource actually " +
        "lives at, not a bare /tasks/task-1 that loses the parent",
    ).toBe("/projects/p-2/tasks/task-1");
    expect(created.body, "the new task knows its parent").toEqual({
      id: "task-1",
      projectId: "p-2",
      title: "pick a push provider",
    });

    const inParent = await request(app).get("/projects/p-2/tasks");
    expect(
      inParent.body.items.map((task: { id: string }) => task.id),
      "it appears under the project it was created in",
    ).toEqual(["t-2", "task-1"]);

    const inSibling = await request(app).get("/projects/p-1/tasks");
    expect(
      inSibling.body.total,
      "...and nowhere else. A nested route that ignores the parent and filters " +
        "nothing is the bug that shows one customer another customer data",
    ).toBe(1);

    const wrongParent = await request(app).get("/projects/p-1/tasks/task-1");
    expect(
      wrongParent.status,
      "and reading a real task through the wrong parent is a 404. The id " +
        "existing somewhere is not authorisation to serve it here",
    ).toBe(404);

    const createdOrphan = await request(app)
      .post("/projects/nope/tasks")
      .set("content-type", "application/json")
      .send({ title: "into the void" });
    expect(createdOrphan.status, "and you cannot create under a parent that is not there").toBe(
      404,
    );
  });

  test("ex6 - the same request twice, on purpose, over a bad connection", async () => {
    const app = createPayments();

    const first = await request(app)
      .post("/payments")
      .set("content-type", "application/json")
      .set("idempotency-key", "key-1")
      .send({ amount: 100 });
    expect(first.status, "the first request with a key is an ordinary create").toBe(201);
    expect(first.body, "and it does the work").toEqual({ id: "pay-1", amount: 100 });
    expect(
      first.headers["idempotency-replayed"],
      "nothing was replayed, so the header is not there",
    ).toBeUndefined();

    const replay = await request(app)
      .post("/payments")
      .set("content-type", "application/json")
      .set("idempotency-key", "key-1")
      .send({ amount: 100 });
    expect(
      replay.status,
      "the retry after a timeout returns the ORIGINAL status - not a 200, and " +
        "certainly not another 201 for another payment",
    ).toBe(201);
    expect(replay.body, "with the original body, byte for byte").toEqual({
      id: "pay-1",
      amount: 100,
    });
    expect(
      replay.headers["idempotency-replayed"],
      "and it says so, which is what lets a client tell a retry that worked " +
        "from a retry that charged twice",
    ).toBe("true");

    const afterReplay = await request(app).get("/payments");
    expect(
      afterReplay.body.length,
      "one key, one payment, however many times the request arrived",
    ).toBe(1);

    const reused = await request(app)
      .post("/payments")
      .set("content-type", "application/json")
      .set("idempotency-key", "key-1")
      .send({ amount: 250 });
    expect(
      reused.status,
      "the same key with a DIFFERENT body is a 409. Replaying the old answer " +
        "would tell the client its 250 succeeded when it was never attempted",
    ).toBe(409);
    expect(reused.body, "with a code that names the problem").toEqual({
      error: "idempotency_key_reuse",
    });

    const other = await request(app)
      .post("/payments")
      .set("content-type", "application/json")
      .set("idempotency-key", "key-2")
      .send({ amount: 250 });
    expect(other.status, "a different key is a different payment").toBe(201);
    expect(other.body.id, "with its own id").toBe("pay-2");

    await request(app)
      .post("/payments")
      .set("content-type", "application/json")
      .send({ amount: 7 });
    await request(app)
      .post("/payments")
      .set("content-type", "application/json")
      .send({ amount: 7 });
    const all = await request(app).get("/payments");
    expect(
      all.body.length,
      "and with no key at all there is nothing to de-duplicate on, so two " +
        "identical requests are two payments - the guarantee is the client " +
        "responsibility to ask for",
    ).toBe(4);
  });

  test("ex7 - all of it or none of it", async () => {
    const app = createBulk();

    const ok = await request(app)
      .post("/tasks/bulk")
      .set("content-type", "application/json")
      .send({
        operations: [
          { op: "create", title: "write the migration" },
          { op: "update", id: "t-1", title: "renamed" },
          { op: "delete", id: "t-2" },
        ],
      });
    expect(ok.status, "a batch that works through is a 200").toBe(200);
    expect(
      ok.body,
      "with one result per operation, in the order they were sent - a client " +
        "matches them up by position, so reordering them is a silent disaster",
    ).toEqual({
      results: [
        { op: "create", id: "task-1" },
        { op: "update", id: "t-1" },
        { op: "delete", id: "t-2" },
      ],
    });

    const after = await request(app).get("/tasks");
    expect(
      after.body.map((task: { id: string; title: string }) => `${task.id}:${task.title}`),
      "and all three really happened",
    ).toEqual(["t-1:renamed", "task-1:write the migration"]);

    const failing = createBulk();
    const rejected = await request(failing)
      .post("/tasks/bulk")
      .set("content-type", "application/json")
      .send({
        operations: [
          { op: "create", title: "this must not survive" },
          { op: "delete", id: "nope" },
        ],
      });
    expect(rejected.status, "one bad operation fails the batch with a 422").toBe(422);
    expect(
      rejected.body,
      "naming the INDEX, because every other identifier in the batch is " +
        "ambiguous, plus a reason a human can act on",
    ).toEqual({ error: "bulk_failed", index: 1, reason: "no such task: nope" });

    const untouched = await request(failing).get("/tasks");
    expect(
      untouched.body.map((task: { id: string }) => task.id),
      "and the store is exactly as it was. The create in front of the failure " +
        "must not have happened - check everything first, then apply, or a " +
        "half-applied batch leaves the client with no idea what is true",
    ).toEqual(["t-1", "t-2"]);

    const unknownOp = await request(createBulk())
      .post("/tasks/bulk")
      .set("content-type", "application/json")
      .send({ operations: [{ op: "explode", id: "t-1" }] });
    expect(unknownOp.status, "an operation nobody implements is a 422 too").toBe(422);
    expect(unknownOp.body, "at its index").toEqual({
      error: "bulk_failed",
      index: 0,
      reason: "unknown operation: explode",
    });

    const twice = await request(createBulk())
      .post("/tasks/bulk")
      .set("content-type", "application/json")
      .send({ operations: [{ op: "delete", id: "t-1" }, { op: "delete", id: "t-1" }] });
    expect(
      twice.status,
      "the check has to walk the batch as if it were running: after the first " +
        "delete, t-1 is gone, so the second one cannot succeed either. Checking " +
        "every operation against the ORIGINAL store passes both and then fails " +
        "half way through applying them",
    ).toBe(422);
    expect(twice.body.index, "and it is the second one that is wrong").toBe(1);
  });

  test("ex8 - the whole small service, end to end", async () => {
    const app = createService({
      seed: [
        { id: "t-1", title: "write the drills", status: "open", subtasks: [{ id: "s-1", title: "draft ex1", done: false }] },
        { id: "t-2", title: "review", status: "open", subtasks: [] },
        { id: "t-3", title: "ship", status: "open", subtasks: [] },
      ],
    });

    const page = await request(app).get("/tasks?limit=2&fields=id,title");
    expect(page.status, "the collection pages and trims at the same time").toBe(200);
    expect(
      page.body.items,
      "two items, each carrying only what was asked for plus the id",
    ).toEqual([
      { id: "t-1", title: "write the drills" },
      { id: "t-2", title: "review" },
    ]);
    expect(typeof page.body.nextCursor, "with a cursor for the rest").toBe("string");

    const created = await request(app)
      .post("/tasks")
      .set("content-type", "application/json")
      .send({ title: "write the report" });
    expect(created.status, "a create is a 201").toBe(201);

    const readBack = await request(app).get(created.headers.location);
    expect(
      readBack.status,
      "and the Location header is a promise: the url it gives you works",
    ).toBe(200);
    expect(readBack.body, "with everything the resource has").toEqual({
      id: "task-1",
      title: "write the report",
      status: "open",
      subtasks: [],
    });

    const blocked = await request(app)
      .patch("/tasks/t-1")
      .set("content-type", "application/json")
      .send({ status: "done" });
    expect(
      blocked.status,
      "a rule about the data is a 409, not a 400 - the request was perfectly " +
        "well formed and the state of the world is what refused it",
    ).toBe(409);
    expect(
      blocked.headers["content-type"],
      "and business-rule failures use the same problem media type as everything " +
        "else",
    ).toContain("application/problem+json");
    expect(
      blocked.body.type,
      "with a type the client can branch on rather than a message it has to " +
        "match with a regular expression",
    ).toBe("https://example.com/probs/open-subtasks");

    const closedSub = await request(app)
      .patch("/tasks/t-1/subtasks/s-1")
      .set("content-type", "application/json")
      .send({ done: true });
    expect(closedSub.status, "closing the subtask is allowed").toBe(200);

    const finished = await request(app)
      .patch("/tasks/t-1")
      .set("content-type", "application/json")
      .send({ status: "done" });
    expect(
      finished.status,
      "and with nothing open underneath it, the same request now succeeds",
    ).toBe(200);
    expect(finished.body.status, "the task is done").toBe("done");

    const removed = await request(app).delete("/tasks/t-1");
    expect(removed.status, "delete is still a 204").toBe(204);

    const gone = await request(app).get("/tasks/t-1");
    expect(gone.status, "and then it is really gone").toBe(404);
    expect(gone.body, "reported in the one error shape this service has").toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "no task with id t-1",
      instance: "/tasks/t-1",
    });
  });
});
```

In plain English:

- **ex1** creates by POST and by PUT, replaces, patches, deletes twice, and
  checks a PUT that omits a field does not preserve it.
- **ex2** asks for the whole resource, two fields, `id` explicitly, nothing, and
  a field that does not exist — then the same parameter on a collection.
- **ex3** triggers a 404, a 400, a 409 with its own type and a 500, and checks
  the credential in the thrown message reached the log and not the client.
- **ex4** walks three pages, checks the cursor is opaque base64url, caps a
  greedy limit and rejects a cursor that names nothing.
- **ex5** lists under a real parent and a missing one, creates, and reads a real
  task through the wrong parent.
- **ex6** sends a payment, replays it, reuses the key with a different body,
  uses a second key, and sends two identical requests with no key at all.
- **ex7** applies a three-operation batch, fails one at index 1 and checks
  nothing was applied, then an unknown op, then two deletes of the same id.
- **ex8** pages with sparse fields, creates and reads back through `Location`,
  is refused a `done` by an open subtask, closes it, succeeds, and deletes.

Next: **d24_mixed_gauntlet**, where every problem needs two or three of these at
once.
