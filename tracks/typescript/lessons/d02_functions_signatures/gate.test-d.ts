// Type gate for typescript/d02_functions_signatures. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { shelfLabel } from "./ex1/solution";
import { joinPath } from "./ex2/solution";
import { countMatching } from "./ex3/solution";
import type { Formatter } from "./ex4/solution";
import { formatAll } from "./ex4/solution";
import { normaliseTag } from "./ex5/solution";
import type { Counter } from "./ex6/solution";
import { makeCounter } from "./ex6/solution";
import { buildQuery } from "./ex7/solution";
import type { Middleware } from "./ex8/solution";
import { runMiddleware } from "./ex8/solution";

describe("d02_functions_signatures", () => {
  test("ex1 - shelfLabel() has one required and one optional parameter", () => {
    expectTypeOf(shelfLabel).parameters.toEqualTypeOf<[title: string, author?: string]>();
    expectTypeOf(shelfLabel).returns.toEqualTypeOf<string>();
    // @ts-expect-error - the title is required.
    shelfLabel();
  });

  test("ex2 - joinPath() takes any number of strings", () => {
    expectTypeOf(joinPath()).toEqualTypeOf<string>();
    expectTypeOf(joinPath("a", "b", "c")).toEqualTypeOf<string>();
    // @ts-expect-error - every segment is a string.
    joinPath("a", 1);
  });

  test("ex3 - countMatching() types its predicate from the element type", () => {
    countMatching(["a"], (value) => {
      expectTypeOf(value).toEqualTypeOf<string>();
      return true;
    });
    expectTypeOf(countMatching).returns.toEqualTypeOf<number>();
    // @ts-expect-error - the predicate receives a string, not a number.
    countMatching(["a"], (value: number) => value > 1);
  });

  test("ex4 - Formatter is a named function type with a default", () => {
    expectTypeOf<Formatter>().toEqualTypeOf<(value: number) => string>();
    expectTypeOf(formatAll).parameters.toEqualTypeOf<
      [values: readonly number[], format?: Formatter]
    >();
    expectTypeOf(formatAll([1])).toEqualTypeOf<string[]>();
    // @ts-expect-error - a formatter has to produce a string.
    formatAll([1], (value) => value * 2);
  });

  test("ex5 - normaliseTag() keeps the shape it was given", () => {
    expectTypeOf(normaliseTag("a")).toEqualTypeOf<string>();
    expectTypeOf(normaliseTag(["a"])).toEqualTypeOf<string[]>();
    // @ts-expect-error - only a string and an array of strings have an overload.
    normaliseTag(1);
  });

  test("ex6 - Counter is three methods, and start is optional", () => {
    expectTypeOf(makeCounter).parameters.toEqualTypeOf<[start?: number]>();
    expectTypeOf(makeCounter()).toEqualTypeOf<Counter>();
    expectTypeOf(makeCounter().next()).toEqualTypeOf<number>();
    expectTypeOf(makeCounter().peek()).toEqualTypeOf<number>();
    expectTypeOf(makeCounter().reset()).toEqualTypeOf<void>();
    // @ts-expect-error - a counter counts from a number.
    makeCounter("10");
  });

  test("ex7 - buildQuery() takes an optional bag of scalars", () => {
    expectTypeOf(buildQuery).parameters.toEqualTypeOf<
      [base: string, params?: Record<string, string | number | boolean>]
    >();
    expectTypeOf(buildQuery("/books")).toEqualTypeOf<string>();
    // @ts-expect-error - an array is not a scalar query value.
    buildQuery("/books", { tags: ["a"] });
  });

  test("ex8 - Middleware takes the value and the rest of the chain", () => {
    expectTypeOf<Middleware>().toEqualTypeOf<
      (input: string, next: (value: string) => string) => string
    >();
    expectTypeOf(runMiddleware).returns.toEqualTypeOf<string>();
    // @ts-expect-error - a middleware has to return the value, not swallow it.
    runMiddleware("a", [(input: string, next: (value: string) => string): void => void next(input)]);
  });
});
