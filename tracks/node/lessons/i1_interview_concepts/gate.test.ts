// Gate for node/i1_interview_concepts. Quoted verbatim in README.md.
//
// Four concepts an interviewer can check in code, plus a review variant. The
// question bank itself is in reading.md - these exercises are the part of it
// that a test can hold you to.
import { describe, expect, test } from "vitest";

import { predictOrder } from "./ex1/solution";
import { run as runSnippet } from "./ex1/snippet";
import { sumWithoutBlocking } from "./ex2/solution";
import { guardOnce, isOperational } from "./ex3/solution";
import { loadCached, loadFresh } from "./ex4/solution";
import { handleRequest } from "./review1/solution";

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

describe("i1_interview_concepts", () => {
  test("ex1 - predictOrder() answers the whiteboard question, cold", async () => {
    const actual = await record(runSnippet);
    expect(actual.length, "sanity check on the gate: the snippet logs seven lines").toBe(7);
    expect(
      divergence(predictOrder(), actual),
      "sync first, then the nextTick queue, then microtasks, then the timers - " +
        "and the checkpoint runs again after EACH timer callback, which is the " +
        "half of the answer most candidates miss",
    ).toBe("");
  });

  test("ex2 - sumWithoutBlocking() shows you know what the single thread costs", async () => {
    const seen: string[] = [];
    setImmediate(() => seen.push("marker"));

    const progress: number[] = [];
    const total = await sumWithoutBlocking(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      3,
      (processed) => {
        progress.push(processed);
        seen.push(`progress-${processed}`);
      },
    );
    await settle();

    expect(total, "the sum of 1..10 is 55, chunked or not").toBe(55);
    expect(
      progress,
      "onProgress reports the RUNNING TOTAL of values handled after each " +
        "chunk: 3, 6, 9, then the short final chunk of one",
    ).toEqual([3, 6, 9, 10]);

    const marker = seen.indexOf("marker");
    expect(
      marker > 0 && marker < seen.length - 1,
      "the callback the gate queued before calling you has to get a turn in " +
        "the middle of the work. If it ran last, you never yielded - and " +
        'awaiting an already-resolved promise is not yielding (README ex2)',
    ).toBe(true);

    const untouched: number[] = [];
    expect(
      await sumWithoutBlocking([], 4, (processed) => untouched.push(processed)),
      "the sum of nothing is 0",
    ).toBe(0);
    expect(untouched, "and there is no progress to report").toEqual([]);
  });

  test("ex3 - guardOnce() and isOperational() are the error-handling questions", async () => {
    const calls: Array<[Error | null, unknown]> = [];
    const guarded = guardOnce<string>((error, value) => calls.push([error, value]));

    guarded(null, "first");
    guarded(null, "second");
    guarded(new Error("late failure"));

    expect(
      calls.length,
      "an error-first callback must be called EXACTLY once. A library that " +
        "calls yours twice runs your continuation twice - a duplicated " +
        "payment, a doubled retry - and the guard is how you survive it",
    ).toBe(1);
    expect(calls[0], "and the call that survives is the first one").toEqual([null, "first"]);

    const seen: string[] = [];
    const buggy = (callback: (error: Error | null, value?: string) => void): void => {
      callback(null, "ok");
      callback(new Error("and again"), undefined); // the bug this guards against
    };
    buggy(guardOnce((error, value) => seen.push(error ? `error:${error.message}` : `ok:${value}`)));
    expect(seen, "the second call is dropped, not forwarded").toEqual(["ok:ok"]);

    expect(
      isOperational(Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" })),
      "a system error carrying a code like ECONNREFUSED is the world " +
        "misbehaving, not your program: operational, handle it and carry on",
    ).toBe(true);
    expect(
      isOperational(Object.assign(new Error("bad email"), { isOperational: true })),
      "an error you marked yourself is operational by definition",
    ).toBe(true);
    expect(
      isOperational(new TypeError("cannot read properties of undefined")),
      "a TypeError is a bug in your code. The process cannot know what state " +
        "it is in, so the honest answer is to crash and be restarted",
    ).toBe(false);
    expect(
      isOperational(new Error("something went wrong")),
      "an unmarked, uncoded error is guilty until proven innocent",
    ).toBe(false);
    expect(
      isOperational({ isOperational: true }),
      "a thrown object that is not an Error is a bug on its own - it has no " +
        "stack, and every catch in the codebase now has two shapes to handle",
    ).toBe(false);
  });

  test("ex4 - the require cache is a fact about your process, not a detail", () => {
    const first = loadCached();
    const second = loadCached();

    expect(
      first,
      "require() caches by resolved filename: the second call returns the very " +
        "same object, and the module body never ran again",
    ).toBe(second);
    expect(
      first.loads,
      "the shipped module counts how many times it has been evaluated - once",
    ).toBe(1);

    const fresh = loadFresh();
    expect(
      fresh,
      "deleting the cache entry before requiring forces a re-evaluation, so " +
        "this is a different object (README ex4)",
    ).not.toBe(first);
    expect(fresh.loads, "and the module body ran a second time").toBe(2);

    expect(
      loadCached(),
      "a fresh load repopulates the cache, so the next cached load returns " +
        "the NEW instance - which is exactly why this trick is a footgun: " +
        "everyone holding the old object keeps it forever",
    ).toBe(fresh);

    expect(loadFresh(), "and again").not.toBe(fresh);
  });

  test("review1 - per-request state, the mistake that only shows up under load", async () => {
    const release: Array<() => void> = [];
    const pause = (): Promise<void> =>
      new Promise<void>((resolve) => {
        release.push(resolve);
      });

    const alice = handleRequest("alice", async (context) => {
      context.log("start");
      await pause();
      context.log(`finish:${context.userId}`);
    });
    const bob = handleRequest("bob", async (context) => {
      context.log("start");
      await pause();
      context.log(`finish:${context.userId}`);
    });

    // Both are now suspended mid-request, which is the situation a server is
    // in whenever two requests overlap.
    await settle();
    for (const resolve of release) resolve();

    expect(
      await alice,
      "each request keeps its own context. If you stored the user in a " +
        "module-level variable, bob overwrote alice while she was awaiting - " +
        "and nothing in your tests would show it until two users arrived at " +
        "once (README review)",
    ).toEqual({ userId: "alice", steps: ["start", "finish:alice"] });
    expect(await bob, "and bob keeps his").toEqual({
      userId: "bob",
      steps: ["start", "finish:bob"],
    });
  });
});
