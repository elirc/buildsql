// Gate for node/d05_promise_basics. Quoted verbatim in README.md.
//
// The state machine, without async/await getting in the way. Nothing here is
// timed: the gate holds promises open with its own deferreds and settles them
// itself, and "has this handler run yet" is answered by handing control back to
// the loop a fixed number of times.
import { describe, expect, test } from "vitest";

import { deferred } from "./ex1/solution";
import { mapPromise } from "./ex2/solution";
import { orElse } from "./ex3/solution";
import { tap } from "./ex4/solution";
import { inspect } from "./ex5/solution";
import { chainSequential } from "./ex6/solution";
import { adoptThenable } from "./ex7/solution";
import { createSettleable } from "./ex8/solution";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** A deferred of the gate's own, so the gate never depends on ex1 to test ex5. */
function hold<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (reason: unknown) => void } {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  promise.catch(() => {});
  return { promise, resolve, reject };
}

describe("d05_promise_basics", () => {
  test("ex1 - deferred() hands out the settle buttons and only honours one", async () => {
    const box = deferred<string>();
    const seen: string[] = [];
    box.promise.then(
      (value) => seen.push(`ok:${value}`),
      (reason) => seen.push(`err:${(reason as Error).message}`),
    );

    expect(box.settled(), "nothing has happened yet").toBe(false);
    box.resolve("alpha");
    expect(
      seen,
      "a promise handler NEVER runs synchronously, not even when the promise " +
        "was settled on the line above. That guarantee is what stops a " +
        "sometimes-sync API from creating races",
    ).toEqual([]);
    expect(box.settled(), "but the promise itself has settled").toBe(true);

    await settle();
    expect(seen, "and now the handler has run, once").toEqual(["ok:alpha"]);

    box.reject(new Error("too late"));
    box.resolve("also too late");
    await settle();
    expect(
      seen,
      "settled means settled: the second and third attempts are ignored, not " +
        "queued and not thrown",
    ).toEqual(["ok:alpha"]);

    const late: string[] = [];
    box.promise.then((value) => late.push(value));
    expect(
      late,
      "a handler attached to an ALREADY settled promise is still asynchronous",
    ).toEqual([]);
    await settle();
    expect(late, "...and still runs").toEqual(["alpha"]);

    const bad = deferred<string>();
    bad.promise.catch(() => {});
    bad.reject(new Error("nope"));
    expect(bad.settled(), "a rejection settles it too").toBe(true);
    await expect(bad.promise, "with the reason it was given").rejects.toThrow("nope");
  });

  test("ex2 - mapPromise() transforms the value and inherits the failures", async () => {
    expect(
      await mapPromise(Promise.resolve(3), (n) => n * 7),
      "the plain case: the value comes out transformed",
    ).toBe(21);

    expect(
      await mapPromise(Promise.resolve("a"), (s) => Promise.resolve(`${s}!`)),
      "a mapper that returns a promise is flattened, not nested - the caller " +
        "must never receive a Promise of a Promise",
    ).toBe("a!");

    await expect(
      mapPromise(Promise.resolve(1), () => {
        throw new Error("mapper blew up");
      }),
      "a throw inside the mapper becomes a rejection of the result. That is " +
        "the whole reason .then takes a callback rather than being a method " +
        "you call after",
    ).rejects.toThrow("mapper blew up");

    let calls = 0;
    const upstream = Promise.reject(new Error("upstream failed"));
    upstream.catch(() => {});
    await expect(
      mapPromise(upstream, () => {
        calls += 1;
        return 1;
      }),
      "a rejected input passes its rejection straight through",
    ).rejects.toThrow("upstream failed");
    expect(
      calls,
      "and the mapper is never called - there is no value to map",
    ).toBe(0);
  });

  test("ex3 - orElse() only reaches for the fallback when it has to", async () => {
    let calls = 0;
    expect(
      await orElse(Promise.resolve("live"), () => {
        calls += 1;
        return "fallback";
      }),
      "a fulfilled promise passes through untouched",
    ).toBe("live");
    expect(calls, "and the fallback is not called at all").toBe(0);

    const seen: unknown[] = [];
    const failed = Promise.reject(new Error("cache miss"));
    failed.catch(() => {});
    expect(
      await orElse(failed, (reason) => {
        seen.push(reason);
        return "computed";
      }),
      "a rejection is handled: the fallback value becomes the result, and the " +
        "returned promise is FULFILLED. A catch that returns is a recovery",
    ).toBe("computed");
    expect(
      (seen[0] as Error).message,
      "the fallback is handed the reason, so it can decide based on it",
    ).toBe("cache miss");

    const alsoFailed = Promise.reject(new Error("first"));
    alsoFailed.catch(() => {});
    expect(
      await orElse(alsoFailed, () => Promise.resolve("async fallback")),
      "a fallback that returns a promise is adopted",
    ).toBe("async fallback");

    const doomed = Promise.reject(new Error("first"));
    doomed.catch(() => {});
    await expect(
      orElse(doomed, () => {
        throw new Error("fallback failed too");
      }),
      "and a fallback that fails replaces the failure rather than hiding it - " +
        "the caller sees the second error, which is the one that actually " +
        "stopped them",
    ).rejects.toThrow("fallback failed too");
  });

  test("ex4 - tap() watches both paths and changes neither", async () => {
    const events: Array<[string, unknown]> = [];
    const value = { id: 1 };

    expect(
      await tap(Promise.resolve(value), (state, payload) => events.push([state, payload])),
      "the value passes through by identity - a tap that copies is not a tap",
    ).toBe(value);
    expect(events, "with the state and the value reported").toEqual([["fulfilled", value]]);

    events.length = 0;
    const failure = new Error("disk full");
    const rejected = Promise.reject(failure);
    rejected.catch(() => {});
    await expect(
      tap(rejected, (state, payload) => events.push([state, payload])),
      "a rejection still reaches the caller unchanged",
    ).rejects.toThrow("disk full");
    expect(
      events,
      "and the observer sees the other branch too. A tap that only fires on " +
        "success is a logger that goes quiet exactly when you need it",
    ).toEqual([["rejected", failure]]);

    await expect(
      tap(Promise.resolve("fine"), () => {
        throw new Error("logger exploded");
      }),
      "an observer that throws is NOT swallowed: it replaces the outcome. " +
        "Silently ignoring it would hide a broken logger forever",
    ).rejects.toThrow("logger exploded");

    const alsoRejected = Promise.reject(new Error("original"));
    alsoRejected.catch(() => {});
    await expect(
      tap(alsoRejected, () => {
        throw new Error("logger exploded");
      }),
      "and the same on the rejection path - the observer error wins",
    ).rejects.toThrow("logger exploded");
  });

  test("ex5 - inspect() reports the state without disturbing it", async () => {
    expect(
      await inspect(Promise.resolve(7)),
      "an already fulfilled promise reports its value",
    ).toEqual({ state: "fulfilled", value: 7 });

    const failure = new Error("boom");
    const rejected = Promise.reject(failure);
    rejected.catch(() => {});
    expect(
      await inspect(rejected),
      "and a rejected one reports its reason - note that inspecting it counts " +
        "as handling it, which is exactly why this helper is useful in tests",
    ).toEqual({ state: "rejected", reason: failure });

    const held = hold<number>();
    expect(
      await inspect(held.promise),
      "a promise that has not settled reports pending rather than hanging. " +
        "The trick is racing it against something you know settles now",
    ).toEqual({ state: "pending" });

    held.resolve(42);
    expect(
      await inspect(held.promise),
      "inspecting it did not consume or change it: once it settles, the same " +
        "promise reports the new state",
    ).toEqual({ state: "fulfilled", value: 42 });

    const doomed = hold<number>();
    expect(await inspect(doomed.promise), "pending again").toEqual({ state: "pending" });
    const boom = new Error("later");
    doomed.reject(boom);
    expect(
      await inspect(doomed.promise),
      "and a promise that rejects after being inspected reports it later",
    ).toEqual({ state: "rejected", reason: boom });
  });

  test("ex6 - chainSequential() runs one at a time, in order", async () => {
    const started: string[] = [];
    const gates = new Map<string, { resolve: (value: string) => void }>();
    const step = (item: string): Promise<string> => {
      started.push(item);
      const held = hold<string>();
      gates.set(item, { resolve: held.resolve });
      return held.promise;
    };

    const promise = chainSequential(["a", "b", "c"], step);
    promise.catch(() => {});
    await settle();
    expect(
      [...started],
      "only the first step may have started: sequential means the next one " +
        "waits for this one to settle, not merely to be created",
    ).toEqual(["a"]);

    gates.get("a")?.resolve("A");
    await settle();
    expect([...started], "one finishing starts exactly one more").toEqual(["a", "b"]);

    gates.get("b")?.resolve("B");
    await settle();
    gates.get("c")?.resolve("C");
    expect(
      await promise,
      "the results come back in input order, which for a sequential chain is " +
        "also completion order",
    ).toEqual(["A", "B", "C"]);

    const indexes: number[] = [];
    expect(
      await chainSequential(["x", "y"], async (item, index) => {
        indexes.push(index);
        return `${item}${index}`;
      }),
      "the step is given the index alongside the item",
    ).toEqual(["x0", "y1"]);
    expect(indexes).toEqual([0, 1]);

    expect(await chainSequential([], async () => "never"), "no items, no work").toEqual([]);

    const attempted: string[] = [];
    const failure = await chainSequential(["p", "q", "r"], async (item) => {
      attempted.push(item);
      if (item === "q") throw new Error("q is broken");
      return item;
    }).then(
      () => undefined,
      (error: unknown) => error as Error,
    );
    expect(
      attempted,
      "a failing step stops the chain - r must never be attempted",
    ).toEqual(["p", "q"]);
    expect(
      failure?.message,
      "and the rejection says which step failed, because index 1 of a " +
        "thousand is the only thing the reader needs",
    ).toBe("step 1 failed");
    expect(
      (failure?.cause as Error)?.message,
      "with the original error kept as the cause, so the real stack survives",
    ).toBe("q is broken");
  });

  test("ex7 - adoptThenable() follows the rules a native promise follows", async () => {
    expect(await adoptThenable(5), "a plain value is simply wrapped").toBe(5);
    expect(await adoptThenable(null), "including null, which is not a thenable").toBe(null);
    expect(
      await adoptThenable(Promise.resolve("x")),
      "a real promise is adopted, not wrapped in another layer",
    ).toBe("x");

    let thenCalls = 0;
    const twice = {
      then(resolve: (value: string) => void): void {
        thenCalls += 1;
        resolve("first");
        resolve("second");
      },
    };
    expect(
      await adoptThenable<string>(twice),
      "the first settlement wins and the rest are ignored - a hand-written " +
        "thenable is allowed to be sloppy, and you are not",
    ).toBe("first");
    expect(thenCalls, "then() is called exactly once").toBe(1);

    let reads = 0;
    const getterThenable = {
      get then() {
        reads += 1;
        return (resolve: (value: string) => void): void => resolve("once");
      },
    };
    expect(await adoptThenable<string>(getterThenable), "a getter still works").toBe("once");
    expect(
      reads,
      "but .then is READ exactly once. Reading it to type-check it and again " +
        "to call it lets a getter hand you two different functions - this is a " +
        "real line in the Promises A+ specification",
    ).toBe(1);

    await expect(
      adoptThenable<string>({
        then(): void {
          throw new Error("bad thenable");
        },
      }),
      "a then() that throws before settling rejects the result",
    ).rejects.toThrow("bad thenable");

    await expect(
      adoptThenable<string>({
        get then(): never {
          throw new Error("hostile getter");
        },
      }),
      "and so does a getter that throws - which is why the read has to be " +
        "inside the try",
    ).rejects.toThrow("hostile getter");

    expect(
      await adoptThenable<string>({
        then(resolve: (value: string) => void): void {
          resolve("done");
          throw new Error("ignored");
        },
      }),
      "but a throw AFTER settling is ignored: the promise is already decided",
    ).toBe("done");

    await expect(
      adoptThenable<string>({
        then(_resolve: (value: string) => void, reject: (reason: unknown) => void): void {
          reject(new Error("nope"));
        },
      }),
      "and the second callback rejects, as it does everywhere else",
    ).rejects.toThrow("nope");
  });

  test("ex8 - createSettleable() is a promise a real Promise will accept", async () => {
    const box = createSettleable<string>();
    const seen: string[] = [];

    box.thenable.then((value) => seen.push(`a:${value}`));
    box.thenable.then((value) => seen.push(`b:${value}`));
    expect(seen, "nothing runs before it settles").toEqual([]);

    box.resolve("go");
    expect(
      seen,
      "and nothing runs synchronously from resolve() either - that is the one " +
        "rule that makes a promise safe to hand out",
    ).toEqual([]);

    await settle();
    expect(
      seen,
      "every registered handler runs, in registration order",
    ).toEqual(["a:go", "b:go"]);

    const late: string[] = [];
    box.thenable.then((value) => late.push(value));
    expect(late, "registering after settling is still asynchronous").toEqual([]);
    await settle();
    expect(late, "...and still delivers the value").toEqual(["go"]);

    box.reject(new Error("too late"));
    await settle();
    expect(seen, "a settled box cannot be re-settled").toEqual(["a:go", "b:go"]);

    expect(
      await Promise.resolve(box.thenable as unknown as PromiseLike<string>),
      "and the whole point: a native Promise adopts it, because all it ever " +
        "asked for was a callable then",
    ).toBe("go");

    const bad = createSettleable<string>();
    const errors: string[] = [];
    bad.thenable.then(null, (reason) => errors.push((reason as Error).message));
    bad.reject(new Error("nope"));
    await settle();
    expect(errors, "the rejection path delivers the reason").toEqual(["nope"]);
    await expect(
      Promise.resolve(bad.thenable as unknown as PromiseLike<string>),
      "and a native Promise adopts the failure too",
    ).rejects.toThrow("nope");
  });
});
