// Type gate for typescript/10_guards_assertions. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Lesson } from "./ex1/solution";
import { isLesson } from "./ex1/solution";
import { assertIsStringArray } from "./ex2/solution";
import { parseJson } from "./ex3/solution";
import { settings } from "./ex4/solution";
import type { Submission, Validated } from "./challenge/solution";
import { validateSubmission } from "./challenge/solution";

describe("10_guards_assertions", () => {
  test("ex1 - isLesson() narrows unknown for its caller", () => {
    function use(value: unknown): void {
      if (isLesson(value)) {
        expectTypeOf(value).toEqualTypeOf<Lesson>();
        expectTypeOf(value.exercises).toEqualTypeOf<number>();
      } else {
        expectTypeOf(value).toEqualTypeOf<unknown>();
      }
    }
    use({});
  });

  test("ex2 - assertIsStringArray() narrows for the rest of the scope", () => {
    function use(value: unknown): void {
      assertIsStringArray(value);
      expectTypeOf(value).toEqualTypeOf<string[]>();
    }
    use(["a"]);
  });

  test("ex3 - parseJson() returns unknown, not any", () => {
    expectTypeOf(parseJson("{}")).toEqualTypeOf<unknown>();
    // @ts-expect-error - unknown has to be narrowed before it can be read.
    parseJson('{"title":"x"}').title;
  });

  test("ex4 - satisfies keeps every member own type", () => {
    expectTypeOf(settings.label).toEqualTypeOf<string>();
    expectTypeOf(settings.retries).toEqualTypeOf<number>();
    expectTypeOf(settings.verbose).toBeBoolean();
    // @ts-expect-error - satisfies does not add an index signature, so a typo is caught.
    settings.retires;
  });

  test("challenge - Validated<T> narrows on ok", () => {
    function use(result: Validated<Submission>): void {
      if (result.ok) {
        expectTypeOf(result.value).toEqualTypeOf<Submission>();
      } else {
        expectTypeOf(result.errors).toEqualTypeOf<string[]>();
      }
    }
    use(validateSubmission({}));
  });
});
