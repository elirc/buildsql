# i2 — Interview drills

Six tasks of the kind you are actually given, one long-form challenge, and a
review variant. Each prompt is written the way an interviewer says it, with a
time-box — because the constraint is part of the exercise. A drill you can
complete in forty minutes and not in twenty-five is a drill you have not
finished practising.

How to run one properly:

1. Read the prompt once. Start a timer.
2. Say your plan out loud in two sentences before you type anything. In a real
   interview this is the part that gets you hired; the code is confirmation.
3. Write it. Talk while you write — narrate the trade-offs you are making.
4. Run the gate. If it is red, read the message, not the diff.
5. Whatever happened, read `reading.md` afterwards for what the interviewer
   was actually looking for.

Do not open the hints during the time-box. A hint you took at minute five is a
drill you did not do.

## Drill 1 — implement `Promise.allSettled` ⏱ 20 minutes

> "Suppose `Promise.allSettled` did not exist. Write it. Same semantics: one
> record per input, in input order, and it never rejects."

Edit `ex1/solution.ts`. `allSettledFromScratch(promises)` resolves to an array
of `{ status: "fulfilled", value }` / `{ status: "rejected", reason }`, in
input order, whatever order the inputs settled in. An empty array resolves
immediately to `[]`.

The gate also checks that every input is in flight at once — this is a drill
about combinators, not about awaiting things one at a time.

```
uv run dojo test node i2_interview_drills ex1
```

## Drill 2 — a concurrency limiter ⏱ 25 minutes

> "We have ten thousand URLs to fetch and the upstream falls over above about
> five at a time. Write `mapLimit(items, limit, worker)`."

Edit `ex2/solution.ts`. Results in input order; never more than `limit`
workers in flight; a slot refills as soon as *one* worker finishes. And the
new requirement, which is the half people skip: if a worker rejects, the whole
call rejects with that error and **no further items are started**.

This is the most commonly assigned Node exercise there is. You wrote it in
lesson 03; the drill is writing it again, cold, while talking.

```
uv run dojo test node i2_interview_drills ex2
```

## Drill 3 — the prediction battery ⏱ 15 minutes

> "Three snippets. Tell me what each one prints, and why."

Edit `ex3/solution.ts` and return one array of labels per snippet, in order.
Here they are, exactly as `ex3/snippets.ts` runs them — each from inside a
timer callback:

```ts
// snippet 1
log("a");
process.nextTick(() => log("b"));
Promise.resolve().then(() => log("c"));
log("d");

// snippet 2
const job = async (): Promise<void> => {
  log("1");
  await null;
  log("2");
};
void job();
Promise.resolve().then(() => log("3"));
log("4");

// snippet 3
setTimeout(() => log("t1"), 0);
Promise.resolve().then(() => {
  log("m1");
  process.nextTick(() => log("n1"));
});
process.nextTick(() => {
  log("n0");
  Promise.resolve().then(() => log("m0"));
});
log("sync");
```

The gate runs all three for real and tells you which snippet and which
position you got wrong — never what the right answer was.

```
uv run dojo test node i2_interview_drills ex3
```

## Drill 4 — a rate limiter, token bucket ⏱ 30 minutes

> "Add rate limiting to this express app. One client, ten requests a second,
> and I want to allow a small burst. How would you test it?"

Edit `ex4/solution.ts`. Implement `createTokenBucket({ capacity,
refillPerSecond, now })` and an app that guards `GET /ping` with it:

- the bucket starts full and holds at most `capacity` tokens;
- tokens refill **continuously** at `refillPerSecond`, capped at `capacity`;
- each allowed request spends one token and sets `x-ratelimit-limit` and
  `x-ratelimit-remaining` (whole tokens);
- with less than one token: **429**, `{"error":"too many requests"}`, and a
  `Retry-After` in seconds until the next whole token (never below 1).

The answer to "how would you test it?" is in the signature: `now` is injected,
so the gate moves the clock instead of sleeping. Lesson 10's challenge was a
fixed window; be ready to say why a bucket is smoother and what `capacity`
actually controls.

```
uv run dojo test node i2_interview_drills ex4
```

## Drill 5 — `promisify` and `callbackify` ⏱ 20 minutes

> "Write `promisify`. Now write the inverse."

Edit `ex5/solution.ts`. `promisify(fn)` turns `(arg, callback)` into
`(arg) => Promise<T>`; `callbackify(fn)` turns `(arg) => Promise<T>` back into
`(arg, callback)`.

One rule the gate is strict about: `callbackify`'s callback must **never** be
called synchronously, even when the async function returns immediately.
Getting that right for the right reason — promise handlers always run in a
microtask — is the point of the drill.

```
uv run dojo test node i2_interview_drills ex5
```

## Drill 6 — redact a secret from a stream ⏱ 25 minutes

> "We are streaming logs to a third party and they occasionally contain an API
> key. Write a Transform that removes it. The key can be split across chunks."

Edit `ex6/solution.ts`. `createRedactor(secret)` returns a `Transform` that
replaces every occurrence of `secret` with `[REDACTED]`, including occurrences
that straddle a chunk boundary, and including one that ends exactly at the end
of the input.

The insight the interviewer is waiting for: hold back the last
`secret.length - 1` characters of every chunk, because they might be the start
of a match. Everything else follows from that sentence.

```
uv run dojo test node i2_interview_drills ex6
```

## Challenge — the take-home ⏱ 45 minutes

> "Build us a small articles API: a paginated listing with proper HTTP caching,
> and a create endpoint with validation. In-memory storage is fine."

Edit `challenge/solution.ts`. The schema and the seed data are provided.

- `GET /articles?page=&perPage=` → `{ items, page, perPage, total }`, page
  1-based, `perPage` 1–50, both integers; anything else is **400**
  `{"error":"invalid_pagination"}`.
- That response carries an **ETag** derived from the body, plus
  `Cache-Control: no-cache`. A request with a matching `If-None-Match` gets
  **304** with no body; a different page or changed data gets a fresh one.
- `POST /articles` validates with the schema, assigns the next id (`a-4` after
  three seeded), and answers **201** with a `Location` header and the created
  article — with keys the schema does not mention stripped.
- Invalid → **400** `{"error":"validation_failed","details":[{path,message}]}`
  with *every* problem reported.

Honest difficulty note: this is a real 45 minutes. The ETag is where people
lose time, and the fix is to serialise the body once and hash that exact
string rather than computing the ETag from the data separately.

```
uv run dojo test node i2_interview_drills challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule.

> "Write an event bus. Same as EventEmitter, but I want a wildcard listener
> that sees every event, and `emit` should tell me how many listeners it
> called."

`on`, `once`, `off`, `emit`. A listener registered on `"*"` is called for
every event with the event name as its first argument. `emit` returns the
number of listeners it called, wildcards included.

```
uv run dojo test node i2_interview_drills review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
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
```

In plain English:

- **ex1** holds two inputs open and rejects a third immediately, then checks
  the records, the order, and that both slow inputs were in flight together.
- **ex2** starts four items with a limit of two, releases exactly one and
  checks a third started, then runs a failing worker and checks that not every
  item was attempted.
- **ex3** runs all three snippets for real and reports the first divergence
  per snippet.
- **ex4** drives a `vi.fn()` clock: two free requests, a 429 with
  `Retry-After: 1`, one token back after a second, and the cap enforced after
  a minute idle.
- **ex5** checks both directions, both error paths, and — the important one —
  that `callbackify` has not called back by the time the call returns.
- **ex6** feeds a secret split across two and then three chunks, one that ends
  at the end of the input, and a clean input.
- **challenge** paginates, revalidates with the ETag, checks a different page
  gets a different ETag, creates, then re-checks the old ETag is now stale.
- **review1** exercises specific listeners, wildcards, the call count, `off`
  and `once`.

## The teaching point

These drills are all small, and none of them is really about the code. Every
one has a sentence in it that the interviewer is listening for: *"a rejection
becomes a record"*, *"the slot refills when one finishes, not when the batch
does"*, *"the checkpoint runs after every callback"*, *"the cap is what makes
it a limit"*, *"promise handlers always run in a microtask"*, *"hold back
`secret.length - 1` characters"*, *"hash the exact body you are going to
send"*.

Learn to say the sentence first and write the code second. That order is what
distinguishes a candidate who has understood the problem from one who is
pattern-matching, and it is the same order that makes the code come out right.

Next: **i3_interview_rapidfire**, the ⭐⭐⭐ material again in short form, on the
spaced-review schedule so it keeps coming back.
