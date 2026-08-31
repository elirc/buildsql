// Gate for node/d24_mixed_gauntlet. Quoted verbatim in README.md.
//
// The last set in the track, and the only one where every problem needs two or
// three parts of it at once. The rules do not change: work that has to be
// counted is held open by the gate and released by hand, anything timed takes
// an injected clock, streams live in memory, HTTP is driven through supertest
// with no fixed port, and anything that touches the disk gets its own directory
// under the OS temp dir and gives it back.
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { EventEmitter } from "node:events";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { loadConfig } from "./ex1/solution";
import { retryingLimitedMap } from "./ex2/solution";
import { tailLines } from "./ex3/solution";
import { StageFailure, runNamedPipeline } from "./ex4/solution";
import { createValidatingStage } from "./ex5/solution";
import { createApp as createUploads } from "./ex6/solution";
import { CircuitOpenError, createResilientClient } from "./ex7/solution";
import { createApp as createGateway } from "./ex8/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "dojo-d24-"));
  try {
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** An object-mode sink that keeps everything it was given. */
function sink(): { stream: Writable; items: unknown[] } {
  const items: unknown[] = [];
  const stream = new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      items.push(chunk);
      callback();
    },
  });
  return { stream, items };
}

/** Units of work the gate starts by name, counts, and settles by call number. */
function callDesk<T = string>() {
  const started: string[] = [];
  const settlers: ((outcome: { ok: boolean; value?: T; error?: unknown }) => void)[] = [];
  let active = 0;
  let maxActive = 0;

  const start = (name: string): Promise<T> => {
    started.push(name);
    active += 1;
    maxActive = Math.max(maxActive, active);
    return new Promise<T>((resolve, reject) => {
      settlers.push((outcome) => {
        active -= 1;
        if (outcome.ok) resolve(outcome.value as T);
        else reject(outcome.error);
      });
    });
  };

  return {
    start,
    started,
    maxActive: () => maxActive,
    finish: (index: number, value: T) => settlers[index]({ ok: true, value }),
    fail: (index: number, error: unknown) => settlers[index]({ ok: false, error }),
  };
}

describe("d24_mixed_gauntlet", () => {
  test("ex1 - loadConfig() layers two files and hands back something nobody can edit", async () => {
    await withTempDir(async (dir) => {
      await writeFile(
        path.join(dir, "config.json"),
        JSON.stringify({
          service: "orders",
          server: { host: "localhost", port: 3000, tls: false },
          regions: ["eu-west", "us-east"],
        }),
        "utf8",
      );
      await writeFile(
        path.join(dir, "config.prod.json"),
        JSON.stringify({ server: { host: "orders.internal", tls: true }, regions: ["eu-west"] }),
        "utf8",
      );

      const base = await loadConfig(dir);
      expect(
        base.server,
        "with no env asked for, the overlay is not even looked at",
      ).toEqual({ host: "localhost", port: 3000, tls: false });

      const prod = await loadConfig(dir, { env: "prod" });
      expect(
        prod.server,
        "objects merge KEY BY KEY, all the way down: prod says nothing about " +
          "port, so port survives. A shallow spread would have replaced the " +
          "whole server object and taken the port with it",
      ).toEqual({ host: "orders.internal", port: 3000, tls: true });
      expect(
        prod.regions,
        "an array is a value, not a thing to merge - the overlay replaces it " +
          "outright, because merging arrays leaves nobody able to remove an entry",
      ).toEqual(["eu-west"]);
      expect(prod.service, "keys the overlay never mentions come through").toBe("orders");

      expect(Object.isFrozen(prod), "the config is frozen").toBe(true);
      expect(
        Object.isFrozen(prod.server as object),
        "and frozen all the way down. A shallow freeze protects the top level " +
          "and lets any module in the process rewrite config.server.host at " +
          "runtime, which is a bug you will debug for a day",
      ).toBe(true);

      const missingEnv = await loadConfig(dir, { env: "staging" });
      expect(
        missingEnv.server,
        "an env with no file of its own is the base config, not an error - " +
          "that is what makes the overlay optional",
      ).toEqual({ host: "localhost", port: 3000, tls: false });
    });

    await withTempDir(async (dir) => {
      await expect(
        loadConfig(dir),
        "the base config is required, and the message says which file was not " +
          "there",
      ).rejects.toThrow("config.json");

      await writeFile(path.join(dir, "config.json"), "{}", "utf8");
      await writeFile(path.join(dir, "config.prod.json"), "{ not json", "utf8");
      await expect(
        loadConfig(dir, { env: "prod" }),
        "and a file that will not parse names ITSELF, or whoever is on call " +
          "gets a SyntaxError about position 2 and four candidate files",
      ).rejects.toThrow("config.prod.json");
    });
  });

  test("ex2 - retryingLimitedMap() retries inside the slot it already holds", async () => {
    const desk = callDesk();
    const sleeps: number[] = [];
    const promise = retryingLimitedMap(["a", "b", "c", "d"], (item: string) => desk.start(item), {
      limit: 2,
      retries: 1,
      delayFor: (attempt: number) => attempt * 100,
      sleep: async (ms: number) => {
        sleeps.push(ms);
      },
    });
    promise.catch(() => {});
    await settle();

    expect(desk.started, "two items in flight, as the limit says").toEqual(["a", "b"]);

    desk.fail(0, new Error("a flaked"));
    await settle();
    expect(
      desk.started,
      "a is retried and c is NOT started. A retry belongs to the slot the item " +
        "already holds - if it went back into the queue you would have limit + " +
        "retries in flight, which is how a retry storm takes down the thing it " +
        "was retrying",
    ).toEqual(["a", "b", "a"]);
    expect(
      sleeps,
      "and it waited first, on the injected sleep, for delayFor(1)",
    ).toEqual([100]);

    desk.finish(1, "B");
    await settle();
    expect(desk.started, "b finishing frees a slot, so c starts").toEqual(["a", "b", "a", "c"]);

    desk.finish(2, "A");
    await settle();
    expect(desk.started, "and the successful retry frees its slot for d").toEqual([
      "a",
      "b",
      "a",
      "c",
      "d",
    ]);

    desk.finish(3, "C");
    desk.finish(4, "D");
    expect(
      await promise,
      "results are in INPUT order, whatever order the work landed in",
    ).toEqual(["A", "B", "C", "D"]);
    expect(desk.maxActive(), "and the limit held throughout").toBeLessThanOrEqual(2);

    const doomed = callDesk();
    const delays: number[] = [];
    const exhausted = retryingLimitedMap(["x"], (item: string) => doomed.start(item), {
      limit: 2,
      retries: 2,
      delayFor: (attempt: number) => attempt * 100,
      sleep: async (ms: number) => {
        delays.push(ms);
      },
    });
    exhausted.catch(() => {});
    await settle();
    doomed.fail(0, new Error("boom 1"));
    await settle();
    doomed.fail(1, new Error("boom 2"));
    await settle();
    doomed.fail(2, new Error("boom 3"));

    await expect(
      exhausted,
      "retries: 2 means three attempts in total, and the failure that reaches " +
        "the caller is the LAST one, not the first",
    ).rejects.toThrow("boom 3");
    expect(doomed.started, "three attempts, no more").toEqual(["x", "x", "x"]);
    expect(
      delays,
      "with a growing wait between them and none after the last attempt - " +
        "sleeping after the final failure is time nobody is waiting for",
    ).toEqual([100, 200]);

    const stopping = callDesk();
    const stopped = retryingLimitedMap(
      ["x", "y", "z", "w"],
      (item: string) => stopping.start(item),
      { limit: 2, retries: 0, delayFor: () => 0, sleep: async () => {} },
    );
    stopped.catch(() => {});
    await settle();
    stopping.fail(0, new Error("x is broken"));
    await expect(stopped, "an item out of attempts fails the whole call").rejects.toThrow(
      "x is broken",
    );
    stopping.finish(1, "Y");
    await settle();
    expect(
      stopping.started,
      "and nothing further is started afterwards - z and w never run",
    ).toEqual(["x", "y"]);
  });

  test("ex3 - tailLines() reads the end of the file and not the whole of it", async () => {
    await withTempDir(async (dir) => {
      const file = path.join(dir, "app.log");
      await writeFile(file, "one\ntwo\nthree\nfour\nfive\n", "utf8");

      expect(
        await tailLines(file, 2),
        "the last two lines, in file order, with no newline characters left on " +
          "them",
      ).toEqual(["four", "five"]);

      expect(
        await tailLines(file, 99),
        "asking for more lines than the file has is not an error - you get all " +
          "of them",
      ).toEqual(["one", "two", "three", "four", "five"]);

      expect(await tailLines(file, 0), "and zero lines is an empty list").toEqual([]);

      const unterminated = path.join(dir, "partial.log");
      await writeFile(unterminated, "alpha\nbeta", "utf8");
      expect(
        await tailLines(unterminated, 1),
        "a file that does not end in a newline still has a last line. A file " +
          "that does must NOT produce an empty one",
      ).toEqual(["beta"]);

      const crlf = path.join(dir, "windows.log");
      await writeFile(crlf, "first\r\nsecond\r\n", "utf8");
      expect(
        await tailLines(crlf, 1),
        "a carriage return belongs to the line ending, not to the line",
      ).toEqual(["second"]);

      const long = path.join(dir, "long.log");
      const wide = "x".repeat(500);
      await writeFile(long, `header\n${wide}\n`, "utf8");
      expect(
        await tailLines(long, 1),
        "one line can be longer than one block, so the walk backwards has to " +
          "keep going until it has found enough newlines - not until it has " +
          "read one block",
      ).toEqual([wide]);

      const wide2 = "→".repeat(100);
      const utf8 = path.join(dir, "utf8.log");
      await writeFile(utf8, `first\n${wide2}\nlast\n`, "utf8");
      expect(
        await tailLines(utf8, 2),
        "each of those arrows is THREE bytes, so a block boundary lands in the " +
          "middle of one. Decode each block as you read it and you get " +
          "replacement characters; keep the Buffers and decode once at the end " +
          "and you get the text back",
      ).toEqual([wide2, "last"]);

      const empty = path.join(dir, "empty.log");
      await writeFile(empty, "", "utf8");
      expect(await tailLines(empty, 3), "an empty file has no lines").toEqual([]);
    });
  });

  test("ex4 - runNamedPipeline() reports progress and names the stage that broke", async () => {
    const emitter = new EventEmitter();
    const progress: number[] = [];
    emitter.on("progress", (event: { done: number }) => progress.push(event.done));

    const out = sink();
    const total = await runNamedPipeline(
      Readable.from([{ id: 1 }, { id: 2 }, { id: 3 }]),
      [
        {
          name: "double",
          stream: new Transform({
            objectMode: true,
            transform(chunk, _encoding, callback) {
              callback(null, { id: (chunk as { id: number }).id * 2 });
            },
          }),
        },
      ],
      out.stream,
      emitter,
    );

    expect(total, "the count of items that reached the sink").toBe(3);
    expect(
      progress,
      "one progress event per item, counting up. A progress report emitted " +
        "from the source tells you what was READ, which on a failing run is a " +
        "number nobody can act on",
    ).toEqual([1, 2, 3]);
    expect(out.items, "and the stage really ran").toEqual([{ id: 2 }, { id: 4 }, { id: 6 }]);

    const failing = new EventEmitter();
    const failures: StageFailure[] = [];
    failing.on("failed", (error: StageFailure) => failures.push(error));

    const doomed = sink();
    const error = await runNamedPipeline(
      Readable.from([{ id: 1 }, { id: 2 }]),
      [
        {
          name: "widen",
          stream: new Transform({
            objectMode: true,
            transform(chunk, _encoding, callback) {
              callback(null, chunk);
            },
          }),
        },
        {
          name: "validate",
          stream: new Transform({
            objectMode: true,
            transform(chunk, _encoding, callback) {
              if ((chunk as { id: number }).id === 2) callback(new Error("bad row"));
              else callback(null, chunk);
            },
          }),
        },
      ],
      doomed.stream,
      failing,
    ).then(
      () => null,
      (thrown: unknown) => thrown as StageFailure,
    );

    expect(error, "a failing stage rejects the call").toBeInstanceOf(StageFailure);
    expect(
      error?.stage,
      "with the NAME of the stage that failed. Stream errors arrive with no " +
        "idea where they came from, and a pipeline of six anonymous transforms " +
        "produces a stack trace pointing at node internals",
    ).toBe("validate");
    expect(
      (error?.cause as Error)?.message,
      "and the original error is kept as the cause rather than being " +
        "flattened into a string",
    ).toBe("bad row");
    expect(failures.length, "the failure is announced exactly once").toBe(1);
    expect(
      doomed.stream.destroyed,
      "and every stream in the chain is torn down, which is what pipeline() " +
        "is for",
    ).toBe(true);
  });

  test("ex5 - createValidatingStage() keeps the good records moving", async () => {
    const schema = z.object({ id: z.number().int(), title: z.string().min(1) });

    const rejected: { index: number; issues: { path: string; message: string }[] }[] = [];
    const out = sink();
    await pipeline(
      Readable.from([
        { id: 1, title: "first", extra: "ignore me" },
        { id: 2, title: "" },
        { id: "3", title: "third" },
        { id: 4, title: "fourth" },
      ]),
      createValidatingStage(schema, {
        onInvalid: (record) => rejected.push({ index: record.index, issues: record.issues }),
      }),
      out.stream,
    );

    expect(
      out.items,
      "the records that passed, as the PARSED value - so the key the schema " +
        "never mentioned is gone by the time the sink sees it",
    ).toEqual([
      { id: 1, title: "first" },
      { id: 4, title: "fourth" },
    ]);
    expect(
      rejected.map((record) => record.index),
      "the bad ones are reported by their position in the INPUT, counting from " +
        "zero - which is the only number that lets somebody find the row in " +
        "the file",
    ).toEqual([1, 2]);
    expect(
      rejected[0].issues,
      "with one issue per failing field, path and message, exactly as zod " +
        "produced it",
    ).toEqual([{ path: "title", message: expect.any(String) }]);
    expect(rejected[1].issues.map((issue) => issue.path), "and for the wrong type too").toEqual([
      "id",
    ]);

    const strict = sink();
    await expect(
      pipeline(
        Readable.from([
          { id: 1, title: "fine" },
          { id: 2, title: "" },
          { id: 3, title: "never reached" },
        ]),
        createValidatingStage(schema, { failFast: true }),
        strict.stream,
      ),
      "with failFast the first bad record fails the stream instead, and the " +
        "message names the record so the run can be resumed",
    ).rejects.toThrow("record 1");
    expect(
      strict.items,
      "the records that made it through before the failure are already gone " +
        "downstream - there is no undo on a stream",
    ).toEqual([{ id: 1, title: "fine" }]);
  });

  test("ex6 - the upload endpoint streams to disk and refuses to be flooded", async () => {
    await withTempDir(async (dir) => {
      let issued = 0;
      const app = createUploads({ dir, limit: 32, nextId: () => `up-${(issued += 1)}` });

      // A NUL, a two-byte character and a high byte: nothing that survives a
      // toString() round trip.
      const payload = Buffer.from([0x00, 0x01, 0xc3, 0xa9, 0x0a, 0xff]);
      const created = await request(app)
        .post("/uploads")
        .set("content-type", "application/octet-stream")
        .send(payload);

      expect(created.status, "a stored upload is a 201").toBe(201);
      expect(
        created.headers.location,
        "with a Location pointing at the resource, and an id the server chose",
      ).toBe("/uploads/up-1");
      expect(created.body, "and the byte count the server actually wrote").toEqual({
        id: "up-1",
        bytes: 6,
      });
      expect(
        await readFile(path.join(dir, "up-1")),
        "the file on disk is the bytes that were sent, byte for byte. Anything " +
          "that decoded the body to a string on the way past would have " +
          "mangled the 0xff",
      ).toEqual(payload);

      const oversize = await request(app)
        .post("/uploads")
        .set("content-type", "application/octet-stream")
        .send(Buffer.alloc(64, 0x41));
      expect(
        oversize.status,
        "past the limit the answer is 413. Checking content-length would be a " +
          "start and not a defence - a chunked request does not have one",
      ).toBe(413);
      expect(oversize.body).toEqual({ error: "payload_too_large" });
      expect(
        (await readdir(dir)).sort(),
        "and the half-written file is cleaned up. A limit that leaves the " +
          "bytes on disk has not limited anything",
      ).toEqual(["up-1"]);

      const found = await request(app).get("/uploads/up-1");
      expect(found.status, "the stored upload can be read back").toBe(200);
      expect(found.body).toEqual({ id: "up-1", bytes: 6 });

      const missing = await request(app).get("/uploads/up-9");
      expect(missing.status, "and an unknown id is a 404").toBe(404);
      expect(missing.body).toEqual({ error: "not_found" });
    });
  });

  test("ex7 - createResilientClient() stops calling a service that is down", async () => {
    const desk = callDesk();
    const now = vi.fn(() => 1_000_000);
    const client = createResilientClient({
      call: (key: string) => desk.start(key),
      failureThreshold: 2,
      cooldownMs: 30_000,
      now,
    });

    const first = client.get("a");
    const second = client.get("a");
    await settle();
    expect(
      desk.started,
      "two callers, one call. While a key is in flight the second caller joins " +
        "it instead of starting a second one",
    ).toEqual(["a"]);

    desk.finish(0, "A");
    expect([await first, await second], "and both get the same answer").toEqual(["A", "A"]);

    const again = client.get("a");
    again.catch(() => {});
    await settle();
    expect(
      desk.started,
      "once it has landed the next caller gets a real call - this is " +
        "de-duplication, not a cache",
    ).toEqual(["a", "a"]);

    desk.fail(1, new Error("upstream down"));
    await expect(again).rejects.toThrow("upstream down");
    expect(client.state(), "one failure is not a pattern").toBe("closed");

    const third = client.get("a");
    third.catch(() => {});
    await settle();
    desk.fail(2, new Error("upstream still down"));
    await expect(third).rejects.toThrow("upstream still down");
    expect(
      client.state(),
      "the second consecutive failure reaches the threshold and opens the " +
        "circuit",
    ).toBe("open");

    await expect(
      client.get("b"),
      "and an open circuit fails immediately, for every key. The point is not " +
        "to fail faster - it is to stop adding load to something that is " +
        "already falling over",
    ).rejects.toBeInstanceOf(CircuitOpenError);
    expect(desk.started.length, "without making the call at all").toBe(3);

    now.mockReturnValue(1_000_000 + 30_000);
    expect(
      client.state(),
      "after the cooldown the circuit is half open: willing to be convinced",
    ).toBe("half-open");

    const probe = client.get("b");
    probe.catch(() => {});
    await settle();
    expect(desk.started, "one probe is allowed through").toEqual(["a", "a", "a", "b"]);
    await expect(
      client.get("c"),
      "and only one. Letting the whole backlog through the moment the cooldown " +
        "expires is how a recovering service is knocked over a second time",
    ).rejects.toBeInstanceOf(CircuitOpenError);

    desk.finish(3, "B");
    expect(await probe, "the probe succeeds").toBe("B");
    expect(client.state(), "so the circuit closes and the failures are forgotten").toBe("closed");

    const after = client.get("c");
    after.catch(() => {});
    await settle();
    expect(desk.started, "and traffic flows again").toEqual(["a", "a", "a", "b", "c"]);
    desk.finish(4, "C");
    expect(await after).toBe("C");
  });

  test("ex8 - the gateway guards, routes, streams and fails in one shape", async () => {
    const orders = [
      { id: "1", item: "keyboard", amount: 80 },
      { id: "2", item: "monitor", amount: 240 },
    ];
    const logged: unknown[] = [];
    const build = (listOrders: () => Promise<typeof orders>) =>
      createGateway({ apiKey: "let-me-in", upstream: { listOrders }, logError: (e) => logged.push(e) });

    const app = build(async () => orders);
    const key = (url: string) => request(app).get(url).set("x-api-key", "let-me-in");

    const denied = await request(app).get("/api/v1/orders");
    expect(denied.status, "no key, no answer").toBe(401);
    expect(
      denied.body,
      "and the refusal is JSON in the same shape as everything else, because " +
        "a client that has to parse two error formats parses neither",
    ).toEqual({ error: "unauthorized" });

    const list = await key("/api/v1/orders");
    expect(list.status, "with the key the router answers").toBe(200);
    expect(list.body, "a collection carries its items and its total").toEqual({
      items: orders,
      total: 2,
    });

    const exported = await key("/api/v1/orders/export");
    expect(
      exported.status,
      "and /orders/export is matched before /orders/:id. Registered the other " +
        "way round, export becomes an order id and the endpoint 404s forever",
    ).toBe(200);
    expect(
      exported.headers["content-type"],
      "an export is newline-delimited JSON, not a JSON array - the point is " +
        "that the client can start reading before the server has finished",
    ).toContain("application/x-ndjson");
    expect(exported.text, "one compact object per line, each ending in a newline").toBe(
      '{"id":"1","item":"keyboard","amount":80}\n{"id":"2","item":"monitor","amount":240}\n',
    );

    const one = await key("/api/v1/orders/2");
    expect(one.body, "the parameterised route still works").toEqual(orders[1]);

    const unknownOrder = await key("/api/v1/orders/99");
    expect(unknownOrder.status, "an unknown id is a 404").toBe(404);
    expect(unknownOrder.body).toEqual({ error: "not_found" });

    const nowhere = await key("/api/v1/nothing");
    expect(nowhere.status, "and so is an unknown route").toBe(404);
    expect(nowhere.body, "in the same shape").toEqual({ error: "not_found" });

    const broken = build(async () => {
      throw new Error("connect ECONNREFUSED 10.0.0.7:5432 as orders_rw");
    });
    const failed = await request(broken)
      .get("/api/v1/orders")
      .set("x-api-key", "let-me-in");
    expect(
      failed.status,
      "an upstream that is down is a 502 and not a 500: the gateway is fine, " +
        "the thing behind it is not. In express 5 the rejected promise reaches " +
        "the error handler on its own",
    ).toBe(502);
    expect(
      failed.body,
      "and the client is told nothing an attacker could use - that message has " +
        "an internal address and a database user in it",
    ).toEqual({ error: "upstream_failed" });
    expect(logged.length, "but it is logged, in full, or nobody ever fixes it").toBe(1);
  });
});
