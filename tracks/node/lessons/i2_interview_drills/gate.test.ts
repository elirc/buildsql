// Gate for node/i2_interview_drills. Quoted verbatim in README.md.
//
// Six drills, one long-form challenge and a review variant. Every one of them
// is graded the way an interviewer would check it: behaviour, edge cases, and
// the one detail that separates a working answer from a nearly working one.
import { Readable, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

import { allSettledFromScratch } from "./ex1/solution";
import { mapLimit } from "./ex2/solution";
import { predictOutputs } from "./ex3/solution";
import { run as runSnippets } from "./ex3/snippets";
import { createApp as createLimited } from "./ex4/solution";
import { callbackify, promisify } from "./ex5/solution";
import { createRedactor } from "./ex6/solution";
import { createApp as createArticles } from "./challenge/solution";
import { createBus } from "./review1/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function collect(): { stream: Writable; text(): string } {
  const chunks: Buffer[] = [];
  return {
    stream: new Writable({
      write(chunk: Buffer, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    }),
    text: () => Buffer.concat(chunks).toString("utf8"),
  };
}

describe("i2_interview_drills", () => {
  test("ex1 - allSettledFromScratch() never rejects and never reorders", async () => {
    let active = 0;
    let maxActive = 0;
    const releases: (() => void)[] = [];
    const slow = (value: string) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      return new Promise<string>((resolve) => {
        releases.push(() => {
          active -= 1;
          resolve(value);
        });
      });
    };

    const failing = Promise.reject(new Error("payments down"));
    failing.catch(() => {});

    const promise = allSettledFromScratch<string>([slow("alpha"), failing, slow("gamma")]);
    promise.catch(() => {});

    for (let i = 0; i < 5; i += 1) {
      while (releases.length > 0) releases.shift()?.();
      await settle();
    }

    expect(
      await promise,
      "one record per input, in INPUT order, whatever order they settled in - " +
        "and a rejection is a result, not a failure of the whole thing",
    ).toEqual([
      { status: "fulfilled", value: "alpha" },
      { status: "rejected", reason: new Error("payments down") },
      { status: "fulfilled", value: "gamma" },
    ]);
    expect(
      maxActive,
      "everything must be in flight at once: you were handed promises, so the " +
        "work has already started, and awaiting them one at a time is still " +
        "wrong for the next reader who passes you functions",
    ).toBe(2);

    expect(
      await allSettledFromScratch([]),
      "no inputs means an empty array, resolved immediately - not a hang",
    ).toEqual([]);
  });

  test("ex2 - mapLimit() keeps N in flight and fails fast", async () => {
    const started: number[] = [];
    const releases = new Map<number, () => void>();
    let active = 0;
    let maxActive = 0;

    const worker = (item: number, index: number): Promise<string> => {
      started.push(item);
      active += 1;
      maxActive = Math.max(maxActive, active);
      return new Promise<string>((resolve) => {
        releases.set(item, () => {
          active -= 1;
          resolve(`${item}@${index}`);
        });
      });
    };

    const promise = mapLimit([10, 20, 30, 40], 2, worker);
    promise.catch(() => {});
    await settle();
    expect([...started], "two workers start, no more").toEqual([10, 20]);

    releases.get(10)?.();
    releases.delete(10);
    await settle();
    expect(
      [...started],
      "one finishing frees exactly one slot, immediately - not at the end of a " +
        "batch of two",
    ).toEqual([10, 20, 30]);

    for (let i = 0; i < 8; i += 1) {
      for (const [item, release] of [...releases]) {
        releases.delete(item);
        release();
      }
      await settle();
    }

    expect(
      await promise,
      "results in INPUT order, and the worker is given the index alongside the " +
        "item",
    ).toEqual(["10@0", "20@1", "30@2", "40@3"]);
    expect(maxActive, "never more than the limit").toBeLessThanOrEqual(2);

    const attempted: number[] = [];
    await expect(
      mapLimit([1, 2, 3, 4, 5, 6], 2, async (item: number) => {
        attempted.push(item);
        if (item === 2) throw new Error("worker 2 failed");
        await settle();
        return item;
      }),
      "one worker rejecting rejects the whole call, with that error",
    ).rejects.toThrow("worker 2 failed");
    expect(
      attempted.length,
      "and no further items are started after the failure - six items with a " +
        "limit of 2 should not all have been attempted",
    ).toBeLessThan(6);
  });

  test("ex3 - predictOutputs() answers three of them in a row", async () => {
    const actual = await runSnippets();
    const predicted = predictOutputs();

    expect(
      Array.isArray(predicted) && predicted.length === 3,
      "predictOutputs() returns one array of labels per snippet, in order",
    ).toBe(true);

    for (const [index, expectedRun] of actual.entries()) {
      const mine = predicted[index] ?? [];
      if (mine.length !== expectedRun.length) {
        expect(
          mine.length,
          `snippet ${index + 1}: you predicted ${mine.length} line(s), ` +
            `${expectedRun.length} ran`,
        ).toBe(expectedRun.length);
      }
      const at = expectedRun.findIndex((label, i) => mine[i] !== label);
      expect(
        at,
        `snippet ${index + 1}: the first ${at} line(s) are right, then ` +
          `position ${at} diverges (you predicted "${mine[at]}")`,
      ).toBe(-1);
    }
  });

  test("ex4 - the token bucket refills over time and caps at capacity", async () => {
    const clock = vi.fn(() => 1_000_000);
    const app = createLimited({ capacity: 2, refillPerSecond: 1, now: clock });

    const first = await request(app).get("/ping");
    expect(first.status, "the bucket starts full: this one is free").toBe(200);
    expect(
      first.headers["x-ratelimit-remaining"],
      "one token left after spending one of two",
    ).toBe("1");

    expect((await request(app).get("/ping")).status, "and the second").toBe(200);

    const empty = await request(app).get("/ping");
    expect(empty.status, "the bucket is empty: 429").toBe(429);
    expect(empty.body).toEqual({ error: "too many requests" });
    expect(
      empty.headers["retry-after"],
      "at one token per second, the next token is one second away",
    ).toBe("1");

    clock.mockReturnValue(1_000_000 + 1_000);
    expect(
      (await request(app).get("/ping")).status,
      "a second later one token has dripped back in",
    ).toBe(200);

    clock.mockReturnValue(1_000_000 + 60_000);
    const afterAMinute = await request(app).get("/ping");
    expect(
      afterAMinute.headers["x-ratelimit-remaining"],
      "sixty seconds would be sixty tokens, but the bucket only holds two - " +
        "so after spending one, one is left. Uncapped refill is the bug that " +
        "turns a rate limiter into a rate suggestion",
    ).toBe("1");
  });

  test("ex5 - promisify() and callbackify() are inverses, and both stay async", async () => {
    const lookup = (
      key: string,
      callback: (error: Error | null, value?: string) => void,
    ): void => {
      setTimeout(() => {
        if (key === "missing") callback(new Error("no such key"));
        else callback(null, `value:${key}`);
      }, 0);
    };

    const asPromise = promisify(lookup);
    await expect(asPromise("region"), "the value resolves").resolves.toBe("value:region");
    await expect(
      asPromise("missing"),
      "the error rejects, unchanged",
    ).rejects.toThrow("no such key");

    const asyncLookup = async (key: string): Promise<string> => {
      if (key === "missing") throw new Error("no such key");
      return `value:${key}`;
    };
    const asCallback = callbackify(asyncLookup);

    const calls: Array<[Error | null, string | undefined]> = [];
    asCallback("region", (error, value) => calls.push([error, value]));
    expect(
      calls.length,
      "callbackify must NOT call back synchronously, even though the async " +
        "function resolved immediately - a sometimes-sync API is the bug that " +
        "only shows up on one branch (README ex5)",
    ).toBe(0);

    await settle();
    expect(calls[0], "success is (null, value)").toEqual([null, "value:region"]);

    const failures: Array<Error | null> = [];
    asCallback("missing", (error) => failures.push(error));
    await settle();
    expect(failures[0], "failure is (error) - error first").toBeInstanceOf(Error);
    expect(failures[0]?.message).toBe("no such key");
  });

  test("ex6 - createRedactor() finds the secret even when it is split", async () => {
    const straight = collect();
    await pipeline(
      Readable.from(["the token is super-secret ok"]),
      createRedactor("super-secret"),
      straight.stream,
    );
    expect(
      straight.text(),
      "the easy case: one chunk, one match",
    ).toBe("the token is [REDACTED] ok");

    const split = collect();
    await pipeline(
      Readable.from(["the token is sup", "er-sec", "ret ok"]),
      createRedactor("super-secret"),
      split.stream,
    );
    expect(
      split.text(),
      "the secret is spread over three chunks and must still be caught. Hold " +
        "back the last (secret.length - 1) characters until you know they are " +
        "not the start of a match",
    ).toBe("the token is [REDACTED] ok");

    const twice = collect();
    await pipeline(
      Readable.from(["a super-secret and another super-sec", "ret"]),
      createRedactor("super-secret"),
      twice.stream,
    );
    expect(
      twice.text(),
      "every occurrence, including one that ends exactly at the end of the " +
        "input - which is what flush is for",
    ).toBe("a [REDACTED] and another [REDACTED]");

    const clean = collect();
    await pipeline(Readable.from(["nothing to see here"]), createRedactor("secret"), clean.stream);
    expect(clean.text(), "text with no match passes through unchanged").toBe(
      "nothing to see here",
    );
  });

  test("challenge - the articles endpoint paginates, validates and caches", async () => {
    const app = createArticles();

    const page1 = await request(app).get("/articles?page=1&perPage=2");
    expect(page1.status).toBe(200);
    expect(
      page1.body,
      "page 1 of 2 per page, with the total of the whole collection",
    ).toEqual({
      items: [
        { id: "a-1", title: "Streams in anger", tag: "node" },
        { id: "a-2", title: "The event loop, again", tag: "node" },
      ],
      page: 1,
      perPage: 2,
      total: 3,
    });

    const etag = page1.headers.etag;
    expect(typeof etag === "string" && etag.length > 0, "a listing carries an ETag").toBe(
      true,
    );

    const revalidated = await request(app)
      .get("/articles?page=1&perPage=2")
      .set("if-none-match", etag);
    expect(
      revalidated.status,
      "nothing has changed, so the client is told to use its copy: 304, no body",
    ).toBe(304);
    expect(revalidated.text, "a 304 has no body").toBeFalsy();

    const page2 = await request(app).get("/articles?page=2&perPage=2");
    expect(page2.body.items.map((a: { id: string }) => a.id), "page 2 is the rest").toEqual([
      "a-3",
    ]);
    expect(
      page2.headers.etag,
      "a different page is a different representation, so a different ETag",
    ).not.toBe(etag);

    const created = await request(app)
      .post("/articles")
      .set("content-type", "application/json")
      .send({ title: "Backpressure by example", tag: "node", secret: "nope" });
    expect(created.status, "a valid create is a 201").toBe(201);
    expect(created.headers.location, "with a Location header").toBe("/articles/a-4");
    expect(
      created.body,
      "the created article, with the extra key stripped by the schema",
    ).toEqual({ id: "a-4", title: "Backpressure by example", tag: "node" });

    const stale = await request(app)
      .get("/articles?page=1&perPage=2")
      .set("if-none-match", etag);
    expect(
      stale.status,
      "the collection changed, so the old ETag no longer matches and the whole " +
        "page comes back",
    ).toBe(200);

    const invalid = await request(app)
      .post("/articles")
      .set("content-type", "application/json")
      .send({ title: "", tag: "elephant" });
    expect(invalid.status, "an invalid create is a 400").toBe(400);
    expect(invalid.body.error).toBe("validation_failed");
    expect(
      (invalid.body.details as { path: string }[]).map((issue) => issue.path).sort(),
      "both problems reported at once",
    ).toEqual(["tag", "title"]);

    const badPage = await request(app).get("/articles?page=0");
    expect(badPage.status, "pages are 1-based").toBe(400);
    expect(badPage.body).toEqual({ error: "invalid_pagination" });
  });

  test("review1 - createBus() supports wildcards without breaking the basics", () => {
    const bus = createBus();
    const seen: string[] = [];

    const onOrder = (id: string) => seen.push(`order:${id}`);
    bus.on("order.created", onOrder);
    bus.on("*", (event: string, id: string) => seen.push(`any:${event}:${id}`));

    expect(
      bus.emit("order.created", "o-1"),
      "emit() reports how many listeners it called - the specific one and the " +
        "wildcard",
    ).toBe(2);
    expect(
      seen,
      "the specific listener gets the payload; the wildcard gets the event " +
        "name first, then the payload",
    ).toEqual(["order:o-1", "any:order.created:o-1"]);

    seen.length = 0;
    expect(
      bus.emit("order.shipped", "o-2"),
      "an event with only a wildcard listener still reaches it",
    ).toBe(1);
    expect(seen).toEqual(["any:order.shipped:o-2"]);

    bus.off("order.created", onOrder);
    seen.length = 0;
    bus.emit("order.created", "o-3");
    expect(
      seen,
      "off() removes the specific listener and leaves the wildcard alone",
    ).toEqual(["any:order.created:o-3"]);

    seen.length = 0;
    bus.once("order.created", (id: string) => seen.push(`once:${id}`));
    bus.emit("order.created", "o-4");
    bus.emit("order.created", "o-5");
    expect(
      seen.filter((entry) => entry.startsWith("once:")),
      "once() still fires exactly once",
    ).toEqual(["once:o-4"]);
  });
});
