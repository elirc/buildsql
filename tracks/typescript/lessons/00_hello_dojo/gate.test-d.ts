// Type gate for typescript/00_hello_dojo. Quoted verbatim in README.md.
//
// `*.test-d.ts` files are graded by `tsc`, not by running them: every
// assertion here is about the *types* your code declares. They run in the
// same `dojo test` command as gate.test.ts, and a type failure fails the
// exercise exactly like a wrong value does.
import { describe, expectTypeOf, test } from "vitest";

import { greet } from "./ex1/solution";
import { parseLessonNumber } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - greet() is (name: string) => string", () => {
    expectTypeOf(greet).parameters.toEqualTypeOf<[name: string]>();
    expectTypeOf(greet).returns.toEqualTypeOf<string>();
  });

  test("ex3 - parseLessonNumber() is declared to return a number", () => {
    expectTypeOf(parseLessonNumber).returns.toEqualTypeOf<number>();
    // @ts-expect-error - a slug is a string; passing a number must not compile.
    parseLessonNumber(7);
  });
});
