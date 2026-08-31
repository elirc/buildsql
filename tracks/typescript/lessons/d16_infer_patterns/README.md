# d16 - infer patterns (drill set)

Eight problems on `infer`: the keyword that lets a conditional type ask "what
was in there?" and keep the answer. Arrays, parameter lists, tuple heads and
tails, nested callbacks, and the two recursive patterns interviewers reach for.
They drill lesson **09_mapped_conditional**; go back to its `infer` section if
the keyword still looks like a declaration.

Every exercise is **type-level only** - each stub compiles and is wrong, and
the whole gate is `gate.test-d.ts`. The one rule to keep in front of you:
`infer X` may appear only inside the `extends` clause of a conditional type,
and `X` is usable only in the true branch.

## ex1 - the element of an array

`ElementOf<T>` is the element type of an array or tuple, and `never` for
anything that is not one.

- `ElementOf<string[]>` -> `string`, `ElementOf<readonly number[]>` -> `number`
- `ElementOf<[1, "a"]>` -> `1 | "a"` - a tuple's elements collapse to their union
- `ElementOf<string>` -> `never`

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex1
```

## ex2 - the first parameter

`FirstArg<F>` is the type of a function's **first** parameter - not the whole
parameter tuple.

- `FirstArg<(id: string, retries: number) => void>` -> `string`
- `FirstArg<(rows: number[]) => string>` -> `number[]`
- `FirstArg<() => void>` -> `unknown` - there was nothing to infer, and an
  uninferred `infer` falls back to `unknown`
- `FirstArg<string>` -> `never` - not a function at all

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex2
```

## ex3 - everything after the head

`TailOf<T>` drops the first element of a tuple and returns the rest as a tuple.

- `TailOf<[1, 2, 3]>` -> `[2, 3]`, `TailOf<[string]>` -> `[]`
- `TailOf<readonly ["a", "b"]>` -> `["b"]` - the result is a mutable tuple
- `TailOf<[]>` -> `never` - an empty tuple has no head to drop

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex3
```

## ex4 - the far end of a tuple

`LastOf<T>` is the type of a tuple's **last** element.

- `LastOf<[1, 2, 3]>` -> `3`, `LastOf<[string]>` -> `string`
- `LastOf<readonly ["a", "b"]>` -> `"b"`, `LastOf<[]>` -> `never`

The interesting part is that the variadic part of the pattern does not have to
come last.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex4
```

## ex5 - unwrap all the way down

`Flatten<T>` strips every layer of array nesting, however deep.

- `Flatten<number[][][]>` -> `number`, `Flatten<string[]>` -> `string`
- `Flatten<string>` -> `string` - not an array, so it is already flat
- `Flatten<readonly (readonly boolean[])[]>` -> `boolean`

This one recurses. A conditional type may refer to itself in its own branches,
and here the base case is "`T` is not an array".

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex5
```

## ex6 - the state a store publishes

`StateOf<T>` recovers the state type from a store-like object: something with a
`subscribe` method that takes a listener, where the listener takes the state.

Given `interface Store { subscribe(listener: (state: { count: number }) => void): () => void }`,
`StateOf<Store>` is `{ count: number }`.

- `StateOf<{ subscribe: string }>` -> `never`, `StateOf<{ count: number }>` -> `never`

The `infer` sits two levels deep: inside the parameter of the parameter.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex6
```

## ex7 - turn a union into an intersection

`UnionToIntersection<U>` converts `A | B` into `A & B`.

- `UnionToIntersection<{ a: string } | { b: number }>` -> `{ a: string } & { b: number }`
- `UnionToIntersection<{ a: string }>` -> `{ a: string }`
- three members intersect just as happily as two

There is no direct operator for this. The route is two steps: distribute the
union into a union of *function types* that take it as a parameter, then infer
one parameter type back out. Because parameters are compared
contravariantly, inferring from several call signatures at once produces the
**intersection** of the candidates rather than their union.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex7
```

## ex8 - curry a signature

`Curried<F>` rewrites a function type as a chain of one-argument functions.

- `Curried<(a: string, b: number) => boolean>` -> `(a: string) => (b: number) => boolean`
- `Curried<(a: 1, b: 2, c: 3) => 4>` -> `(a: 1) => (b: 2) => (c: 3) => 4`
- `Curried<(a: string) => number>` -> `(a: string) => number` - already one argument
- `Curried<() => number>` -> `() => number` - nothing to split
- `Curried<string>` -> `never`

Two `infer`s in the outer pattern (the parameter tuple and the return type),
then recursion over the tuple.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d16_infer_patterns ex8
```

## The gate

This is the entire gate, `gate.test-d.ts`:

```ts
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
```
