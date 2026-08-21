# 09 — Mapped and conditional types

You have already written mapped types — `MyPartial` and `MyPick` in lesson 08
were exactly that. This lesson takes the two constructs that turn the type
system into something you can genuinely *compute* with: mapped types that
rename their keys as they go, and conditional types that branch, pattern-match
and extract with `infer`.

This is the deep end, and it is worth being honest about how much of it you
need. Most application code uses the built-in utility types and nothing more.
But every library you depend on is written in this language — every ORM's
`select`, every form library's field paths, every `zod` schema's inferred output
type — and the day you need to read one, or fix a type error coming out of one,
this is the material that lets you.

It is also, reliably, where a senior TypeScript interview goes when the
interviewer wants to find your ceiling.

## Concept — key remapping, conditionals, `infer`, distribution

**Mapped types, with modifiers.** The loop from lesson 08, plus `+`/`-` to add
or remove `readonly` and `?`:

```ts
type Loose<T> = { [K in keyof T]?: T[K] };        // add ?     - every member optional
type Concrete<T> = { [K in keyof T]-?: T[K] };    // remove ?  - every member required
```

A `readonly` is added and removed the same way, with the modifier written in
front of the brackets rather than after them: `readonly [K in keyof T]` adds
one, and putting a minus in front of that `readonly` takes it away.

**Key remapping** with `as` lets the output key differ from the input key:

```ts
type Prefixed<T> = { [K in keyof T & string as `on${Capitalize<K>}`]: T[K] };

type Handlers = Prefixed<{ click: () => void; hover: () => void }>;
// { onClick: () => void; onHover: () => void }
```

Three pieces there: `keyof T & string` (template literal types need string
keys), `as <new key>` (the remap), and `Capitalize<K>` (one of four built-in
intrinsic string types — `Uppercase`, `Lowercase`, `Capitalize`,
`Uncapitalize`). A remapped key of `never` *drops* the member entirely, which
is how "filter the keys of an object type" is written.

**Conditional types** are a ternary for types:

```ts
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<"hello">;   // "yes"
type B = IsString<42>;        // "no"
```

`extends` here means "is assignable to", not inheritance.

**`infer`** declares a placeholder inside the pattern and binds it if the match
succeeds:

```ts
type Unwrap<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;

type A = Unwrap<Promise<string>>;              // string
type B = FirstArg<(id: number) => void>;       // number
```

This is pattern matching. `ReturnType`, `Parameters` and `Awaited` are all four
lines of `infer` in a trench coat — go and hover them.

**Distribution** is the rule that surprises everyone. When the checked type is a
*naked* type parameter and you hand it a union, the conditional is applied to
each member separately and the results are unioned:

```ts
type PairEach<T> = T extends unknown ? [T, T] : never;
type X = PairEach<string | number>;   // [string, string] | [number, number]
```

Three steps happened there: the conditional ran once for `string`, once for
`number`, and the two results were unioned.

That is also what makes `Exclude<T, U>` work. It is a one-line conditional that
returns `never` for the members you want gone — and because `never` disappears
from a union, returning it *is* subtraction:

```ts
type Y = Exclude<"a" | "b" | "c", "b">;   // "a" | never | "c"  ->  "a" | "c"
```

To *switch distribution off*, stop the checked type being naked — the
conventional way is a one-element tuple on both sides:

```ts
type PairAll<T> = [T] extends [unknown] ? [T, T] : never;
type Z = PairAll<string | number>;   // [string | number, string | number]
```

## Exercise 1 — remove a modifier

Edit `ex1/solution.ts`. Implement `Mutable<T>` as a mapped type that strips
`readonly` from every member, and implement `thaw(frozen)`, which returns a
writable shallow copy:

- `thaw({ retries: 1, label: "run" })` → an equal but **different** object
- the result is writable at runtime, and typed writable too

```
uv run dojo test typescript 09_mapped_conditional ex1
```

## Exercise 2 — rename the keys as you map them

Edit `ex2/solution.ts`. Implement `Getters<T>`, which turns every member into a
zero-argument getter with a `get`-prefixed name, and implement
`makeGetters(source)`:

```ts
const getters = makeGetters({ name: "Ada", streak: 12 });
getters.getName();     // "Ada",  typed string
getters.getStreak();   // 12,     typed number
```

Only the renamed keys exist on the result — `getters.name` must not compile.
The runtime half needs one cast on the way out; the compiler cannot follow a
property name you built from a string at runtime.

```
uv run dojo test typescript 09_mapped_conditional ex2
```

## Exercise 3 — a conditional type with `infer`

Edit `ex3/solution.ts`. Implement `ElementOf<T>` — the element type if `T` is an
array, otherwise `T` itself — and implement `flattenOnce(items)`:

- `flattenOnce([[1, 2], [3]])` → `[1, 2, 3]`
- `flattenOnce([1, 2])` → `[1, 2]`
- `flattenOnce([[[1]], [2]])` → `[[1], 2]` — one level only
- `flattenOnce([])` → `[]`

```
uv run dojo test typescript 09_mapped_conditional ex3
```

## Exercise 4 — distribution, on and off

Edit `ex4/solution.ts`. Three aliases and one function:

1. `MyExclude<T, U>` — remove from union `T` everything assignable to `U`
2. `BoxEach<T>` — distributes, so `BoxEach<string | number>` is
   `string[] | number[]`
3. `BoxAll<T>` — does **not** distribute, so `BoxAll<string | number>` is
   `(string | number)[]`
4. `withoutValues(values, remove)` — the runtime version of `MyExclude`:
   `withoutValues(["a", "b", "c"], ["b"])` → `["a", "c"]`, every occurrence
   removed, order preserved

The two `Box` types differ by four characters. Getting them both right is the
exercise.

```
uv run dojo test typescript 09_mapped_conditional ex4
```

## Challenge — DeepReadonly (harder)

Edit `challenge/solution.ts`. Implement `DeepReadonly<T>` — a mapped type that
recurses into members that are themselves objects — and `deepFreeze(value)`,
which freezes an object and everything inside it:

- `Object.isFrozen` is `true` for the object, its child, and its grandchild
- the values are unchanged
- `frozen.server.port = 8080` must not compile

Honest difficulty note: the type is three lines and recursive; the function is
five lines and recursive. The interesting part is what happens to arrays and
functions, since both are `object` — think about it before you decide your
implementation is finished.

```
uv run dojo test typescript 09_mapped_conditional challenge
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/09_mapped_conditional. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { thaw } from "./ex1/solution";
import { makeGetters } from "./ex2/solution";
import { flattenOnce } from "./ex3/solution";
import { withoutValues } from "./ex4/solution";
import { deepFreeze } from "./challenge/solution";

describe("09_mapped_conditional", () => {
  test("ex1 - thaw() hands back a writable copy", () => {
    const frozen: Readonly<{ retries: number; label: string }> = { retries: 1, label: "run" };
    const copy = thaw(frozen);
    expect(copy, "every member is copied across unchanged").toEqual({ retries: 1, label: "run" });
    expect(copy, "the copy is a new object, not the same reference").not.toBe(frozen);
    copy.label = "nightly";
    expect(copy.label, "and the copy really is writable at runtime").toBe("nightly");
  });

  test("ex2 - makeGetters() builds one getter per member", () => {
    const getters = makeGetters({ name: "Ada", streak: 12 });
    expect(getters.getName(), "the name member becomes getName()").toBe("Ada");
    expect(getters.getStreak(), "the streak member becomes getStreak()").toBe(12);
    expect(
      Object.keys(makeGetters({ name: "x" })),
      "only the renamed keys exist - the original member names are gone",
    ).toEqual(["getName"]);
  });

  test("ex3 - flattenOnce() flattens exactly one level", () => {
    expect(
      flattenOnce([
        [1, 2],
        [3],
      ]),
      "arrays are spread into the result, in order",
    ).toEqual([1, 2, 3]);
    expect(
      flattenOnce([1, 2]),
      "elements that are not arrays are passed through untouched",
    ).toEqual([1, 2]);
    expect(
      flattenOnce([[[1]], [2]]),
      "one level only: the inner [1] survives as an array (README ex3)",
    ).toEqual([[1], 2]);
    expect(flattenOnce([]), "nothing in, nothing out").toEqual([]);
  });

  test("ex4 - withoutValues() removes the listed values", () => {
    expect(
      withoutValues(["a", "b", "c"], ["b"]),
      "'b' is dropped, order is preserved",
    ).toEqual(["a", "c"]);
    expect(
      withoutValues(["a", "b", "a"], ["a"]),
      "every occurrence goes, not just the first",
    ).toEqual(["b"]);
    expect(withoutValues(["a"], []), "removing nothing keeps everything").toEqual(["a"]);
  });

  test("challenge - deepFreeze() freezes all the way down", () => {
    const config = { server: { host: "localhost", ports: { http: 80 } }, debug: false };
    const frozen = deepFreeze(config);
    expect(Object.isFrozen(frozen), "the top level is frozen").toBe(true);
    expect(
      Object.isFrozen(config.server),
      "and so is the nested object - Object.freeze on its own is shallow",
    ).toBe(true);
    expect(
      Object.isFrozen(config.server.ports),
      "and the one below that: the recursion has to reach every level",
    ).toBe(true);
    expect(frozen, "the values are untouched; only writability changed").toEqual({
      server: { host: "localhost", ports: { http: 80 } },
      debug: false,
    });
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/09_mapped_conditional. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Mutable } from "./ex1/solution";
import { thaw } from "./ex1/solution";
import type { Getters } from "./ex2/solution";
import { makeGetters } from "./ex2/solution";
import type { ElementOf } from "./ex3/solution";
import { flattenOnce } from "./ex3/solution";
import type { BoxAll, BoxEach, MyExclude } from "./ex4/solution";
import { withoutValues } from "./ex4/solution";
import type { DeepReadonly } from "./challenge/solution";
import { deepFreeze } from "./challenge/solution";

interface Options {
  readonly retries: number;
  readonly label: string;
}

describe("09_mapped_conditional", () => {
  test("ex1 - Mutable<T> strips readonly from every member", () => {
    expectTypeOf<Mutable<Options>>().toEqualTypeOf<{ retries: number; label: string }>();
    const copy = thaw<Options>({ retries: 1, label: "run" });
    expectTypeOf(copy).toEqualTypeOf<{ retries: number; label: string }>();
  });

  test("ex2 - Getters<T> renames the keys and wraps the values", () => {
    expectTypeOf<Getters<{ name: string; streak: number }>>().toEqualTypeOf<{
      getName: () => string;
      getStreak: () => number;
    }>();
    expectTypeOf(makeGetters({ name: "Ada" }).getName()).toEqualTypeOf<string>();
    // @ts-expect-error - the original member name is not a key of the result.
    makeGetters({ name: "Ada" }).name;
  });

  test("ex3 - ElementOf<T> unwraps one array level with infer", () => {
    expectTypeOf<ElementOf<string[]>>().toEqualTypeOf<string>();
    expectTypeOf<ElementOf<readonly number[]>>().toEqualTypeOf<number>();
    expectTypeOf<ElementOf<number>>().toEqualTypeOf<number>();
    expectTypeOf(flattenOnce([[1], [2]])).toEqualTypeOf<number[]>();
  });

  test("ex4 - distribution is what makes Exclude work", () => {
    expectTypeOf<MyExclude<"a" | "b" | "c", "b">>().toEqualTypeOf<"a" | "c">();
    expectTypeOf<MyExclude<string | number, number>>().toEqualTypeOf<string>();
    expectTypeOf<BoxEach<string | number>>().toEqualTypeOf<string[] | number[]>();
    expectTypeOf<BoxAll<string | number>>().toEqualTypeOf<(string | number)[]>();
    expectTypeOf(withoutValues(["a", "b"] as ("a" | "b")[], ["b"] as "b"[])).toEqualTypeOf<
      "a"[]
    >();
  });

  test("challenge - DeepReadonly<T> recurses into nested objects", () => {
    expectTypeOf<DeepReadonly<{ a: { b: number }; c: string }>>().toEqualTypeOf<{
      readonly a: { readonly b: number };
      readonly c: string;
    }>();
    const frozen = deepFreeze({ server: { port: 80 } });
    expectTypeOf(frozen.server.port).toEqualTypeOf<number>();
    // @ts-expect-error - every member is readonly, all the way down.
    frozen.server.port = 8080;
  });
});
```

In plain English:

- **ex1** checks the copy is equal, is a *different object*, and is writable;
  the type gate checks `Mutable<Options>` has lost every `readonly`.
- **ex2** calls both generated getters and checks the result has only the
  renamed keys. The type gate compares `Getters<...>` to the object type you
  should have produced, and proves the old key is gone.
- **ex3** flattens one level in four situations, and the type gate checks
  `ElementOf` against an array, a readonly array and a non-array.
- **ex4** checks the runtime filter, then the four type-level facts —
  `MyExclude` twice, and the distributing/non-distributing pair.
- **challenge** checks all three levels are frozen and that the type is readonly
  all the way down.

## The teaching point

The honest framing for this lesson is: you are learning to *read* this, and
occasionally to write a small amount of it. A codebase full of clever mapped
types is a codebase with slow editors, incomprehensible error messages, and one
person who understands the types. TypeScript even has a guard rail —
"Type instantiation is excessively deep and possibly infinite" — which you meet
by writing exactly the kind of recursive type this lesson's challenge builds.

Where it genuinely pays: at the boundary between your code and a shape you do
not control. Deriving a form's field names from a schema, generating a typed
event map, turning an API's response type into the shape your UI wants — those
are single derivations that keep dozens of call sites honest. That is worth a
lot. Turning three interfaces into one four-line conditional type because it is
"DRY" is not.

Next: **10_guards_assertions**, where types meet data you did not write — JSON,
form input, third-party responses — and you learn the honest ways to cross that
line.
