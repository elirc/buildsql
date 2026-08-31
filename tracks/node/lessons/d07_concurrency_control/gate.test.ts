// Gate for node/d07_concurrency_control. Quoted verbatim in README.md.
//
// Every concurrency claim here is graded by COUNTING, never by timing. The gate
// holds each unit of work open with a deferred it controls and releases them
// one at a time, so "how many were in flight" is an exact number on any
// machine.
import { describe, expect, test } from "vitest";

import { createSemaphore } from "./ex1/solution";
import { singleFlight } from "./ex2/solution";
import { createTaskQueue } from "./ex3/solution";
import { batched } from "./ex4/solution";
import { mapSettledLimit } from "./ex5/solution";
import { createKeyedLock } from "./ex6/solution";
import { createPool } from "./ex7/solution";
import { mapLimitAbortable } from "./ex8/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** A unit of work the gate can start, count and release by name. */
function workshop<T = string>() {
  const started: string[] = [];
  const releases = new Map<string, (value: T) => void>();
  const fails = new Map<string, (reason: unknown) => void>();
  let active = 0;
  let maxActive = 0;

  const task = (name: string) => (): Promise<T> => {
    started.push(name);
    active += 1;
    maxActive = Math.max(maxActive, active);
    return new Promise<T>((resolve, reject) => {
      releases.set(name, (value: T) => {
        active -= 1;
        resolve(value);
      });
      fails.set(name, (reason: unknown) => {
        active -= 1;
        reject(reason);
      });
    });
  };

  return {
    task,
    started,
    release: (name: string, value: T) => releases.get(name)?.(value),
    fail: (name: string, reason: unknown) => fails.get(name)?.(reason),
    maxActive: () => maxActive,
  };
}

describe("d07_concurrency_control", () => {
  test("ex1 - createSemaphore() hands out permits and takes them back", async () => {
    const semaphore = createSemaphore(2);
    const entered: string[] = [];
    const release = new Map<string, () => void>();

    for (const name of ["a", "b", "c", "d"]) {
      void semaphore.acquire().then((done) => {
        entered.push(name);
        release.set(name, done);
      });
    }
    await settle();

    expect(
      entered,
      "two permits means exactly two callers get in; the rest wait for one to " +
        "come back",
    ).toEqual(["a", "b"]);
    expect(semaphore.available(), "no permits left").toBe(0);
    expect(semaphore.waiting(), "and two callers queued").toBe(2);

    release.get("a")?.();
    await settle();
    expect(
      entered,
      "one release lets in exactly one more, and the queue is FIFO - c was " +
        "waiting before d",
    ).toEqual(["a", "b", "c"]);

    release.get("a")?.();
    await settle();
    expect(
      entered,
      "releasing the same permit twice must not conjure an extra one. Without " +
        "that guard a limit of 2 quietly becomes a limit of 3 the first time " +
        "somebody calls release in both a then and a finally",
    ).toEqual(["a", "b", "c"]);

    release.get("b")?.();
    await settle();
    expect(entered, "and now d gets in").toEqual(["a", "b", "c", "d"]);

    release.get("c")?.();
    release.get("d")?.();
    await settle();
    expect(semaphore.available(), "everything handed back").toBe(2);
    expect(semaphore.waiting(), "nobody waiting").toBe(0);
  });

  test("ex2 - singleFlight() collapses overlapping calls into one", async () => {
    const shop = workshop();
    const load = singleFlight(shop.task("load"));

    const first = load();
    const second = load();
    const third = load();
    await settle();

    expect(
      shop.started,
      "three overlapping callers, one actual call. This is the fix for the " +
        "cache stampede: a hundred requests arriving on a cold cache must not " +
        "become a hundred database queries",
    ).toEqual(["load"]);

    shop.release("load", "value-1");
    expect(
      [await first, await second, await third],
      "and every caller of that flight gets the same answer",
    ).toEqual(["value-1", "value-1", "value-1"]);

    const later = load();
    await settle();
    expect(
      shop.started,
      "once the flight has landed, the next call starts a new one - this is " +
        "de-duplication, not caching, and the difference is the whole point",
    ).toEqual(["load", "load"]);
    shop.release("load", "value-2");
    expect(await later, "with the newer value").toBe("value-2");

    const failingShop = workshop();
    const flaky = singleFlight(failingShop.task("flaky"));
    const doomedA = flaky();
    const doomedB = flaky();
    doomedA.catch(() => {});
    doomedB.catch(() => {});
    await settle();
    failingShop.fail("flaky", new Error("upstream down"));

    await expect(doomedA, "a failed flight fails every caller in it").rejects.toThrow(
      "upstream down",
    );
    await expect(doomedB).rejects.toThrow("upstream down");

    void flaky();
    await settle();
    expect(
      failingShop.started,
      "and a failure is never remembered: the next caller gets a real attempt",
    ).toEqual(["flaky", "flaky"]);
  });

  test("ex3 - createTaskQueue() keeps N running and survives a failing task", async () => {
    const shop = workshop();
    const queue = createTaskQueue({ concurrency: 2 });

    const results = new Map<string, Promise<string>>();
    for (const name of ["a", "b", "c", "d"]) {
      const promise = queue.push(shop.task(name));
      promise.catch(() => {});
      results.set(name, promise);
    }
    await settle();

    expect(shop.started, "two start, two wait").toEqual(["a", "b"]);
    expect(queue.active(), "two in flight").toBe(2);
    expect(queue.size(), "and two still queued").toBe(2);

    shop.fail("a", new Error("a exploded"));
    await settle();
    await expect(
      results.get("a"),
      "push() hands back a promise for THAT task, so a failure lands on the " +
        "caller who submitted it",
    ).rejects.toThrow("a exploded");
    expect(
      shop.started,
      "and the queue keeps going - one bad task must not stop the pipeline",
    ).toEqual(["a", "b", "c"]);

    const idle = queue.onIdle();
    let done = false;
    void idle.then(() => {
      done = true;
    });
    await settle();
    expect(done, "onIdle() waits while there is work").toBe(false);

    shop.release("b", "B");
    await settle();
    shop.release("c", "C");
    await settle();
    shop.release("d", "D");
    await settle();

    expect(await results.get("d"), "each caller gets its own result").toBe("D");
    await idle;
    expect(queue.active(), "nothing running").toBe(0);
    expect(queue.size(), "nothing queued").toBe(0);
    expect(shop.maxActive(), "and the limit held throughout").toBeLessThanOrEqual(2);
  });

  test("ex4 - batched() runs a batch together and the batches in order", async () => {
    const shop = workshop();
    const promise = batched(["a", "b", "c", "d", "e"], 2, (item: string) => shop.task(item)());
    promise.catch(() => {});
    await settle();

    expect(
      shop.started,
      "the whole first batch starts together - this is the opposite of a " +
        "limiter, and it is what you want when each batch is one round trip",
    ).toEqual(["a", "b"]);

    shop.release("a", "A");
    await settle();
    expect(
      shop.started,
      "one member finishing does NOT start the next batch. A batch is a " +
        "barrier: everything in it has to settle first",
    ).toEqual(["a", "b"]);

    shop.release("b", "B");
    await settle();
    expect(shop.started, "now the second batch starts, both at once").toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);

    shop.release("c", "C");
    shop.release("d", "D");
    await settle();
    expect(shop.started, "and the short last batch is a batch too").toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
    shop.release("e", "E");

    expect(
      await promise,
      "the results are flat and in input order, not grouped by batch",
    ).toEqual(["A", "B", "C", "D", "E"]);
    expect(shop.maxActive(), "never more than the batch size at once").toBeLessThanOrEqual(2);

    const attempted: string[] = [];
    await expect(
      batched(["p", "q", "r", "s"], 2, async (item: string) => {
        attempted.push(item);
        if (item === "q") throw new Error("q failed");
        return item;
      }),
      "one failure fails the call",
    ).rejects.toThrow("q failed");
    expect(
      attempted,
      "and the next batch never starts - r and s are untouched",
    ).toEqual(["p", "q"]);

    expect(await batched([], 3, async (item: string) => item), "nothing in, nothing out").toEqual(
      [],
    );
  });

  test("ex5 - mapSettledLimit() reports everything and gives up on nothing", async () => {
    const shop = workshop();
    const promise = mapSettledLimit(["a", "b", "c", "d"], 2, (item: string) =>
      shop.task(item)(),
    );
    await settle();
    expect(shop.started, "two at a time").toEqual(["a", "b"]);

    shop.fail("a", new Error("a is broken"));
    await settle();
    expect(
      shop.started,
      "a failure frees its slot like any other outcome, so the next item " +
        "starts. A limiter that stops on the first error is a different " +
        "function with a different name",
    ).toEqual(["a", "b", "c"]);

    shop.release("b", "B");
    await settle();
    shop.release("c", "C");
    shop.release("d", "D");

    expect(
      await promise,
      "one record per input, in INPUT order, and the whole call never rejects",
    ).toEqual([
      { status: "rejected", reason: new Error("a is broken") },
      { status: "fulfilled", value: "B" },
      { status: "fulfilled", value: "C" },
      { status: "fulfilled", value: "D" },
    ]);
    expect(shop.maxActive(), "the limit held").toBeLessThanOrEqual(2);

    expect(
      await mapSettledLimit([], 2, async (item: string) => item),
      "no items, no records, no hang",
    ).toEqual([]);
  });

  test("ex6 - createKeyedLock() serialises a key without blocking the others", async () => {
    const lock = createKeyedLock();
    const shop = workshop();

    const run = (key: string, name: string): Promise<string> =>
      lock.withLock(key, shop.task(name));

    const a1 = run("order-1", "a1");
    const a2 = run("order-1", "a2");
    const b1 = run("order-2", "b1");
    a1.catch(() => {});
    a2.catch(() => {});
    b1.catch(() => {});
    await settle();

    expect(
      shop.started,
      "the two holders of DIFFERENT keys run together; the second holder of " +
        "the same key waits. A global lock would have run only a1",
    ).toEqual(["a1", "b1"]);
    expect(lock.held("order-1"), "the key is held").toBe(true);
    expect(lock.held("order-3"), "an untouched key is free").toBe(false);

    shop.fail("a1", new Error("a1 blew up"));
    await settle();
    expect(
      shop.started,
      "the lock is released even when the work throws - a lock held by a dead " +
        "task never comes back, and everything on that key stops forever",
    ).toEqual(["a1", "b1", "a2"]);
    await expect(a1, "and the failure still reaches its caller").rejects.toThrow("a1 blew up");

    shop.release("a2", "A2");
    shop.release("b1", "B1");
    expect([await a2, await b1], "each caller gets its own result").toEqual(["A2", "B1"]);
    await settle();
    expect(
      lock.held("order-1"),
      "with nothing left holding it, the key is free again",
    ).toBe(false);
  });

  test("ex7 - createPool() lends out resources and never makes too many", async () => {
    let created = 0;
    const pool = createPool({ create: () => ({ id: (created += 1) }), max: 2 });

    const first = await pool.acquire();
    expect(first, "a resource is created on demand").toEqual({ id: 1 });
    expect(
      pool.size(),
      "and only on demand: one acquire means one resource exists, not max of " +
        "them",
    ).toBe(1);

    const second = await pool.acquire();
    expect(second, "the second acquire creates the second").toEqual({ id: 2 });
    expect(pool.size(), "the pool is now at its ceiling").toBe(2);

    const handed: string[] = [];
    const third = pool.acquire().then((resource) => {
      handed.push(`third:${resource.id}`);
      return resource;
    });
    const fourth = pool.acquire().then((resource) => {
      handed.push(`fourth:${resource.id}`);
      return resource;
    });
    await settle();

    expect(handed, "with everything lent out, further callers wait").toEqual([]);
    expect(pool.waiting(), "two of them").toBe(2);
    expect(
      created,
      "and the pool does NOT create more. A pool that grows under pressure is " +
        "not a pool - it is the connection storm it was supposed to prevent",
    ).toBe(2);

    pool.release(first);
    await settle();
    expect(
      handed,
      "a released resource goes straight to the longest waiter, still warm - " +
        "and it is the same object, not a new one",
    ).toEqual(["third:1"]);

    pool.release(second);
    await settle();
    expect(handed, "and then to the next").toEqual(["third:1", "fourth:2"]);
    expect(pool.waiting(), "queue empty").toBe(0);

    const borrowed = await third;
    await fourth;
    pool.release(borrowed);
    pool.release(borrowed);
    expect(
      await pool.acquire(),
      "releasing the same resource twice must not put two copies in the free " +
        "list, or two callers end up sharing one connection",
    ).toBe(borrowed);
    expect(created, "still only ever two").toBe(2);
  });

  test("ex8 - mapLimitAbortable() stops starting work the moment it is cancelled", async () => {
    const controller = new AbortController();
    const shop = workshop();
    const signals: AbortSignal[] = [];

    const promise = mapLimitAbortable(
      ["a", "b", "c", "d", "e"],
      2,
      (item: string, _index: number, signal: AbortSignal) => {
        signals.push(signal);
        return shop.task(item)();
      },
      controller.signal,
    );
    promise.catch(() => {});
    await settle();

    expect(shop.started, "two in flight").toEqual(["a", "b"]);
    expect(
      signals[0],
      "the worker is handed the signal, so the work it starts can be " +
        "cancelled too - a limiter that only stops SCHEDULING still leaves the " +
        "in-flight requests running",
    ).toBe(controller.signal);

    shop.release("a", "A");
    await settle();
    expect(shop.started, "a free slot starts the next item").toEqual(["a", "b", "c"]);

    controller.abort(new Error("user cancelled"));
    await expect(
      promise,
      "the call rejects with the abort reason as soon as it is aborted, " +
        "without waiting for the work already in flight",
    ).rejects.toThrow("user cancelled");

    shop.release("b", "B");
    shop.release("c", "C");
    await settle();
    expect(
      shop.started,
      "and nothing further is started - d and e never run",
    ).toEqual(["a", "b", "c"]);

    const attempted: string[] = [];
    await expect(
      mapLimitAbortable(
        ["x", "y"],
        2,
        async (item: string) => {
          attempted.push(item);
          return item;
        },
        AbortSignal.abort(new Error("already cancelled")),
      ),
      "a signal that is already aborted rejects immediately",
    ).rejects.toThrow("already cancelled");
    expect(attempted, "having started nothing at all").toEqual([]);

    const clean = new AbortController();
    expect(
      await mapLimitAbortable(
        ["p", "q", "r"],
        2,
        async (item: string, index: number) => `${item}${index}`,
        clean.signal,
      ),
      "and with nobody cancelling anything it is an ordinary limiter: results " +
        "in input order, with the index",
    ).toEqual(["p0", "q1", "r2"]);
  });
});
