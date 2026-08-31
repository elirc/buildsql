// Gate for node/d08_promise_combinators. Quoted verbatim in README.md.
//
// Every input is a deferred the gate settles by hand, so the tests say things
// like "this one never settles at all, and that must not matter" and mean them
// literally. The one timed problem runs under fake timers.
import { describe, expect, test, vi } from "vitest";

import { allInOrder } from "./ex1/solution";
import { raceFirst } from "./ex2/solution";
import { anyOf } from "./ex3/solution";
import { allWithProgress } from "./ex4/solution";
import { settleWithin } from "./ex5/solution";
import { firstMatching } from "./ex6/solution";
import { settledStream } from "./ex7/solution";
import { firstQuorum } from "./ex8/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

interface Held<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function hold<T>(): Held<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // The gate checks rejections itself; this only stops an unfinished stub from
  // turning one into a process-level unhandled rejection.
  promise.catch(() => {});
  return { promise, resolve, reject };
}

/** Has this promise settled, without waiting for it? */
function watch(promise: Promise<unknown>): () => boolean {
  let done = false;
  promise.then(
    () => {
      done = true;
    },
    () => {
      done = true;
    },
  );
  return () => done;
}

describe("d08_promise_combinators", () => {
  test("ex1 - allInOrder() collects by position and fails fast", async () => {
    const a = hold<string>();
    const b = hold<string>();
    const c = hold<string>();
    const promise = allInOrder([a.promise, b.promise, c.promise]);
    promise.catch(() => {});

    c.resolve("C");
    await settle();
    b.resolve("B");
    await settle();
    a.resolve("A");

    expect(
      await promise,
      "results go where their INPUT was, not where they finished - here they " +
        "landed in exactly the wrong order",
    ).toEqual(["A", "B", "C"]);

    expect(
      await allInOrder([]),
      "no inputs resolves immediately with an empty array, and does not hang",
    ).toEqual([]);

    const p = hold<string>();
    const q = hold<string>();
    const failing = allInOrder([p.promise, q.promise]);
    const settledYet = watch(failing);
    failing.catch(() => {});

    q.reject(new Error("q exploded"));
    await settle();
    expect(
      settledYet(),
      "the first rejection settles the whole thing right away - it does not " +
        "wait for the others, and p here never settles at all",
    ).toBe(true);
    await expect(failing, "with that reason").rejects.toThrow("q exploded");
  });

  test("ex2 - raceFirst() takes the first settlement of either kind", async () => {
    const a = hold<string>();
    const b = hold<string>();
    const winner = raceFirst([a.promise, b.promise]);
    b.resolve("b was quicker");
    a.resolve("a eventually");
    expect(await winner, "the first to settle wins").toBe("b was quicker");

    const c = hold<string>();
    const d = hold<string>();
    const loser = raceFirst([c.promise, d.promise]);
    loser.catch(() => {});
    d.reject(new Error("d failed first"));
    await expect(
      loser,
      "a race settles on the first SETTLEMENT, not the first success - which " +
        "is exactly why race is the wrong tool for failover",
    ).rejects.toThrow("d failed first");

    const forever = raceFirst<string>([]);
    const settledYet = watch(forever);
    await settle();
    await settle();
    expect(
      settledYet(),
      "an empty race never settles at all. It is a strange rule and it is the " +
        "right one: nothing has happened, so there is nothing to report",
    ).toBe(false);
  });

  test("ex3 - anyOf() ignores failures until there are none left", async () => {
    const a = hold<string>();
    const b = hold<string>();
    const c = hold<string>();
    const promise = anyOf([a.promise, b.promise, c.promise]);

    a.reject(new Error("a down"));
    await settle();
    b.resolve("b wins");
    expect(
      await promise,
      "a rejection is not a result: keep waiting. Note c never settles, and " +
        "that must not matter",
    ).toBe("b wins");

    const failure = await anyOf([
      Promise.reject(new Error("x")),
      Promise.reject(new Error("y")),
    ]).then(
      () => undefined,
      (error: unknown) => error as AggregateError,
    );
    expect(
      failure,
      "when every input fails the rejection is an AggregateError, which exists " +
        "for exactly this",
    ).toBeInstanceOf(AggregateError);
    expect(
      (failure?.errors as Error[]).map((error) => error.message),
      "and .errors holds them all, in INPUT order",
    ).toEqual(["x", "y"]);

    const empty = await anyOf([]).then(
      () => undefined,
      (error: unknown) => error as AggregateError,
    );
    expect(
      empty,
      "no inputs means no chance of success, so it rejects immediately",
    ).toBeInstanceOf(AggregateError);
    expect((empty?.errors as Error[]).length, "with nothing in it").toBe(0);
  });

  test("ex4 - allWithProgress() reports as they land and returns in order", async () => {
    const a = hold<string>();
    const b = hold<string>();
    const c = hold<string>();
    const seen: Array<[number, number]> = [];
    const promise = allWithProgress([a.promise, b.promise, c.promise], (done, total) =>
      seen.push([done, total]),
    );
    promise.catch(() => {});

    b.resolve("B");
    await settle();
    expect(
      seen,
      "progress fires as each one lands, in COMPLETION order, with the running " +
        "count and the total",
    ).toEqual([[1, 3]]);

    c.resolve("C");
    await settle();
    expect(seen, "two of three").toEqual([
      [1, 3],
      [2, 3],
    ]);

    a.resolve("A");
    expect(
      await promise,
      "and the results are still in INPUT order - the two orders are different " +
        "and both matter",
    ).toEqual(["A", "B", "C"]);
    expect(seen, "the last one reports too").toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);

    let calls = 0;
    expect(
      await allWithProgress([], () => {
        calls += 1;
      }),
      "nothing to do",
    ).toEqual([]);
    expect(calls, "and nothing to report - not even a 0 of 0").toBe(0);

    const p = hold<string>();
    const q = hold<string>();
    const failing = allWithProgress([p.promise, q.promise], () => {});
    failing.catch(() => {});
    q.reject(new Error("q exploded"));
    await expect(failing, "a rejection still fails the whole thing").rejects.toThrow(
      "q exploded",
    );
  });

  test("ex5 - settleWithin() gives up on the stragglers and reports the rest", async () => {
    vi.useFakeTimers();
    try {
      const a = hold<string>();
      const b = hold<string>();
      const c = hold<string>();
      const promise = settleWithin([a.promise, b.promise, c.promise], 1_000);
      const settledYet = watch(promise);

      a.resolve("A");
      b.reject(new Error("b failed"));

      await vi.advanceTimersByTimeAsync(999);
      expect(
        settledYet(),
        "one is still pending, so at 999ms of a 1000ms budget there is nothing " +
          "to report yet",
      ).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(
        await promise,
        "at the deadline everything settled reports its outcome and everything " +
          "else is marked timedout - one record per input, in input order, and " +
          "the call itself never rejects",
      ).toEqual([
        { status: "fulfilled", value: "A" },
        { status: "rejected", reason: new Error("b failed") },
        { status: "timedout" },
      ]);
      expect(
        vi.getTimerCount(),
        "and the deadline timer is gone. A stray one keeps the process alive " +
          "for the rest of the budget",
      ).toBe(0);

      const d = hold<string>();
      const quick = settleWithin([d.promise], 1_000);
      d.resolve("D");
      expect(
        await quick,
        "everything settled early, so there is no reason to wait for the clock",
      ).toEqual([{ status: "fulfilled", value: "D" }]);
      expect(vi.getTimerCount(), "and the timer was cleared on that path too").toBe(0);

      expect(await settleWithin([], 1_000), "no inputs, no waiting").toEqual([]);
      expect(vi.getTimerCount(), "and no timer at all").toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("ex6 - firstMatching() takes the first answer that is any good", async () => {
    const a = hold<number>();
    const b = hold<number>();
    const c = hold<number>();
    const promise = firstMatching([a.promise, b.promise, c.promise], (n) => n > 10);
    const settledYet = watch(promise);
    promise.catch(() => {});

    b.resolve(5);
    await settle();
    expect(
      settledYet(),
      "a value that fails the predicate is not an answer - keep waiting",
    ).toBe(false);

    c.resolve(42);
    expect(
      await promise,
      "the first MATCHING value wins as soon as it arrives - the first input " +
        "is still pending here and never settles at all",
    ).toBe(42);

    await expect(
      firstMatching(
        [Promise.resolve(1), Promise.reject(new Error("x")), Promise.resolve(2)],
        (n) => n > 10,
      ),
      "when everything has settled and nothing matched, that is a failure - " +
        "and a rejection is simply a value that did not match",
    ).rejects.toThrow("no result matched");

    await expect(
      firstMatching<number>([], () => true),
      "no inputs cannot match either",
    ).rejects.toThrow("no result matched");
  });

  test("ex7 - settledStream() hands results over as they land", async () => {
    const a = hold<string>();
    const b = hold<string>();
    const c = hold<string>();
    const seen: Array<[number, string]> = [];

    const consumed = (async () => {
      for await (const entry of settledStream([a.promise, b.promise, c.promise])) {
        seen.push([
          entry.index,
          entry.result.status === "fulfilled"
            ? entry.result.value
            : (entry.result.reason as Error).message,
        ]);
      }
    })();

    c.resolve("C");
    await settle();
    expect(
      seen,
      "the third input landed first, and the consumer hears about it first - " +
        "tagged with the index it came from, because completion order alone " +
        "would be useless",
    ).toEqual([[2, "C"]]);

    a.reject(new Error("A failed"));
    await settle();
    expect(
      seen,
      "a rejection is an entry like any other: this generator never throws",
    ).toEqual([
      [2, "C"],
      [0, "A failed"],
    ]);

    b.resolve("B");
    await consumed;
    expect(
      seen,
      "and it ends after exactly one entry per input",
    ).toEqual([
      [2, "C"],
      [0, "A failed"],
      [1, "B"],
    ]);

    const none: unknown[] = [];
    for await (const entry of settledStream<string>([])) none.push(entry);
    expect(none, "an empty input ends immediately without yielding").toEqual([]);
  });

  test("ex8 - firstQuorum() stops as soon as the answer is decided", async () => {
    const a = hold<string>();
    const b = hold<string>();
    const c = hold<string>();
    const promise = firstQuorum([a.promise, b.promise, c.promise], 2);
    const settledYet = watch(promise);
    promise.catch(() => {});

    a.resolve("north");
    await settle();
    expect(settledYet(), "one vote is not a quorum of two").toBe(false);

    b.resolve("south");
    await settle();
    expect(
      settledYet(),
      "and two votes that disagree are not a quorum either - but with one " +
        "voter left it is still reachable, so keep waiting",
    ).toBe(false);

    c.resolve("north");
    expect(
      await promise,
      "the third vote agrees with the first, so that value has its two",
    ).toBe("north");

    const d = hold<string>();
    const e = hold<string>();
    const f = hold<string>();
    const doomed = firstQuorum([d.promise, e.promise, f.promise], 2);
    doomed.catch(() => {});
    d.resolve("x");
    e.resolve("y");
    f.reject(new Error("f is down"));
    await expect(
      doomed,
      "every vote is in and nothing reached two, so there is no quorum - a " +
        "rejection is a lost vote, not a failure of the whole call",
    ).rejects.toThrow("no quorum");

    const g = hold<string>();
    const h = hold<string>();
    const hopeless = firstQuorum([g.promise, h.promise], 2);
    hopeless.catch(() => {});
    g.reject(new Error("g is down"));
    await expect(
      hopeless,
      "with two voters and a quorum of two, one lost vote makes it impossible " +
        "immediately. Waiting for h would be waiting for an answer that cannot " +
        "change anything - and h never settles",
    ).rejects.toThrow("no quorum");
  });
});
