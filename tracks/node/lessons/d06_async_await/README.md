# d06 — async / await

Eight problems on the syntax half of lesson **03_async_patterns**: what `await`
actually does to control flow, when sequential is right and when it is a
performance bug, and how `try`/`catch`/`finally` behave once promises are
involved. Problems 5 and 7 pull in async iteration from the same lesson's
neighbourhood — if `for await` is unfamiliar, read problem 5's hints first.

## Problem 1 — when sequential is right

Edit `ex1/solution.ts`. `loadProfile(id, deps)` calls `deps.findUser(id)`, then
`deps.findTeam(user.teamId)`, and returns `{ id, name, team }` where `team` is
the team's **name**. A failure in the first call propagates unchanged and the
second call never happens.

```
uv run dojo test node d06_async_await ex1
```

## Problem 2 — when sequential is wrong

Edit `ex2/solution.ts`. `startBoth(first, second)` starts both pieces of work
before waiting for either and returns `[a, b]` in **argument** order, whatever
order they settled in. One rejection rejects the pair.

```
uv run dojo test node d06_async_await ex2
```

## Problem 3 — failure as a value

Edit `ex3/solution.ts`. `attempt(fn)` resolves to `[null, value]` or
`[error, null]` and never rejects. `fn` may throw **synchronously**, before it
returns a promise, and anything at all may be thrown — the first slot is always
`null` or a real `Error`.

```
uv run dojo test node d06_async_await ex3
```

## Problem 4 — cleanup that does not lie

Edit `ex4/solution.ts`. `withCleanup(run, cleanup)` runs the cleanup on both
paths and **awaits** it before the caller resumes. If only the cleanup failed,
its error is the result; if both failed, the **original** error is the result.

```
uv run dojo test node d06_async_await ex4
```

## Problem 5 — consume a stream, and let go of it

Edit `ex5/solution.ts`. `sumUntil(source, stopAt)` adds up values from an
`AsyncIterable<number>` until one equals `stopAt` — the sentinel is not counted.
Leaving early must close the iterator; the gate counts the `return()` calls.

```
uv run dojo test node d06_async_await ex5
```

## Problem 6 — map the values of an object

Edit `ex6/solution.ts`. `mapValuesAsync(record, fn)` applies `fn(value, key)` to
every value **all at once** and returns an object with the same keys. An empty
object gives an empty object; one rejection rejects the call.

```
uv run dojo test node d06_async_await ex6
```

## Problem 7 — an async generator

Edit `ex7/solution.ts`. `chunked(source, size)` yields arrays of `size` items;
the last one may be short and an empty source yields nothing at all. A consumer
that breaks out early must end up closing the source.

```
uv run dojo test node d06_async_await ex7
```

## Problem 8 — run it, and be able to undo it

Edit `ex8/solution.ts`. `runStages(stages)` runs each stage in order and returns
the names that ran. On a failure it rolls back the stages that **completed**, in
reverse order, and rejects with the original error — with any rollback failures
attached to it as `rollbackErrors`.

```
uv run dojo test node d06_async_await ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d06_async_await. Quoted verbatim in README.md.
//
// Concurrency is graded by counting, never by timing: the gate holds work open
// with deferreds and releases it itself, so "did these overlap" is a number.
// The async-iteration problems build their own source so the gate can see
// whether the iterator was closed.
import { describe, expect, test } from "vitest";

import { loadProfile } from "./ex1/solution";
import { startBoth } from "./ex2/solution";
import { attempt } from "./ex3/solution";
import { withCleanup } from "./ex4/solution";
import { sumUntil } from "./ex5/solution";
import { mapValuesAsync } from "./ex6/solution";
import { chunked } from "./ex7/solution";
import { runStages, type Stage } from "./ex8/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  promise.catch(() => {});
  return { promise, resolve, reject };
}

/** An async iterable that reports whether the consumer closed it early. */
function makeSource(values: number[]): { iterable: AsyncIterable<number>; closed: () => number } {
  let closed = 0;
  const iterable: AsyncIterable<number> = {
    [Symbol.asyncIterator](): AsyncIterator<number> {
      let index = 0;
      return {
        async next(): Promise<IteratorResult<number>> {
          if (index >= values.length) return { value: undefined, done: true };
          const value = values[index];
          index += 1;
          return { value, done: false };
        },
        async return(): Promise<IteratorResult<number>> {
          closed += 1;
          return { value: undefined, done: true };
        },
      };
    },
  };
  return { iterable, closed: () => closed };
}

describe("d06_async_await", () => {
  test("ex1 - loadProfile() awaits the first call because it needs the answer", async () => {
    const calls: string[] = [];
    const deps = {
      async findUser(id: string) {
        calls.push(`findUser:${id}`);
        if (id === "missing") throw new Error("no such user: missing");
        return { id, name: "Ada", teamId: "t-9" };
      },
      async findTeam(teamId: string) {
        calls.push(`findTeam:${teamId}`);
        return { id: teamId, name: "Platform" };
      },
    };

    expect(
      await loadProfile("u-1", deps),
      "the profile is the two answers combined: the user id and name, and the " +
        "team name under the key team",
    ).toEqual({ id: "u-1", name: "Ada", team: "Platform" });
    expect(
      calls,
      "the team lookup needs a teamId that only the user lookup can supply, so " +
        "these two are genuinely sequential - this is the case where awaiting " +
        "one before starting the other is correct rather than lazy",
    ).toEqual(["findUser:u-1", "findTeam:t-9"]);

    calls.length = 0;
    await expect(
      loadProfile("missing", deps),
      "a failure in the first call propagates unchanged - no wrapping, no " +
        "swallowing",
    ).rejects.toThrow("no such user: missing");
    expect(
      calls,
      "and the second call never happens, because await means the rest of the " +
        "function does not run",
    ).toEqual(["findUser:missing"]);
  });

  test("ex2 - startBoth() starts both before it waits for either", async () => {
    let active = 0;
    let maxActive = 0;
    const first = deferred<string>();
    const second = deferred<number>();

    const promise = startBoth(
      () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        return first.promise;
      },
      () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        return second.promise;
      },
    );
    promise.catch(() => {});

    await settle();
    expect(
      maxActive,
      "both were in flight at the same moment, so the high water mark is 2. A " +
        "1 here means you awaited the first before calling the second, which " +
        "doubles the latency for no reason",
    ).toBe(2);

    second.resolve(7);
    await settle();
    first.resolve("alpha");
    expect(
      await promise,
      "the results come back as a tuple in ARGUMENT order, whatever order they " +
        "settled in - here the second one finished first",
    ).toEqual(["alpha", 7]);

    const doomed = startBoth(
      () => Promise.reject(new Error("left failed")),
      () => new Promise<number>(() => {}),
    );
    await expect(
      doomed,
      "one failure fails the pair, with that error - and note the other side " +
        "never settles at all, which must not matter",
    ).rejects.toThrow("left failed");
  });

  test("ex3 - attempt() turns any failure into a value", async () => {
    expect(
      await attempt(async () => 5),
      "success is a null error and the value",
    ).toEqual([null, 5]);

    const [error, value] = await attempt(async () => {
      throw new Error("db down");
    });
    expect(error?.message, "a rejection becomes the first slot").toBe("db down");
    expect(value, "and the value slot is null, not undefined").toBe(null);

    const [syncError] = await attempt((): Promise<number> => {
      throw new Error("bad argument");
    });
    expect(
      syncError?.message,
      "a function can throw BEFORE it returns a promise - argument validation " +
        "usually does. Calling it outside the try is how that one escapes",
    ).toBe("bad argument");

    const [thrownString] = await attempt(() => Promise.reject("just a string"));
    expect(
      thrownString,
      "anything at all can be thrown in JavaScript, so normalise: the caller " +
        "reads .message and must not have to check the type first",
    ).toBeInstanceOf(Error);
    expect(thrownString?.message).toBe("just a string");
  });

  test("ex4 - withCleanup() always cleans up and never hides the real failure", async () => {
    const order: string[] = [];
    expect(
      await withCleanup(
        async () => {
          order.push("work");
          return 7;
        },
        async () => {
          await settle();
          order.push("cleanup");
        },
      ),
      "the value passes through",
    ).toBe(7);
    order.push("after");
    expect(
      order,
      "and the cleanup is AWAITED: it has finished before the caller resumes. " +
        "An unawaited cleanup is a race with whatever runs next",
    ).toEqual(["work", "cleanup", "after"]);

    const failed: string[] = [];
    await expect(
      withCleanup(
        async () => {
          throw new Error("work failed");
        },
        () => {
          failed.push("cleanup");
        },
      ),
      "a failure still reaches the caller",
    ).rejects.toThrow("work failed");
    expect(failed, "and the cleanup still ran").toEqual(["cleanup"]);

    await expect(
      withCleanup(
        async () => "ok",
        () => {
          throw new Error("cleanup failed");
        },
      ),
      "when the work succeeded and only the cleanup failed, the cleanup error " +
        "is the news",
    ).rejects.toThrow("cleanup failed");

    await expect(
      withCleanup(
        async () => {
          throw new Error("original");
        },
        () => {
          throw new Error("cleanup failed");
        },
      ),
      "but when both fail the ORIGINAL error wins. A plain try/finally gets " +
        "this backwards - a throw from finally replaces the exception in " +
        "flight, and the real cause is gone",
    ).rejects.toThrow("original");
  });

  test("ex5 - sumUntil() stops at the sentinel and closes the source", async () => {
    const full = makeSource([1, 2, 3, 4, 5]);
    expect(
      await sumUntil(full.iterable, 4),
      "add values until the sentinel appears; the sentinel itself is not " +
        "counted, so 1 + 2 + 3",
    ).toBe(6);
    expect(
      full.closed(),
      "leaving a for-await loop early has to close the iterator, and the " +
        "language does that for you when you break. Returning out of the " +
        "middle of a hand-rolled while loop does not",
    ).toBe(1);

    const short = makeSource([1, 2, 3]);
    expect(
      await sumUntil(short.iterable, 9),
      "a sentinel that never appears means everything is summed",
    ).toBe(6);
    expect(
      short.closed(),
      "and an iterator that ran to its natural end is NOT closed a second " +
        "time - it closed itself",
    ).toBe(0);

    const empty = makeSource([]);
    expect(await sumUntil(empty.iterable, 1), "nothing to add is zero").toBe(0);
  });

  test("ex6 - mapValuesAsync() keeps the keys and starts everything at once", async () => {
    let active = 0;
    let maxActive = 0;
    const releases: (() => void)[] = [];
    const keys: string[] = [];

    const promise = mapValuesAsync(
      { alpha: 1, beta: 2, gamma: 3 },
      (value: number, key: string) => {
        keys.push(key);
        active += 1;
        maxActive = Math.max(maxActive, active);
        return new Promise<string>((resolve) => {
          releases.push(() => {
            active -= 1;
            resolve(`${key}:${value * 10}`);
          });
        });
      },
    );
    promise.catch(() => {});

    await settle();
    expect(
      maxActive,
      "all three were in flight together. Awaiting inside a for..of over the " +
        "entries is the mistake here: it is three round trips where one would " +
        "do",
    ).toBe(3);
    expect(keys, "and the mapper is given the key as well as the value").toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);

    while (releases.length > 0) releases.shift()?.();
    expect(
      await promise,
      "the result is an object with the same keys and the mapped values",
    ).toEqual({ alpha: "alpha:10", beta: "beta:20", gamma: "gamma:30" });

    expect(
      await mapValuesAsync({}, async () => "never"),
      "an empty object maps to an empty object, and does not hang",
    ).toEqual({});

    await expect(
      mapValuesAsync({ ok: 1, bad: 2 }, async (value: number) => {
        if (value === 2) throw new Error("bad value");
        return value;
      }),
      "one failure fails the whole map",
    ).rejects.toThrow("bad value");
  });

  test("ex7 - chunked() is an async generator that cleans up after itself", async () => {
    const source = makeSource([1, 2, 3, 4, 5]);
    const collected: number[][] = [];
    for await (const chunk of chunked(source.iterable, 2)) collected.push(chunk);
    expect(
      collected,
      "full chunks while there are enough, then whatever is left - the last " +
        "chunk is short, not padded and not dropped",
    ).toEqual([[1, 2], [3, 4], [5]]);
    expect(source.closed(), "the source ended by itself, so nothing to close").toBe(0);

    const none = makeSource([]);
    const empty: number[][] = [];
    for await (const chunk of chunked(none.iterable, 3)) empty.push(chunk);
    expect(
      empty,
      "an empty source yields nothing at all - not one empty chunk",
    ).toEqual([]);

    const long = makeSource([1, 2, 3, 4, 5, 6]);
    const firstOnly: number[][] = [];
    for await (const chunk of chunked(long.iterable, 2)) {
      firstOnly.push(chunk);
      break;
    }
    expect(firstOnly, "the consumer took one chunk and left").toEqual([[1, 2]]);
    expect(
      long.closed(),
      "and the break has to propagate all the way through: closing the " +
        "generator closes the for-await inside it, which closes the source. " +
        "That chain is why the loop is worth more than a while over .next()",
    ).toBe(1);
  });

  test("ex8 - runStages() unwinds what it did and keeps the real error", async () => {
    const log: string[] = [];
    const stage = (name: string, fail = false): Stage => ({
      name,
      async run() {
        log.push(`run:${name}`);
        if (fail) throw new Error(`${name} failed`);
      },
      async rollback() {
        log.push(`rollback:${name}`);
      },
    });

    expect(
      await runStages([stage("a"), stage("b")]),
      "the happy path returns the names of the stages that ran, in order",
    ).toEqual(["a", "b"]);
    expect(log, "and nothing was rolled back").toEqual(["run:a", "run:b"]);

    log.length = 0;
    const failure = await runStages([
      stage("a"),
      stage("b"),
      stage("c", true),
      stage("d"),
    ]).then(
      () => undefined,
      (error: unknown) => error as Error & { rollbackErrors?: Error[] },
    );

    expect(
      failure?.message,
      "the caller gets the error that actually stopped the run, not a summary " +
        "of your own invention",
    ).toBe("c failed");
    expect(
      log,
      "d never ran; c did not complete so it is not rolled back; and the " +
        "completed stages unwind in REVERSE, because b may have been built on a",
    ).toEqual(["run:a", "run:b", "run:c", "rollback:b", "rollback:a"]);

    const partial = await runStages([
      {
        name: "a",
        async run() {
          /* nothing to do */
        },
        async rollback() {
          throw new Error("rollback a failed");
        },
      },
      {
        name: "b",
        async run() {
          /* a stage with no rollback at all */
        },
      },
      {
        name: "c",
        async run() {
          throw new Error("boom");
        },
      },
    ]).then(
      () => undefined,
      (error: unknown) => error as Error & { rollbackErrors?: Error[] },
    );

    expect(
      partial?.message,
      "a stage without a rollback is skipped quietly, and a rollback that " +
        "fails must not become the error the caller sees",
    ).toBe("boom");
    expect(
      partial?.rollbackErrors?.map((error) => error.message),
      "the rollback failures are attached to the error instead, so whoever " +
        "gets paged can see that the unwind was incomplete",
    ).toEqual(["rollback a failed"]);
  });
});
```

In plain English:

- **ex1** records the calls, checks the order, then fails the first one and
  checks the second never happened.
- **ex2** holds both sides open and counts how many were in flight at once, then
  settles them out of order.
- **ex3** covers success, an async throw, a *synchronous* throw and a thrown
  string.
- **ex4** checks the cleanup is awaited, then runs all three failure
  combinations.
- **ex5** counts the iterator's `return()` calls on an early break and on a
  natural end.
- **ex6** counts concurrency, checks the keys, and covers the empty and failing
  cases.
- **ex7** chunks evenly and unevenly, checks an empty source yields nothing, and
  breaks after one chunk to see the source close.
- **ex8** runs a clean sequence, then fails the third of four stages, then adds
  a stage with no rollback and one whose rollback throws.

Next: **d07_concurrency_control**, where the question is how many at once.
