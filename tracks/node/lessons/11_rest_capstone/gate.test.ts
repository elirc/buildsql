// Gate for node/11_rest_capstone. Quoted verbatim in README.md.
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
