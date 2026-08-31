// Type gate for typescript/d16_infer_patterns. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { ElementOf } from "./ex1/solution";
import type { FirstArg } from "./ex2/solution";
import type { TailOf } from "./ex3/solution";
import type { LastOf } from "./ex4/solution";
import type { Flatten } from "./ex5/solution";
import type { StateOf } from "./ex6/solution";
import type { UnionToIntersection } from "./ex7/solution";
import type { Curried } from "./ex8/solution";

interface Store {
  subscribe(listener: (state: { count: number }) => void): () => void;
}

interface Poller {
  subscribe(listener: (state: string[]) => void): () => void;
}

describe("d16_infer_patterns", () => {
  test("ex1 - ElementOf<T> pulls the element type out of an array", () => {
    expectTypeOf<ElementOf<string[]>>().toEqualTypeOf<string>();
    expectTypeOf<ElementOf<readonly number[]>>().toEqualTypeOf<number>();
    expectTypeOf<ElementOf<[1, "a"]>>().toEqualTypeOf<1 | "a">();
    expectTypeOf<ElementOf<string>>().toEqualTypeOf<never>();
    const first: ElementOf<{ id: string }[]> = { id: "a" };
    expectTypeOf(first).toEqualTypeOf<{ id: string }>();
  });

  test("ex2 - FirstArg<F> reads only the first parameter", () => {
    expectTypeOf<FirstArg<(id: string, retries: number) => void>>().toEqualTypeOf<string>();
    expectTypeOf<FirstArg<(rows: number[]) => string>>().toEqualTypeOf<number[]>();
    expectTypeOf<FirstArg<() => void>>().toEqualTypeOf<unknown>();
    expectTypeOf<FirstArg<string>>().toEqualTypeOf<never>();
  });

  test("ex3 - TailOf<T> drops the head of a tuple", () => {
    expectTypeOf<TailOf<[1, 2, 3]>>().toEqualTypeOf<[2, 3]>();
    expectTypeOf<TailOf<[string]>>().toEqualTypeOf<[]>();
    expectTypeOf<TailOf<readonly ["a", "b"]>>().toEqualTypeOf<["b"]>();
    expectTypeOf<TailOf<[]>>().toEqualTypeOf<never>();
  });

  test("ex4 - LastOf<T> reads the far end of a tuple", () => {
    expectTypeOf<LastOf<[1, 2, 3]>>().toEqualTypeOf<3>();
    expectTypeOf<LastOf<[string]>>().toEqualTypeOf<string>();
    expectTypeOf<LastOf<readonly ["a", "b"]>>().toEqualTypeOf<"b">();
    expectTypeOf<LastOf<[]>>().toEqualTypeOf<never>();
  });

  test("ex5 - Flatten<T> keeps unwrapping until there is nothing left", () => {
    expectTypeOf<Flatten<number[][][]>>().toEqualTypeOf<number>();
    expectTypeOf<Flatten<string[]>>().toEqualTypeOf<string>();
    expectTypeOf<Flatten<string>>().toEqualTypeOf<string>();
    expectTypeOf<Flatten<readonly (readonly boolean[])[]>>().toEqualTypeOf<boolean>();
    expectTypeOf<Flatten<{ id: string }[][]>>().toEqualTypeOf<{ id: string }>();
  });

  test("ex6 - StateOf<T> digs two levels into a method signature", () => {
    expectTypeOf<StateOf<Store>>().toEqualTypeOf<{ count: number }>();
    expectTypeOf<StateOf<Poller>>().toEqualTypeOf<string[]>();
    expectTypeOf<StateOf<{ subscribe: string }>>().toEqualTypeOf<never>();
    expectTypeOf<StateOf<{ count: number }>>().toEqualTypeOf<never>();
  });

  test("ex7 - UnionToIntersection<U> turns or into and", () => {
    expectTypeOf<UnionToIntersection<{ a: string } | { b: number }>>().toMatchTypeOf<{
      a: string;
      b: number;
    }>();
    expectTypeOf<UnionToIntersection<{ a: string }>>().toEqualTypeOf<{ a: string }>();
    expectTypeOf<
      UnionToIntersection<{ a: string } | { b: number } | { c: boolean }>
    >().toMatchTypeOf<{ a: string; b: number; c: boolean }>();
    const both = { a: "x", b: 1 } as UnionToIntersection<{ a: string } | { b: number }>;
    expectTypeOf(both.b).toEqualTypeOf<number>();
  });

  test("ex8 - Curried<F> splits a signature one argument at a time", () => {
    expectTypeOf<Curried<(a: string, b: number) => boolean>>().toEqualTypeOf<
      (a: string) => (b: number) => boolean
    >();
    expectTypeOf<Curried<(a: string) => number>>().toEqualTypeOf<(a: string) => number>();
    expectTypeOf<Curried<() => number>>().toEqualTypeOf<() => number>();
    expectTypeOf<Curried<(a: 1, b: 2, c: 3) => 4>>().toEqualTypeOf<
      (a: 1) => (b: 2) => (c: 3) => 4
    >();
    expectTypeOf<Curried<string>>().toEqualTypeOf<never>();
  });
});
