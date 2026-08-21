// Type gate for typescript/02_functions. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { progressLine } from "./ex1/solution";
import { bestOf } from "./ex2/solution";
import { forEachTrack } from "./ex3/solution";
import { duplicate } from "./ex4/solution";
import { retry } from "./challenge/solution";
import { padCell } from "./review1/solution";

describe("02_functions", () => {
  test("ex1 - progressLine() has an optional second parameter", () => {
    expectTypeOf(progressLine).parameters.toEqualTypeOf<[done: number, total?: number]>();
    expectTypeOf(progressLine).returns.toEqualTypeOf<string>();
  });

  test("ex2 - bestOf() is variadic", () => {
    expectTypeOf(bestOf(1, 2, 3)).toEqualTypeOf<number>();
    expectTypeOf(bestOf()).toEqualTypeOf<number>();
    // @ts-expect-error - every argument is a score, so a string is not one.
    bestOf(1, "2");
  });

  test("ex3 - forEachTrack() hands its callback (name, index)", () => {
    const seen: string[] = [];
    forEachTrack(["a"], (name, index) => {
      expectTypeOf(name).toEqualTypeOf<string>();
      expectTypeOf(index).toEqualTypeOf<number>();
    });
    // A `=> void` callback may return anything; push returns a number and that
    // is still assignable. This line has to compile.
    forEachTrack(["a"], (name) => seen.push(name));
    expectTypeOf(forEachTrack).returns.toEqualTypeOf<void>();
    // @ts-expect-error - the first callback parameter is a name, not a number.
    forEachTrack(["a"], (n: number) => String(n));
  });

  test("ex4 - duplicate() keeps the argument type", () => {
    expectTypeOf(duplicate("ab")).toEqualTypeOf<string>();
    expectTypeOf(duplicate(2)).toEqualTypeOf<number>();
    // @ts-expect-error - only strings and numbers have an overload.
    duplicate(true);
  });

  test("challenge - retry() is (number, () => string) => string", () => {
    expectTypeOf(retry).parameters.toEqualTypeOf<[attempts: number, action: () => string]>();
    expectTypeOf(retry).returns.toEqualTypeOf<string>();
    // @ts-expect-error - the action has to produce the string retry returns.
    retry(1, () => 42);
  });

  test("review1 - padCell() has two optional parameters", () => {
    expectTypeOf(padCell).parameters.toEqualTypeOf<
      [text: string, width?: number, filler?: string]
    >();
  });
});
