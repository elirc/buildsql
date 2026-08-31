// Type gate for typescript/d15_conditional_types. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { IsArray } from "./ex1/solution";
import type { ToArray } from "./ex2/solution";
import type { ToArrayAll } from "./ex3/solution";
import type { Kind } from "./ex4/solution";
import type { Widen } from "./ex5/solution";
import type { IsNever } from "./ex6/solution";
import type { IsAny } from "./ex7/solution";
import type { Equals } from "./ex8/solution";

describe("d15_conditional_types", () => {
  test("ex1 - IsArray<T> answers with a literal boolean", () => {
    expectTypeOf<IsArray<string[]>>().toEqualTypeOf<true>();
    expectTypeOf<IsArray<readonly number[]>>().toEqualTypeOf<true>();
    expectTypeOf<IsArray<[1, 2]>>().toEqualTypeOf<true>();
    expectTypeOf<IsArray<string>>().toEqualTypeOf<false>();
    expectTypeOf<IsArray<{ length: number }>>().toEqualTypeOf<false>();
    const yes: IsArray<number[]> = true;
    expectTypeOf(yes).toEqualTypeOf<true>();
    // @ts-expect-error - IsArray<string> is the literal false, so true does not fit.
    const no: IsArray<string> = true;
  });

  test("ex2 - ToArray<T> distributes over a union", () => {
    expectTypeOf<ToArray<string>>().toEqualTypeOf<string[]>();
    expectTypeOf<ToArray<string | number>>().toEqualTypeOf<string[] | number[]>();
    expectTypeOf<ToArray<"a" | "b">>().toEqualTypeOf<"a"[] | "b"[]>();
    expectTypeOf<ToArray<never>>().toEqualTypeOf<never>();
    const split: ToArray<string | number> = ["a", "b"];
    expectTypeOf(split).not.toEqualTypeOf<(string | number)[]>();
  });

  test("ex3 - ToArrayAll<T> keeps the union inside one array", () => {
    expectTypeOf<ToArrayAll<string>>().toEqualTypeOf<string[]>();
    expectTypeOf<ToArrayAll<string | number>>().toEqualTypeOf<(string | number)[]>();
    expectTypeOf<ToArrayAll<never>>().toEqualTypeOf<never[]>();
    const mixed: ToArrayAll<string | number> = ["a", 1];
    expectTypeOf(mixed).toEqualTypeOf<(string | number)[]>();
  });

  test("ex4 - Kind<T> names the family a type belongs to", () => {
    expectTypeOf<Kind<string>>().toEqualTypeOf<"string">();
    expectTypeOf<Kind<"ready">>().toEqualTypeOf<"string">();
    expectTypeOf<Kind<42>>().toEqualTypeOf<"number">();
    expectTypeOf<Kind<boolean>>().toEqualTypeOf<"boolean">();
    expectTypeOf<Kind<null>>().toEqualTypeOf<"null">();
    expectTypeOf<Kind<undefined>>().toEqualTypeOf<"undefined">();
    expectTypeOf<Kind<string[]>>().toEqualTypeOf<"array">();
    expectTypeOf<Kind<readonly [1, 2]>>().toEqualTypeOf<"array">();
    expectTypeOf<Kind<{ id: string }>>().toEqualTypeOf<"object">();
    expectTypeOf<Kind<string | number>>().toEqualTypeOf<"string" | "number">();
  });

  test("ex5 - Widen<T> throws a literal back to its base type", () => {
    expectTypeOf<Widen<"ready">>().toEqualTypeOf<string>();
    expectTypeOf<Widen<7>>().toEqualTypeOf<number>();
    expectTypeOf<Widen<true>>().toEqualTypeOf<boolean>();
    expectTypeOf<Widen<10n>>().toEqualTypeOf<bigint>();
    expectTypeOf<Widen<string>>().toEqualTypeOf<string>();
    expectTypeOf<Widen<"a" | 3>>().toEqualTypeOf<string | number>();
    expectTypeOf<Widen<{ id: 1 }>>().toEqualTypeOf<{ id: 1 }>();
  });

  test("ex6 - IsNever<T> survives the empty union", () => {
    expectTypeOf<IsNever<never>>().toEqualTypeOf<true>();
    expectTypeOf<IsNever<string>>().toEqualTypeOf<false>();
    expectTypeOf<IsNever<undefined>>().toEqualTypeOf<false>();
    expectTypeOf<IsNever<never | string>>().toEqualTypeOf<false>();
    expectTypeOf<IsNever<Extract<"a" | "b", "c">>>().toEqualTypeOf<true>();
  });

  test("ex7 - IsAny<T> catches the type that swallows everything", () => {
    expectTypeOf<IsAny<any>>().toEqualTypeOf<true>();
    expectTypeOf<IsAny<unknown>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<never>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<string>>().toEqualTypeOf<false>();
    expectTypeOf<IsAny<string | number>>().toEqualTypeOf<false>();
  });

  test("ex8 - Equals<X, Y> asks whether two types are identical", () => {
    expectTypeOf<Equals<string, string>>().toEqualTypeOf<true>();
    expectTypeOf<Equals<{ id: string }, { id: string }>>().toEqualTypeOf<true>();
    expectTypeOf<Equals<never, never>>().toEqualTypeOf<true>();
    expectTypeOf<Equals<"a" | "b", "b" | "a">>().toEqualTypeOf<true>();
    expectTypeOf<Equals<any, string>>().toEqualTypeOf<false>();
    expectTypeOf<Equals<unknown, any>>().toEqualTypeOf<false>();
    expectTypeOf<Equals<1, number>>().toEqualTypeOf<false>();
    expectTypeOf<Equals<{ id: string }, { id?: string }>>().toEqualTypeOf<false>();
  });
});
