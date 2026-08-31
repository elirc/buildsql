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
