// Gate for node/03_async_patterns. Quoted verbatim in README.md.
//
// Concurrency is graded by *counting*, never by timing: the gate holds every
// task open with a deferred promise and releases them itself, so "did these
// run at the same time" is a number, not a stopwatch.
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
