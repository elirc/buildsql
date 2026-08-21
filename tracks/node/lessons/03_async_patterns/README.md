# 03 — Async patterns

Node's standard library was born callback-first, grew a promise API, and now
lives mostly in `async`/`await` — and all three generations are still in your
dependency tree. This lesson is about moving fluently between them, and then
about the thing that actually separates fast services from slow ones:
deciding what runs *at the same time*.

That second half is where most real performance lives. Async code does not
make anything faster by itself. `await`ing three HTTP calls one after another
takes exactly as long as three synchronous calls would; the only thing you
have won is that the event loop was free to serve other requests while you
waited. Starting all three and then waiting is what turns 300 ms into 100 ms,
and the difference between those two programs is often a single misplaced
`await` in a `for` loop.

But unlimited concurrency is its own bug. Fire 5,000 requests at a
downstream service and you will discover its connection limit, your file
descriptor limit and your on-call engineer, in that order. Real systems run
work with a ceiling, give it a deadline, and retry the failures with a
backoff. Those three things — a limit, a timeout, a retry — are the exercises
in this lesson, and they are three of the most common "write this on a
whiteboard" tasks for a Node role.

## Concept — the four combinators, and where the time goes

Start with the shape of the mistake:

```ts
// 300 ms: each await blocks the next call from starting
const a = await fetchUser(1);
const b = await fetchUser(2);
const c = await fetchUser(3);

// 100 ms: all three start, then you wait once
const [a, b, c] = await Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)]);
```

The second version is not "more parallel" in any CPU sense — there is still
one thread — but the three requests are *in flight* together, and waiting is
the only thing that was taking time.

The four combinators, in the order you will reach for them:

| combinator | settles when | gives you |
|---|---|---|
| `Promise.all` | all fulfil, or the **first** rejects | array of values, in input order |
| `Promise.allSettled` | all settle, whatever happens | array of `{status, value}` / `{status, reason}` |
| `Promise.race` | the **first** to settle, either way | that value, or that error |
| `Promise.any` | the first to **fulfil**; rejects only if all reject | that value, or an `AggregateError` |

`all` is the default and the right answer surprisingly often: if any of the
three calls failed, the request has failed, and you want to know now.
`allSettled` is for when partial success is a real outcome — sending five
notifications, three of which went through. `race` is how you implement a
deadline. `any` is failover: three mirrors, take whichever answers first.

Two facts about the array you pass in. It holds *promises*, which means the
work has already started by the time the combinator sees it — which is why
this lesson hands you arrays of **functions** (`() => Promise<T>`) whenever
the point is controlling when work begins. And the results of `all` come back
in input order regardless of finishing order, which people find surprising
and which makes the code much easier to read.

The last piece is the bridge from the callback era:

```ts
// The convention: error first, value second, callback called exactly once.
fs.readFile("config.json", "utf8", (error, contents) => {
  if (error) return handle(error);
  use(contents);
});
```

`node:util`'s `promisify` converts one of those into a promise-returning
function, and most of the standard library now ships a promise API directly
(`node:fs/promises`, `timers/promises`). You will still meet the old shape in
libraries, in your own event-emitter code, and in every interview that asks
you to "write promisify".

## Exercise 1 — promisify, by hand

Edit `ex1/solution.ts`. Implement `promisifyOne(fn)`, which takes a
single-argument, error-first callback function and returns a function of the
same argument that gives you a promise instead:

```ts
const read = promisifyOne(readSetting);
await read("region");        // resolves with the value
await read("nope");          // rejects with the error the callback got
```

The rules of the convention are the specification: the callback is called with
an error as its first argument on failure, and with `null` plus a value on
success. Your wrapper turns the first case into a rejection and the second
into a resolution, and it must not change the error on the way through.

```
uv run dojo test node 03_async_patterns ex1
```

## Exercise 2 — partial success is a result

Edit `ex2/solution.ts`. Implement `collectResults(tasks)`, where `tasks` is an
array of functions that each return a promise. It resolves to:

```ts
{ ok: T[], failed: string[] }
```

`ok` holds the values of the tasks that fulfilled, in input order; `failed`
holds the *messages* of the ones that rejected, also in input order. One
failure must not cost you the other results.

There is a second requirement the gate checks by counting: every task must be
**started before you wait for any of them**. It counts how many tasks were
running simultaneously, so a solution that awaits each task before starting
the next reports a high-water mark of 1 and fails with that number in front of
you.

```
uv run dojo test node 03_async_patterns ex2
```

## Exercise 3 — a ceiling on the concurrency

Edit `ex3/solution.ts`. Implement:

```ts
mapWithLimit(items, limit, worker): Promise<R[]>
```

It calls `worker(item, index)` for every item, never runs more than `limit` of
them at once, and resolves to the results **in input order**.

The obvious implementation — chop the array into chunks of `limit` and await
each chunk — is wrong in a way the gate is built to catch. With a chunk of two
items where one takes 10 ms and one takes 3 seconds, you spend three seconds
with a worker sitting idle. The gate releases exactly one worker and then
checks that the next item started, so batching stalls right there.

This is one of the most frequently asked hands-on Node interview questions.
Write it now, and write it again in `i2_interview_drills` under a time-box.

```
uv run dojo test node 03_async_patterns ex3
```

## Exercise 4 — a deadline you can actually rely on

Edit `ex4/solution.ts`. Implement `withTimeout(promise, ms, message)`:

- if the promise settles first, pass its value or its error straight through;
- if the deadline passes first, reject with `new Error(message)`;
- either way, **do not leave a pending timer behind**.

That last rule is the one worth internalising. A `setTimeout` you never
cleared keeps a handle registered with the event loop, and the loop does not
exit while it has work — so your CLI sits there for a second after printing
its output, and your test suite takes an extra 30 seconds for no visible
reason. The gate checks the timer count after a fast success, so a missing
`clearTimeout` fails.

The gate uses vitest's fake timers here, so 1000 ms passes instantly and
nothing in this lesson depends on how fast your machine is.

```
uv run dojo test node 03_async_patterns ex4
```

## Challenge — retry with exponential backoff

Edit `challenge/solution.ts`. Implement:

```ts
retryWithBackoff(operation, { attempts, baseDelayMs, isRetryable? })
```

- `attempts` is the **total** number of calls, including the first.
- Between attempts, wait `baseDelayMs`, then double it: 100, 200, 400, …
- `isRetryable(error)` decides whether an error is worth another go; if it
  says no, rethrow immediately without waiting. Default: retry everything.
- If every attempt fails, reject with the **last** error.

The doubling is not decoration. When a downstream service wobbles, every
client retrying at a fixed interval turns a wobble into an outage — the
retries arrive in a synchronised wave exactly when the service is trying to
recover. Backing off spreads them out. (Production versions also add
*jitter*, a small random offset, so that clients that failed together do not
retry together; the gate cannot check a random number, so this exercise leaves
it out and you should remember it exists.)

Honest difficulty note: the loop is straightforward. The two things that go
wrong are the off-by-one in the exponent (is the first wait `base` or
`base * 2`?) and remembering that `attempts: 3` means three calls, not four.

```
uv run dojo test node 03_async_patterns challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule. Implement
`firstSuccessful(tasks)`: run all the tasks, resolve with the value of the
first one to **fulfil**, and ignore failures unless every task fails — in
which case reject with an error whose message is exactly
`all tasks failed: ` followed by each task's message, in input order, joined
with `", "`.

```
uv run dojo test node 03_async_patterns review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest";

import { promisifyOne } from "./ex1/solution";
import { collectResults } from "./ex2/solution";
import { mapWithLimit } from "./ex3/solution";
import { withTimeout } from "./ex4/solution";
import { retryWithBackoff } from "./challenge/solution";
import { firstSuccessful } from "./review1/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // The gate checks rejections itself; this handler only stops an unfinished
  // stub from turning one into a process-level unhandled rejection.
  promise.catch(() => {});
  return { promise, resolve, reject };
}

describe("03_async_patterns", () => {
  test("ex1 - promisifyOne() turns an error-first callback into a promise", async () => {
    const settings: Record<string, string> = { region: "eu-west-1" };
    let calls = 0;
    const readSetting = (
      key: string,
      callback: (error: Error | null, value?: string) => void,
    ): void => {
      calls += 1;
      setTimeout(() => {
        const value = settings[key];
        if (value === undefined) callback(new Error(`unknown setting: ${key}`));
        else callback(null, value);
      }, 0);
    };

    const read = promisifyOne(readSetting);
    expect(
      typeof read,
      "promisifyOne() returns a *function*: you call it later, with the " +
        "argument, and get a promise back",
    ).toBe("function");

    await expect(
      read("region"),
      "the second argument the callback receives is the resolved value",
    ).resolves.toBe("eu-west-1");
    expect(
      calls,
      "one call to the promisified function is one call to the original",
    ).toBe(1);

    const failure = await read("nope").then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(
      failure,
      "an error-first callback signals failure through its FIRST argument; " +
        "that error must become a rejection, not a resolved value",
    ).toBeInstanceOf(Error);
    expect(
      (failure as Error).message,
      "reject with the error you were given, unchanged - do not rewrap it",
    ).toBe("unknown setting: nope");
  });

  test("ex2 - collectResults() starts every task before it waits for any", async () => {
    let active = 0;
    let maxActive = 0;
    const releases: (() => void)[] = [];
    const task = (value: string) => () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      return new Promise<string>((resolve) => {
        releases.push(() => {
          active -= 1;
          resolve(value);
        });
      });
    };
    const failing = () => Promise.reject(new Error("payments timed out"));

    const promise = collectResults([task("alpha"), failing, task("gamma")]);
    promise.catch(() => {}); // the gate reports its own failures below

    for (let i = 0; i < 6; i += 1) {
      while (releases.length > 0) releases.shift()?.();
      await settle();
    }
    const result = await promise;

    expect(
      result.ok,
      "the values of the tasks that fulfilled, in the order they were passed " +
        "in - not the order they finished",
    ).toEqual(["alpha", "gamma"]);
    expect(
      result.failed,
      "the *messages* of the tasks that rejected - one rejection must not " +
        "throw away the results of the others (README ex2)",
    ).toEqual(["payments timed out"]);
    expect(
      maxActive,
      "both slow tasks were still running at the same moment, so the high " +
        "water mark is 2. A 1 here means you awaited each task before " +
        "starting the next one",
    ).toBe(2);
  });

  test("ex3 - mapWithLimit() keeps the limit full without batching", async () => {
    const started: number[] = [];
    const releases = new Map<number, () => void>();
    let active = 0;
    let maxActive = 0;

    const worker = (item: number): Promise<string> => {
      started.push(item);
      active += 1;
      maxActive = Math.max(maxActive, active);
      return new Promise<string>((resolve) => {
        releases.set(item, () => {
          active -= 1;
          resolve(`done-${item}`);
        });
      });
    };

    const promise = mapWithLimit([1, 2, 3, 4, 5], 2, worker);
    promise.catch(() => {});
    await settle();

    expect(
      [...started],
      "with a limit of 2, exactly two workers may have been started before " +
        "anything finishes",
    ).toEqual([1, 2]);

    releases.get(2)?.();
    releases.delete(2);
    await settle();
    expect(
      [...started],
      "as soon as ONE slot frees up the next item starts - item 1 is still " +
        "running, so a solution that waits for the whole batch stalls here",
    ).toEqual([1, 2, 3]);

    for (let i = 0; i < 10; i += 1) {
      for (const [item, release] of [...releases]) {
        releases.delete(item);
        release();
      }
      await settle();
    }

    expect(
      await promise,
      "results come back in INPUT order, whatever order the workers finished in",
    ).toEqual(["done-1", "done-2", "done-3", "done-4", "done-5"]);
    expect(
      maxActive,
      "the limit is a maximum: never more than 2 workers in flight at once",
    ).toBeLessThanOrEqual(2);
    expect(
      maxActive,
      "the limit is also a target: with 5 items and a limit of 2 you should " +
        "have had 2 in flight, not 1",
    ).toBe(2);
  });

  test("ex4 - withTimeout() loses the race politely and cleans up after itself", async () => {
    vi.useFakeTimers();
    try {
      await expect(
        withTimeout(Promise.resolve("value"), 1000, "too slow"),
        "when the work wins the race, its value comes straight through",
      ).resolves.toBe("value");
      expect(
        vi.getTimerCount(),
        "the work finished, so the timeout timer must have been cleared. A " +
          "left-over timer keeps the whole process alive - this is the classic " +
          "reason a CLI hangs for a second after printing its output",
      ).toBe(0);

      const slow = deferred<string>();
      let settledEarly = false;
      const timed = withTimeout(slow.promise, 1000, "database took too long");
      timed.then(
        () => {
          settledEarly = true;
        },
        () => {
          settledEarly = true;
        },
      );

      await vi.advanceTimersByTimeAsync(999);
      expect(
        settledEarly,
        "at 999ms of a 1000ms budget nothing has happened yet",
      ).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      const error = await timed.then(
        () => undefined,
        (reason: unknown) => reason,
      );
      expect(
        error,
        "when the timer wins, reject with an Error carrying the message you " +
          "were given",
      ).toBeInstanceOf(Error);
      expect((error as Error).message, "the message comes from the caller").toBe(
        "database took too long",
      );

      const failing = Promise.reject(new Error("connection refused"));
      failing.catch(() => {});
      await expect(
        withTimeout(failing, 1000, "too slow"),
        "a promise that rejects before the deadline rejects with ITS error - " +
          "the timeout message would hide the real cause",
      ).rejects.toThrow("connection refused");
    } finally {
      vi.useRealTimers();
    }
  });

  test("challenge - retryWithBackoff() waits longer each time and gives up honestly", async () => {
    vi.useFakeTimers();
    try {
      let attempts = 0;
      const flaky = async (): Promise<string> => {
        attempts += 1;
        if (attempts < 3) throw new Error(`attempt ${attempts} failed`);
        return "recovered";
      };

      const promise = retryWithBackoff(flaky, { attempts: 5, baseDelayMs: 100 });
      promise.catch(() => {});
      await vi.advanceTimersByTimeAsync(0);
      expect(attempts, "the first attempt happens immediately, with no delay").toBe(1);

      await vi.advanceTimersByTimeAsync(99);
      expect(attempts, "the first retry waits baseDelayMs (100ms) - not 99").toBe(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(attempts, "at 100ms the second attempt runs").toBe(2);

      await vi.advanceTimersByTimeAsync(199);
      expect(
        attempts,
        "the second wait is doubled: 200ms, not another 100ms. Backoff is what " +
          "stops a retry storm from finishing off a struggling service",
      ).toBe(2);
      await vi.advanceTimersByTimeAsync(1);
      expect(attempts, "at 100+200ms the third attempt runs, and it succeeds").toBe(3);
      await expect(promise, "the value of the successful attempt").resolves.toBe(
        "recovered",
      );

      let always = 0;
      const broken = async (): Promise<string> => {
        always += 1;
        throw new Error(`failure ${always}`);
      };
      const exhausted = retryWithBackoff(broken, { attempts: 3, baseDelayMs: 10 });
      const outcome = exhausted.then(
        () => undefined,
        (error: unknown) => error,
      );
      await vi.advanceTimersByTimeAsync(1000);
      const error = await outcome;
      expect(
        always,
        "attempts: 3 means three attempts in total, not three retries after " +
          "the first one",
      ).toBe(3);
      expect(
        (error as Error).message,
        "when the retries are exhausted, the caller gets the LAST error - " +
          "not the first, and not an error of your own invention",
      ).toBe("failure 3");

      let refusals = 0;
      const forbidden = async (): Promise<string> => {
        refusals += 1;
        throw new Error("403 forbidden");
      };
      await expect(
        retryWithBackoff(forbidden, {
          attempts: 4,
          baseDelayMs: 10,
          isRetryable: (error) => !(error as Error).message.startsWith("403"),
        }),
        "a non-retryable error is rethrown as it is",
      ).rejects.toThrow("403 forbidden");
      expect(
        refusals,
        "there is no point retrying a 403: isRetryable said no, so the " +
          "operation runs exactly once",
      ).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test("review1 - firstSuccessful() waits out the failures", async () => {
    const alpha = deferred<string>();
    const beta = deferred<string>();
    const gamma = deferred<string>();

    const promise = firstSuccessful([
      () => alpha.promise,
      () => beta.promise,
      () => gamma.promise,
    ]);
    promise.catch(() => {});

    alpha.reject(new Error("alpha down"));
    await settle();
    beta.resolve("beta wins");
    expect(
      await promise,
      "one rejection is not a result: keep waiting for a task that fulfils. " +
        "Note gamma never settles at all, and that must not matter",
    ).toBe("beta wins");

    await expect(
      firstSuccessful([
        () => Promise.reject(new Error("x")),
        () => Promise.reject(new Error("y")),
      ]),
      "if every task fails, reject with one error listing all their messages " +
        'in order, exactly: "all tasks failed: x, y"',
    ).rejects.toThrow("all tasks failed: x, y");
  });
});
```

In plain English:

- `deferred()` is the gate's main tool: a promise the gate can resolve or
  reject whenever it likes. That is how concurrency gets tested without a
  clock — the gate holds every task open, counts how many are running, and
  releases them on its own schedule.
- **ex1** wires up an error-first function whose callback fires from a timer,
  checks that success resolves and failure rejects with the same `Error`, and
  counts calls to make sure your wrapper does not call the original twice.
- **ex2** builds three tasks: two that stay open until the gate releases them
  and one that rejects immediately. `maxActive` is the high-water mark of
  simultaneous tasks — 2 if you started them together, 1 if you awaited them
  one at a time.
- **ex3** starts five items with a limit of 2, checks that exactly two
  started, releases *one* of them and checks that a third started (this is the
  anti-batching check), then releases everything and checks the results are in
  input order.
- **ex4** uses `vi.useFakeTimers()` so the deadline can pass instantly.
  `vi.getTimerCount()` after the first case is the `clearTimeout` check.
- **challenge** advances the fake clock one millisecond at a time around each
  expected delay — 99 then 1, 199 then 1 — so an off-by-one in your backoff
  shows up as a precise "at 100ms the second attempt runs" failure rather than
  a vague one.
- **review1** rejects the first task, resolves the second, and never settles
  the third at all: `Promise.any` semantics mean the third does not matter.

## The teaching point

Three habits come out of this lesson, and they are the ones that show up in
code review.

**Start work, then wait for it.** `await` in a loop is the single most common
performance bug in Node code, and it is invisible in a diff unless you are
looking for it. When you see a loop with an `await` inside, ask whether the
iterations depend on each other. If they do not, that loop wants to be a
`map` and a combinator.

**Every external call needs a deadline.** A promise that never settles is a
request handler that never responds, a connection that is never released, and
a queue that grows until the process dies. `withTimeout` is thirty seconds of
work and it is the difference between a slow dependency degrading your service
and taking it down.

**Bound your concurrency.** "Do all of them at once" is fine for three things
and catastrophic for fifty thousand. `mapWithLimit` — or a library that does
the same thing — belongs anywhere you process a list whose length you do not
control.

Next: **04_events_errors**, where the other half of Node's async story lives:
what happens when something goes wrong, and who is listening.
