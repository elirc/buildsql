# d15 - Conditional types (drill set)

Eight problems on `T extends U ? X : Y`: the question it really asks, what
distribution does to it, and the three "is it *that* type?" probes that every
type-level library ships. They drill lesson **09_mapped_conditional**; reread
its conditional section if the arrow still reads like an `if`.

Every exercise here is **type-level only** - each stub compiles and is wrong,
and the whole gate is `gate.test-d.ts`. `// @ts-expect-error` is an assertion
in reverse: it passes only when the very next line fails to compile, so the
expressions it guards are deliberately kept to one line.

## ex1 - is it an array

`IsArray<T>` is `true` when `T` is any array or tuple type - mutable,
`readonly`, or a fixed-length tuple - and `false` otherwise. The answers are
the *literal* types `true` and `false`, not `boolean`.

- `IsArray<string[]>` -> `true`, `IsArray<readonly number[]>` -> `true`
- `IsArray<[1, 2]>` -> `true`, `IsArray<{ length: number }>` -> `false`

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex1
```

## ex2 - distribute over the union

`ToArray<T>` turns a type into an array of it, **member by member**:

- `ToArray<string>` -> `string[]`
- `ToArray<string | number>` -> `string[] | number[]` (not `(string | number)[]`)
- `ToArray<never>` -> `never`

That last case is the tell: a distributive conditional over the empty union
produces the empty union.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex2
```

## ex3 - and now do not distribute

`ToArrayAll<T>` is the same question with the opposite answer: one array that
holds the whole union.

- `ToArrayAll<string | number>` -> `(string | number)[]`
- `ToArrayAll<never>` -> `never[]`, not `never`

Write it as a conditional type, with distribution deliberately switched off -
returning `T[]` directly is not the exercise.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex3
```

## ex4 - name the family

`Kind<T>` reports which family a type belongs to, as a string literal:
`"string"`, `"number"`, `"boolean"`, `"bigint"`, `"null"`, `"undefined"`,
`"array"`, or `"object"` - and `"other"` for anything left over.

- `Kind<"ready">` -> `"string"` (a literal still belongs to its family)
- `Kind<readonly [1, 2]>` -> `"array"`, and `Kind<{ id: string }>` -> `"object"`
- `Kind<string | number>` -> `"string" | "number"` - it distributes

Order matters: an array *is* an object, so one of those checks has to come
first.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex4
```

## ex5 - widen a literal

`Widen<T>` is what `let` does to a literal, expressed as a type: a string
literal becomes `string`, a numeric literal becomes `number`, `true` becomes
`boolean`, a bigint literal becomes `bigint`. Everything else is returned
untouched, including object types.

- `Widen<"ready">` -> `string`, `Widen<7>` -> `number`, `Widen<10n>` -> `bigint`
- `Widen<"a" | 3>` -> `string | number` (it distributes)
- `Widen<{ id: 1 }>` -> `{ id: 1 }` - only the top level is widened

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex5
```

## ex6 - is it never

`IsNever<T>` is `true` only when `T` is `never`.

- `IsNever<never>` -> `true`
- `IsNever<string>` -> `false`, `IsNever<never | string>` -> `false`
- `IsNever<Extract<"a" | "b", "c">>` -> `true` - the realistic way to get one

The naive version - `T extends never ? true : false` - returns `never` for
`never`, which is neither `true` nor `false`. Work out why before you fix it.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex6
```

## ex7 - is it any

`IsAny<T>` is `true` only for `any`.

- `IsAny<any>` -> `true`
- `IsAny<unknown>` -> `false`, `IsAny<never>` -> `false`, `IsAny<string>` -> `false`

The obvious tests all fail: `any` is assignable to everything *and* everything
is assignable to `any`, so any conditional whose condition mentions `T`
directly takes both branches and returns `boolean`. You need a condition that
is false for every real type and that `any` alone can make true.

The lever: intersecting anything with `any` gives `any`, while intersecting
two unrelated types gives `never`.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex7
```

## ex8 - are these two types identical

`Equals<X, Y>` is `true` when the two types are *identical*, not merely
mutually assignable.

- `Equals<string, string>` -> `true`, `Equals<"a" | "b", "b" | "a">` -> `true`
- `Equals<{ id: string }, { id: string }>` -> `true`, `Equals<never, never>` -> `true`
- `Equals<any, string>` -> `false`, `Equals<unknown, any>` -> `false`
- `Equals<1, number>` -> `false`, `Equals<{ id: string }, { id?: string }>` -> `false`

Mutual assignability is not enough: `any` is assignable both ways to
everything, so the two-sided `extends` test says `true` for `Equals<any,
string>`. The escape hatch is that the compiler compares two *deferred*
conditional types structurally - two generic function types whose bodies are
conditionals are related only when the conditionals are written against
identical types.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d15_conditional_types ex8
```

## The gate

This is the entire gate, `gate.test-d.ts`:

```ts
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
```
