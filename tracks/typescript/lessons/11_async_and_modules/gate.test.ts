// Gate for typescript/11_async_and_modules. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { loadLesson } from "./ex1/solution";
import { bothOf } from "./ex2/solution";
import { collect, pages } from "./ex3/solution";
import { lessonSlug, version } from "./ex4/solution";
import { runTasks } from "./challenge/solution";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe("11_async_and_modules", () => {
  test("ex1 - loadLesson() resolves or rejects", async () => {
    await expect(
      loadLesson("04_unions_narrowing"),
      "a known slug resolves to its lesson object",
    ).resolves.toEqual({ slug: "04_unions_narrowing", title: "Unions" });
    await expect(
      loadLesson("99_nope"),
      "an unknown slug REJECTS with that exact message - it does not resolve to undefined",
    ).rejects.toThrow("unknown lesson: 99_nope");
  });

  test("ex2 - bothOf() runs its two tasks concurrently", async () => {
    const finished: string[] = [];
    const slow = async () => {
      await delay(30);
      finished.push("slow");
      return "slow-value";
    };
    const fast = async () => {
      await delay(1);
      finished.push("fast");
      return 42;
    };
    const result = await bothOf(slow, fast);
    expect(result, "the tuple is in ARGUMENT order, not completion order").toEqual([
      "slow-value",
      42,
    ]);
    expect(
      finished,
      "the fast task finished first, which only happens if both were started " +
        "before either was awaited - `await a(); await b();` fails here (README ex2)",
    ).toEqual(["fast", "slow"]);
  });

  test("ex3 - pages() yields chunks and collect() drains them", async () => {
    expect(
      await collect(pages(["a", "b", "c"], 2)),
      "three items in pages of two: [['a','b'], ['c']]",
    ).toEqual([["a", "b"], ["c"]]);
    expect(await collect(pages([], 2)), "no items means no pages at all").toEqual([]);
    expect(
      await collect(pages(["a", "b"], 5)),
      "a page bigger than the input yields one short page",
    ).toEqual([["a", "b"]]);
    expect(
      await collect(pages(["a"], 0)),
      "a page size below 1 yields nothing rather than looping forever",
    ).toEqual([]);
  });

  test("ex4 - lessonSlug() uses the module you described", async () => {
    expect(
      lessonSlug(4, "Unions and Narrowing"),
      "two digits, an underscore, then the slugified title",
    ).toBe("04_unions_and_narrowing");
    expect(lessonSlug(11, "Async & Modules!"), "punctuation collapses into single underscores").toBe(
      "11_async_modules",
    );
    expect(version, "the version constant comes straight from legacy.js").toBe("1.4.2");
  });

  test("challenge - runTasks() keeps order, limits concurrency, survives failures", async () => {
    let running = 0;
    let peak = 0;
    const task = (label: string, ms: number) => async () => {
      running += 1;
      peak = Math.max(peak, running);
      await delay(ms);
      running -= 1;
      return label;
    };
    const results = await runTasks(
      [task("a", 20), task("b", 5), task("c", 5), task("d", 1), task("e", 1)],
      2,
    );
    expect(
      results,
      "one result per task, in INPUT order, whatever order they finished in",
    ).toEqual([
      { ok: true, value: "a" },
      { ok: true, value: "b" },
      { ok: true, value: "c" },
      { ok: true, value: "d" },
      { ok: true, value: "e" },
    ]);
    expect(peak, "never more than `limit` tasks in flight at once").toBeLessThanOrEqual(2);
    expect(peak, "and it really did run them in parallel - a peak of 1 means sequential").toBe(2);

    const mixed = await runTasks(
      [
        async () => "fine",
        async () => {
          throw new Error("boom");
        },
        async () => {
          throw "just a string";
        },
      ],
      3,
    );
    expect(
      mixed,
      "a rejected task becomes a failure RESULT - the other tasks still finish, " +
        "and a thrown non-Error is stringified (README challenge)",
    ).toEqual([
      { ok: true, value: "fine" },
      { ok: false, error: "boom" },
      { ok: false, error: "just a string" },
    ]);

    await expect(
      runTasks([async () => "x"], 0),
      "a limit below 1 is a caller mistake: reject with that exact message",
    ).rejects.toThrow("runTasks: limit must be at least 1");
  });
});
