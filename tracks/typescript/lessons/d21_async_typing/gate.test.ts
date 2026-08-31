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
