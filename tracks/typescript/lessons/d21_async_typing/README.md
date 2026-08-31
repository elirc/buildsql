# d21 - Typing async code (drill set)

Eight problems on promises with types on them: sequential and concurrent
loading, settled results, async iteration, retries, races, a concurrency limit,
and a tuple-shaped `Promise.all`. They drill lesson **11_async_and_modules**;
go back if `Promise<T>` and `T` still look interchangeable in a signature.

Both gates run. Everything here is **deterministic** - no real timers and no
wall-clock waiting. Where an exercise needs something to be pending, the gate
hands it a deferred promise and resolves it by hand, which is also how you
should test this kind of code at work.

## ex1 - one at a time, in order

`mapSeries(values, fn)` applies an async `fn` to each value **sequentially** -
the next call does not start until the previous one has settled - and resolves
with the results in input order.

- `mapSeries([1, 2, 3], double)` -> `[2, 4, 6]`
- the callback receives `(value, index)`
- an empty list resolves to `[]`

Two type parameters: the element type going in and the result type coming out.
The return type is `Promise<R[]>`, not `Promise<R>[]`.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex1
```

## ex2 - three loaders, one wait

`Profile` is `{ user: { id: string; name: string }; orders: readonly { id: string }[]; unread: number }`.

`loadProfile(loadUser, loadOrders, loadUnread)` calls all three loaders,
**starts them all before awaiting any of them**, and resolves with the
assembled `Profile`.

The gate proves the concurrency: it hands you three loaders that record when
they are called and return promises that nobody has resolved yet, then checks
that all three were called.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex2
```

## ex3 - split the settled results

`partitionSettled(tasks)` waits for every promise - it never rejects - and
resolves with `{ fulfilled: T[]; rejected: unknown[] }`.

- fulfilled values keep input order
- rejection reasons are `unknown`, because a promise may be rejected with
  anything at all
- `partitionSettled([])` -> `{ fulfilled: [], rejected: [] }`
- one rejection must not lose the values that did arrive

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex3
```

## ex4 - walk the pages

Two exports.

`pages(fetchPage)` is an **async generator** that yields items across a cursor
API. It calls `fetchPage(null)` first; each page is
`{ items: readonly T[]; next: string | null }`; it yields every item, then
follows `next` until `next` is `null`.

`collect(source)` takes any `AsyncIterable<T>` and resolves with all of its
items as an array.

- three pages of `["a", "b"]`, `["c"]`, `["d"]` collect to `["a", "b", "c", "d"]`
- the cursors requested are `null`, then whatever each page returned
- an empty first page with `next: null` collects to `[]`

`pages` returns `AsyncGenerator<T, void, undefined>`; `collect` returns
`Promise<T[]>`.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex4
```

## ex5 - try again, up to a point

`withRetry(task, attempts)` calls `task()` and returns its value. If it
rejects, it calls it again, up to `attempts` times in total. If the last
attempt rejects, that rejection is what comes out.

- a task that fails twice then succeeds resolves on the third attempt, with
  `attempts` set to 3
- with `attempts` set to 2, the same task rejects, and the reason is the one
  from the second attempt
- a task that succeeds first time is called exactly once

There are no delays between attempts - this is a retry, not a backoff.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex5
```

## ex6 - whichever settles first

`withTimeout(task, expire, message)` resolves with `task`'s value if `task`
settles first, and rejects with `new Error(message)` if `expire` resolves
first.

- if `task` rejects first, **its own reason** comes out - the timeout message
  does not replace it
- the return type is `Promise<T>`: the expiry contributes nothing to it

`expire` is a `Promise<void>`. The gate supplies deferred promises and settles
them by hand, so there is no timer anywhere - which is exactly how you make
timeout code testable.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex6
```

## ex7 - at most n at a time

`createQueue(limit)` returns `{ add<T>(task: () => Promise<T>): Promise<T> }`.

- at most `limit` tasks run at once
- waiting tasks start in the order they were added
- each `add` call resolves (or rejects) with its own task's result

The gate adds three tasks to a queue with a limit of 2, checks that only two
have started, resolves the first, and checks that the third then starts.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex7
```

## ex8 - a tuple-shaped Promise.all

`allOf(values)` is `Promise.all` with the types written out: it takes a tuple of
promises and plain values, and resolves with a tuple of the awaited results, in
the same positions.

- `allOf([Promise.resolve(1), Promise.resolve("a")])` -> `Promise<[number, string]>`
- `allOf([Promise.resolve(true), 2])` -> resolves to `[boolean, 2]` - a plain
  value passes through, and its literal type survives
- `allOf([])` -> resolves to `[]`
- one rejection rejects the whole call

Three pieces: a `const` type parameter so the argument is inferred as a tuple, a
mapped type over that tuple, and `Awaited` on each member.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d21_async_typing ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Runtime gate for typescript/d21_async_typing. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { mapSeries } from "./ex1/solution";
import { loadProfile } from "./ex2/solution";
import { partitionSettled } from "./ex3/solution";
import { collect, pages } from "./ex4/solution";
import { withRetry } from "./ex5/solution";
import { withTimeout } from "./ex6/solution";
import { createQueue } from "./ex7/solution";
import { allOf } from "./ex8/solution";

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
  return { promise, resolve, reject };
}

async function flush(): Promise<void> {
  for (let i = 0; i < 12; i += 1) {
    await Promise.resolve();
  }
}

describe("d21_async_typing", () => {
  test("ex1 - mapSeries() runs one task at a time", async () => {
    const log: string[] = [];
    const double = async (value: number): Promise<number> => {
      log.push("start" + String(value));
      await Promise.resolve();
      log.push("end" + String(value));
      return value * 2;
    };
    expect(await mapSeries([1, 2, 3], double), "the results keep input order").toEqual([2, 4, 6]);
    expect(log, "each task finishes before the next one starts - a Promise.all version " +
      "would interleave the starts (README ex1)").toEqual([
      "start1",
      "end1",
      "start2",
      "end2",
      "start3",
      "end3",
    ]);
    expect(await mapSeries([], double), "an empty list resolves to an empty list").toEqual([]);
    const indexes: number[] = [];
    await mapSeries(["a", "b"], async (value, index) => {
      indexes.push(index);
      return value;
    });
    expect(indexes, "the callback is given the index as well as the value").toEqual([0, 1]);
  });

  test("ex2 - loadProfile() starts all three loaders before waiting", async () => {
    const user = deferred<{ id: string; name: string }>();
    const orders = deferred<readonly { id: string }[]>();
    const unread = deferred<number>();
    const started: string[] = [];
    const profile = loadProfile(
      () => {
        started.push("user");
        return user.promise;
      },
      () => {
        started.push("orders");
        return orders.promise;
      },
      () => {
        started.push("unread");
        return unread.promise;
      },
    );
    profile.catch(() => undefined);
    await flush();
    expect(started, "all three loaders are called before anything is awaited - awaiting " +
      "them one at a time triples the latency (README ex2)").toEqual([
      "user",
      "orders",
      "unread",
    ]);
    user.resolve({ id: "u1", name: "Ada" });
    orders.resolve([{ id: "o1" }]);
    unread.resolve(2);
    expect(await profile, "and the three results are assembled into one object").toEqual({
      user: { id: "u1", name: "Ada" },
      orders: [{ id: "o1" }],
      unread: 2,
    });
  });

  test("ex3 - partitionSettled() splits the outcomes", async () => {
    const outcome = await partitionSettled([
      Promise.resolve(1),
      Promise.reject(new Error("boom")),
      Promise.resolve(3),
    ]);
    expect(outcome.fulfilled, "the values that arrived, in input order").toEqual([1, 3]);
    expect(outcome.rejected.length, "one rejection").toBe(1);
    expect(String(outcome.rejected[0]), "and the reason is kept, not swallowed").toContain("boom");
    const empty = await partitionSettled([]);
    expect(empty, "no tasks means two empty lists").toEqual({ fulfilled: [], rejected: [] });
    const allBad = await partitionSettled([Promise.reject(new Error("a"))]);
    expect(allBad.fulfilled, "nothing fulfilled is still an array - one rejection must " +
      "not reject the whole call (README ex3)").toEqual([]);
  });

  test("ex4 - pages() walks the cursor until it runs out", async () => {
    const requested: (string | null)[] = [];
    const fetchPage = async (
      cursor: string | null,
    ): Promise<{ items: readonly string[]; next: string | null }> => {
      requested.push(cursor);
      if (cursor === null) {
        return { items: ["a", "b"], next: "p2" };
      }
      if (cursor === "p2") {
        return { items: ["c"], next: "p3" };
      }
      return { items: ["d"], next: null };
    };
    expect(await collect(pages(fetchPage)), "every item from every page, in order").toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(requested, "the first request carries a null cursor and each later one " +
      "carries the cursor the previous page returned").toEqual([null, "p2", "p3"]);
    const onePage = async (): Promise<{ items: readonly string[]; next: string | null }> => ({
      items: [],
      next: null,
    });
    expect(await collect(pages(onePage)), "an empty first page ends the walk").toEqual([]);
  });

  test("ex5 - withRetry() calls again only after a rejection", async () => {
    let calls = 0;
    const flaky = async (): Promise<string> => {
      calls += 1;
      if (calls < 3) {
        throw new Error("attempt " + String(calls));
      }
      return "ok";
    };
    expect(await withRetry(flaky, 3), "the third attempt succeeds").toBe("ok");
    expect(calls, "and it stopped there").toBe(3);

    calls = 0;
    await expect(
      withRetry(flaky, 2),
      "when the attempts run out the last error is rethrown, not swallowed",
    ).rejects.toThrow(/attempt 2/);
    expect(calls, "two attempts, no more").toBe(2);

    let happyCalls = 0;
    const happy = async (): Promise<number> => {
      happyCalls += 1;
      return 7;
    };
    expect(await withRetry(happy, 5), "a task that works is not retried").toBe(7);
    expect(happyCalls, "so it ran exactly once").toBe(1);
  });

  test("ex6 - withTimeout() takes whichever settles first", async () => {
    const fast = deferred<string>();
    const neverExpires = deferred<void>();
    const winner = withTimeout(fast.promise, neverExpires.promise, "too slow");
    fast.resolve("done");
    expect(await winner, "the task won, so its value comes out").toBe("done");

    const slow = deferred<string>();
    const expire = deferred<void>();
    const loser = withTimeout(slow.promise, expire.promise, "too slow");
    expire.resolve();
    await expect(loser, "the expiry won, so the message becomes the rejection").rejects.toThrow(
      /too slow/,
    );

    const failing = deferred<string>();
    const idle = deferred<void>();
    const rejected = withTimeout(failing.promise, idle.promise, "too slow");
    failing.reject(new Error("task blew up"));
    await expect(rejected, "a task that rejects first rejects the race with its own " +
      "reason - the timeout message must not replace it (README ex6)").rejects.toThrow(
      /task blew up/,
    );
  });

  test("ex7 - createQueue() runs at most limit tasks at once", async () => {
    const queue = createQueue(2);
    const first = deferred<string>();
    const second = deferred<string>();
    const third = deferred<string>();
    const started: number[] = [];
    const p1 = queue.add(() => {
      started.push(1);
      return first.promise;
    });
    const p2 = queue.add(() => {
      started.push(2);
      return second.promise;
    });
    const p3 = queue.add(() => {
      started.push(3);
      return third.promise;
    });
    await flush();
    expect(started, "two slots, so the third task waits").toEqual([1, 2]);
    first.resolve("a");
    await flush();
    expect(started, "a finished task frees a slot and the queue starts the next one " +
      "in the order it was added (README ex7)").toEqual([1, 2, 3]);
    second.resolve("b");
    third.resolve("c");
    expect(await Promise.all([p1, p2, p3]), "each add() resolves with its own result").toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  test("ex8 - allOf() resolves a tuple of mixed values", async () => {
    expect(
      await allOf([Promise.resolve(1), "x", Promise.resolve(true)]),
      "promises are awaited, plain values pass through, positions are kept",
    ).toEqual([1, "x", true]);
    expect(await allOf([]), "an empty tuple resolves to an empty tuple").toEqual([]);
    await expect(
      allOf([Promise.resolve(1), Promise.reject(new Error("nope"))]),
      "one rejection rejects the whole call - that is all-or-nothing, unlike ex3",
    ).rejects.toThrow(/nope/);
  });
});
```

This is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d21_async_typing. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { mapSeries } from "./ex1/solution";
import type { Profile } from "./ex2/solution";
import { loadProfile } from "./ex2/solution";
import { partitionSettled } from "./ex3/solution";
import { collect, pages } from "./ex4/solution";
import { withRetry } from "./ex5/solution";
import { withTimeout } from "./ex6/solution";
import { createQueue } from "./ex7/solution";
import { allOf } from "./ex8/solution";

const fetchStringPage = async (): Promise<{ items: readonly string[]; next: string | null }> => ({
  items: ["a"],
  next: null,
});

describe("d21_async_typing", () => {
  test("ex1 - mapSeries() carries both type parameters", async () => {
    expectTypeOf(mapSeries([1], async (value) => String(value))).toEqualTypeOf<Promise<string[]>>();
    expectTypeOf(await mapSeries([1], async (value) => value > 0)).toEqualTypeOf<boolean[]>();
    await mapSeries(["a"], async (value, index) => {
      expectTypeOf(value).toEqualTypeOf<string>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return value;
    });
  });

  test("ex2 - loadProfile() promises a Profile", () => {
    const loaded = loadProfile(
      async () => ({ id: "u1", name: "Ada" }),
      async () => [{ id: "o1" }],
      async () => 0,
    );
    expectTypeOf(loaded).toEqualTypeOf<Promise<Profile>>();
    expectTypeOf<Profile["unread"]>().toEqualTypeOf<number>();
  });

  test("ex3 - partitionSettled() keeps the fulfilled type and loses the rejected one", async () => {
    const outcome = await partitionSettled([Promise.resolve(1)]);
    expectTypeOf(outcome).toEqualTypeOf<{ fulfilled: number[]; rejected: unknown[] }>();
    expectTypeOf(outcome.fulfilled).toEqualTypeOf<number[]>();
    expectTypeOf(outcome.rejected).toEqualTypeOf<unknown[]>();
  });

  test("ex4 - pages() and collect() agree about the item type", async () => {
    expectTypeOf(collect(pages(fetchStringPage))).toEqualTypeOf<Promise<string[]>>();
    for await (const item of pages(fetchStringPage)) {
      expectTypeOf(item).toEqualTypeOf<string>();
      break;
    }
  });

  test("ex5 - withRetry() gives back what the task gave back", async () => {
    expectTypeOf(withRetry(async () => "ok", 3)).toEqualTypeOf<Promise<string>>();
    expectTypeOf(await withRetry(async () => 1, 3)).toEqualTypeOf<number>();
  });

  test("ex6 - withTimeout() keeps the task type", async () => {
    const task: Promise<number> = Promise.resolve(1);
    const expire: Promise<void> = Promise.resolve();
    expectTypeOf(withTimeout(task, expire, "slow")).toEqualTypeOf<Promise<number>>();
    expectTypeOf(await withTimeout(Promise.resolve("a"), expire, "slow")).toEqualTypeOf<string>();
  });

  test("ex7 - add() resolves with the tasks own result type", async () => {
    const queue = createQueue(1);
    expectTypeOf(queue.add(async () => "a")).toEqualTypeOf<Promise<string>>();
    expectTypeOf(await queue.add(async () => 1)).toEqualTypeOf<number>();
  });

  test("ex8 - allOf() maps a tuple of inputs to a tuple of results", async () => {
    expectTypeOf(allOf([Promise.resolve(1), Promise.resolve("a")])).toEqualTypeOf<
      Promise<[number, string]>
    >();
    expectTypeOf(await allOf([Promise.resolve(true), 2])).toEqualTypeOf<[boolean, 2]>();
    expectTypeOf(await allOf([])).toEqualTypeOf<[]>();
  });
});
```

An exercise is green only when both gates agree about it.
