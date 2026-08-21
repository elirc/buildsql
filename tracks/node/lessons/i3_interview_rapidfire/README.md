# i3 — Rapid fire

Short questions on the four things that come up in nearly every Node
interview, in shapes you have not seen before. Nothing here should take more
than ten minutes. That is the point: these are the answers that have to be
*automatic*, because in the room you will be producing them while also
listening, explaining and being watched.

This lesson exists mainly to feed the review ladder. Every exercise here is
about a ⭐⭐⭐ concept from `i1_interview_concepts`, and `dojo review` will bring
the review variant back at 3, 7, 21 and 60 days — so the material that matters
most is the material you meet most often. Redo the whole lesson cold whenever
it surfaces; it takes half an hour and it is the cheapest interview prep there
is.

The four:

| exercise | concept | first taught |
|---|---|---|
| ex1 | event loop and queue order | 02_event_loop |
| ex2 | backpressure | 06_buffers_streams |
| ex3 | timeouts, and cleaning up after them | 03_async_patterns |
| ex4 | operational vs programmer errors, as HTTP | 04, 10 |

## Exercise 1 — five labels, thirty seconds

Edit `ex1/solution.ts`. `ex1/snippet.ts`, run from inside a timer callback:

```ts
export function run(log: (label: string) => void): void {
  const start = async (): Promise<void> => {
    log("A");
    await Promise.resolve();
    log("B");
  };

  void start();
  process.nextTick(() => log("C"));
  queueMicrotask(() => log("D"));
  log("E");
}
```

Return the five labels in order. The interesting decision is between the two
microtasks, and it is decided by when each was *queued* rather than where it
sits in the source.

```
uv run dojo test node i3_interview_rapidfire ex1
```

## Exercise 2 — the one boolean everybody ignores

Edit `ex2/solution.ts`. Implement `pumpAll(source, dest)`: write every chunk
from an async iterable into a writable stream, honouring backpressure, and
return how many chunks you wrote. Do not end the stream — the caller owns it.

The gate gives you a sink with a 16-byte `highWaterMark` and a slow write, and
records how much was queued inside it at the worst moment. Write without
checking and that number is about 150; write properly and it stays at 16.

```
uv run dojo test node i3_interview_rapidfire ex2
```

## Exercise 3 — a deadline with a tidy exit

Edit `ex3/solution.ts`. Implement `withDeadline(promise, ms, message)`:

- the work settles first → its value or its error, unchanged;
- the deadline passes first → reject with an `Error` carrying that `message`
  **and** `code: "ETIMEDOUT"`;
- either way, no timer is left pending.

The gate uses fake timers, so five seconds pass instantly, and it checks
`vi.getTimerCount()` after the fast case.

```
uv run dojo test node i3_interview_rapidfire ex3
```

## Exercise 4 — from a thrown thing to an honest reply

Edit `ex4/solution.ts`. Implement `toResponse(error)` returning
`{ status, body: { error, message } }`:

1. an `Error` with a numeric `status` **and** a string `code` → use its own
   status, code and message (this is your own `AppError`);
2. an `Error` with a Node system code (`ECONNREFUSED`, `ENOENT` — capitals,
   starting with `E`) → **502**, `upstream_error`,
   `"upstream request failed"`;
3. anything else, including things that are not `Error`s → **500**,
   `internal_error`, `"internal server error"`.

Rule 2 is the one with teeth: the real message is
`connect ECONNREFUSED 10.0.0.7:5432`, and sending that to a client hands out
your internal topology.

```
uv run dojo test node i3_interview_rapidfire ex4
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule.
`review1/snippet.ts`, again from inside a timer callback:

```ts
export function run(log: (label: string) => void): void {
  log("start");

  Promise.resolve()
    .then(() => {
      log("p1");
    })
    .then(() => {
      log("p2");
    });

  process.nextTick(() => log("tick"));

  setTimeout(() => {
    log("timer");
    process.nextTick(() => log("tick-in-timer"));
  }, 0);

  log("end");
}
```

Seven labels. Two things are being checked: that a chained `.then` is queued
when its predecessor settles, and that the checkpoint runs after *each*
callback — including that timer.

```
uv run dojo test node i3_interview_rapidfire review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { Writable } from "node:stream";
import { describe, expect, test, vi } from "vitest";

import { predictOrder } from "./ex1/solution";
import { run as runSnippet } from "./ex1/snippet";
import { pumpAll } from "./ex2/solution";
import { withDeadline } from "./ex3/solution";
import { toResponse } from "./ex4/solution";
import { predictOrder as predictReview } from "./review1/solution";
import { run as runReviewSnippet } from "./review1/snippet";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function record(schedule: (log: (label: string) => void) => void): Promise<string[]> {
  const seen: string[] = [];
  let failure: unknown;
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      try {
        schedule((label) => seen.push(label));
      } catch (error) {
        failure = error;
      }
      resolve();
    }, 0);
  });
  await settle();
  await settle();
  await settle();
  if (failure) throw failure;
  return seen;
}

function divergence(prediction: readonly string[], actual: readonly string[]): string {
  if (!Array.isArray(prediction)) return "predictOrder() did not return an array";
  if (prediction.length !== actual.length) {
    return `you predicted ${prediction.length} line(s); ${actual.length} actually ran`;
  }
  const index = actual.findIndex((label, i) => prediction[i] !== label);
  if (index === -1) return "";
  return (
    `the first ${index} line(s) are right, then position ${index} diverges ` +
    `(you predicted "${prediction[index]}", which is not what ran there)`
  );
}

describe("i3_interview_rapidfire", () => {
  test("ex1 - five labels, thirty seconds", async () => {
    const actual = await record(runSnippet);
    expect(actual.length, "sanity check on the gate: five labels").toBe(5);
    expect(
      divergence(predictOrder(), actual),
      "an async function body runs synchronously to its first await; the " +
        "nextTick queue is served before the microtask queue; and the " +
        "continuation was queued before the queueMicrotask below it",
    ).toBe("");
  });

  test("ex2 - pumpAll() honours the one boolean everybody ignores", async () => {
    const received: Buffer[] = [];
    let maxBuffered = 0;

    const sink: Writable = new Writable({
      highWaterMark: 16,
      write(chunk: Buffer, _encoding, callback) {
        received.push(Buffer.from(chunk));
        maxBuffered = Math.max(maxBuffered, sink.writableLength);
        setImmediate(callback);
      },
    });

    async function* source(): AsyncGenerator<string> {
      for (let i = 0; i < 20; i += 1) yield String(i % 10).repeat(8);
    }

    const written = await pumpAll(source(), sink);
    await new Promise<void>((resolve) => sink.end(() => resolve()));

    expect(written, "one count per chunk written").toBe(20);
    expect(
      Buffer.concat(received).toString(),
      "every chunk arrives, in order",
    ).toBe(
      Array.from({ length: 20 }, (_unused, i) => String(i % 10).repeat(8)).join(""),
    );
    expect(
      maxBuffered,
      "write() returning false means stop until drain. Ignore it and the " +
        "stream buffers everything in memory - the number here would be ten " +
        "times the highWaterMark",
    ).toBeLessThanOrEqual(16);
  });

  test("ex3 - withDeadline() races, and cleans up after itself", async () => {
    vi.useFakeTimers();
    try {
      await expect(
        withDeadline(Promise.resolve("fast"), 5000, "the database took too long"),
        "the work won the race, so its value comes through",
      ).resolves.toBe("fast");
      expect(
        vi.getTimerCount(),
        "and the timer is gone - an uncleared timer keeps the process alive " +
          "long after the work is done",
      ).toBe(0);

      let resolveSlow: ((value: string) => void) | undefined;
      const slow = new Promise<string>((resolve) => {
        resolveSlow = resolve;
      });
      const timed = withDeadline(slow, 5000, "the database took too long");
      const outcome = timed.then(
        () => undefined,
        (error: unknown) => error as Error & { code?: string },
      );

      await vi.advanceTimersByTimeAsync(5000);
      const error = await outcome;
      expect(error?.message, "the message is the one the caller gave").toBe(
        "the database took too long",
      );
      expect(
        error?.code,
        'tag it with code "ETIMEDOUT" so a caller can branch on the kind of ' +
          "failure rather than on the text",
      ).toBe("ETIMEDOUT");
      resolveSlow?.("too late");
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex4 - toResponse() turns any thrown thing into an honest reply", () => {
    const known = Object.assign(new Error("no such order"), {
      status: 404,
      code: "not_found",
    });
    expect(
      toResponse(known),
      "an error you built deliberately already carries its status and code, " +
        "and its message is safe to show",
    ).toEqual({
      status: 404,
      body: { error: "not_found", message: "no such order" },
    });

    const system = Object.assign(new Error("connect ECONNREFUSED 10.0.0.7:5432"), {
      code: "ECONNREFUSED",
    });
    expect(
      toResponse(system),
      "a system error means a dependency failed: 502, and a generic message - " +
        "the real one names an internal host and port",
    ).toEqual({
      status: 502,
      body: { error: "upstream_error", message: "upstream request failed" },
    });

    expect(
      toResponse(new TypeError("cannot read properties of undefined")),
      "a programmer error is a 500, and the client is told nothing useful to " +
        "an attacker",
    ).toEqual({
      status: 500,
      body: { error: "internal_error", message: "internal server error" },
    });

    expect(
      toResponse("something went wrong"),
      "a thrown string is not an Error at all - same treatment",
    ).toEqual({
      status: 500,
      body: { error: "internal_error", message: "internal server error" },
    });
  });

  test("review1 - seven labels, and a chained then", async () => {
    const actual = await record(runReviewSnippet);
    expect(actual.length, "sanity check on the gate: seven labels").toBe(7);
    expect(
      divergence(predictReview(), actual),
      "a chained .then is queued when the previous one settles, so it joins " +
        "the back of the drain in progress - and a nextTick queued by a timer " +
        "callback runs before the loop moves on",
    ).toBe("");
  });
});
```

In plain English:

- `record()` and `divergence()` are the same harness as lesson 02: the snippet
  runs for real from a timer callback, and you are told where your prediction
  parts company with reality, never what reality was.
- **ex1** and **review1** are predictions.
- **ex2** measures `writableLength` inside the sink, so the assertion is about
  memory rather than about time.
- **ex3** runs the fast path under fake timers and checks the timer count,
  then advances the clock 5000 ms and inspects the rejection.
- **ex4** runs four different thrown things through your mapper, including one
  that is not an `Error`.

## The teaching point

There is a difference between knowing something and having it *ready*. Every
concept in this lesson is one you have already met and passed a gate on; the
reason to meet it again in a new shape, and then again in three weeks, is that
recall under pressure decays and recognition does not warn you when it has.

That is the whole design of this part of the course. `i1` gives you the
language, `i2` gives you the practice under a clock, and `i3` — plus the review
ladder underneath all three — keeps the ⭐⭐⭐ material from going quiet. When
`dojo review` surfaces one of these, do it cold, out loud, without the hints.
That is what the interview will feel like.

You have finished the Node track. `uv run dojo status node` for the map,
`uv run dojo review` for what is due, and `uv run dojo tracks` for where to go
next — the TypeScript track pairs naturally with this one, and the React track
puts the other half of a full-stack interview in place.
