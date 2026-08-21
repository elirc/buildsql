// Type gate for typescript/11_async_and_modules. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Lesson } from "./ex1/solution";
import { loadLesson } from "./ex1/solution";
import { bothOf } from "./ex2/solution";
import { collect, pages } from "./ex3/solution";
import { LEGACY_VERSION, slugify } from "./ex4/legacy.js";
import { lessonSlug } from "./ex4/solution";
import type { TaskResult } from "./challenge/solution";
import { runTasks } from "./challenge/solution";

describe("11_async_and_modules", () => {
  test("ex1 - loadLesson() is declared to return a promise", () => {
    expectTypeOf(loadLesson).returns.toEqualTypeOf<Promise<Lesson>>();
    // @ts-expect-error - a slug is a string.
    loadLesson(4);
  });

  test("ex2 - bothOf() resolves to a tuple of the two task results", () => {
    expectTypeOf(
      bothOf(
        () => Promise.resolve(1),
        () => Promise.resolve("x"),
      ),
    ).toEqualTypeOf<Promise<[number, string]>>();
    // @ts-expect-error - the tasks are functions returning promises, not promises.
    bothOf(Promise.resolve(1), Promise.resolve("x"));
  });

  test("ex3 - collect() keeps the element type of the sequence", () => {
    expectTypeOf(collect(pages(["a"], 1))).toEqualTypeOf<Promise<string[][]>>();
    async function numbers(): Promise<number[]> {
      return collect(
        (async function* () {
          yield 1;
        })(),
      );
    }
    expectTypeOf(numbers).returns.toEqualTypeOf<Promise<number[]>>();
  });

  test("ex4 - the declaration file describes both exports", () => {
    expectTypeOf(slugify).toEqualTypeOf<(title: string) => string>();
    expectTypeOf(LEGACY_VERSION).toEqualTypeOf<string>();
    expectTypeOf(lessonSlug).parameters.toEqualTypeOf<[index: number, title: string]>();
    // @ts-expect-error - slugify was declared to take a string.
    slugify(42);
  });

  test("challenge - TaskResult<T> narrows on ok", () => {
    function inspect(result: TaskResult<string>): void {
      if (result.ok) {
        expectTypeOf(result.value).toEqualTypeOf<string>();
      } else {
        expectTypeOf(result.error).toEqualTypeOf<string>();
      }
    }
    inspect({ ok: true, value: "x" });
    expectTypeOf(runTasks([async () => 1], 2)).toEqualTypeOf<Promise<TaskResult<number>[]>>();
  });
});
