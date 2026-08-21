# 07 — Generics, part 2

Lesson 06's generics knew nothing about the types they carried, which was the
point — `first<T>` works for every `T` precisely because it never touches one.
Most real generic code is not like that. It needs the value to have a `length`,
or a key that exists, or a shape it can read a property from. That is what
**constraints** are for.

Alongside them come the two operators that make TypeScript feel like a
programming language for types rather than a labelling scheme: `keyof T`, the
union of a type's property names, and `T[K]`, the type stored at a key. With
those two you can write `pluck(learners, "name")` and have the compiler know
the answer is `string[]` — not because you told it, but because it worked it
out from the object type and the literal you passed.

By the end of this lesson you will have written a function whose third type
parameter is constrained by its second. That sounds academic; it is how every
typed configuration reader, ORM query builder and form library you have used is
built.

## Concept — constraints, `keyof`, `T[K]`, defaults

**Constraints.** `extends` in a type parameter list means "must be at least
this":

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return b.length > a.length ? b : a;   // .length is available now
}

longest("abc", "de");     // string
longest([1, 2], [3]);     // number[]
longest(1, 2);            // Argument of type 'number' is not assignable to
                          // parameter of type '{ length: number }'
```

Two things happened at once: inside the function you may use what the
constraint promises, and outside it callers are rejected if they cannot deliver.
Note that `T` is still inferred as the *specific* type — `string`, not
`{ length: number }` — which is why the return type is useful.

**`keyof`** turns a type into a union of its property names:

```ts
interface Learner { id: string; name: string; streak: number }

type LearnerKey = keyof Learner;    // "id" | "name" | "streak"
```

**Indexed access types** read the type at a key:

```ts
type Streak = Learner["streak"];        // number
type Either = Learner["id" | "name"];   // string
```

Put them together and you get the single most reusable generic signature in the
language:

```ts
function get<T, K extends keyof T>(item: T, key: K): T[K] {
  return item[key];
}

const learner: Learner = { id: "a", name: "Ada", streak: 12 };
get(learner, "streak");   // number
get(learner, "nope");     // Argument of type '"nope"' is not assignable to
                          // parameter of type 'keyof Learner'
```

Why two type parameters instead of `key: keyof T`? Because `K` is inferred as
the *literal* `"streak"`, so `T[K]` is `number`. With `key: keyof T` the return
type would be `T[keyof T]` — `string | number` — and every caller would be back
to narrowing. Precision at the call site is the whole reason for the extra
parameter.

**Default type arguments** work like default values:

```ts
class Registry<T = string> {
  private readonly entries = new Map<string, T>();
}

new Registry();          // Registry<string>
new Registry<number>();  // Registry<number>
```

**Generic classes** parameterise their fields and methods together. The type
parameter belongs to the *instance*, so it is fixed at construction, while a
method may still declare parameters of its own. There is one rule worth
knowing: static members cannot use the class's type parameter, because there is
no instance to fix it.

## Exercise 1 — pluck

Edit `ex1/solution.ts`. Rewrite `pluck` so the key must be a real property and
the result carries that property's type:

- `pluck(learners, "name")` → `["Ada", "Eli"]`, typed `string[]`
- `pluck(learners, "streak")` → `[12, 3]`, typed `number[]`
- `pluck([], "name")` → `[]`
- `pluck(learners, "nickname")` must not compile

Two type parameters: the element type and the key. The body is a one-line
`map`.

```
uv run dojo test typescript 07_generics_2 ex1
```

## Exercise 2 — a constraint that demands structure

Edit `ex2/solution.ts`. Constrain `longest` so its arguments must have a
`length`, and return the longer one:

- `longest("abc", "de")` → `"abc"`
- `longest([1, 2], [3])` → `[1, 2]`
- `longest("ab", "cd")` → `"ab"` — on a tie, the **first** argument wins
- `longest(1, 2)` must not compile

```
uv run dojo test typescript 07_generics_2 ex2
```

## Exercise 3 — a generic class with a default

Edit `ex3/solution.ts`. Give `Registry` a type parameter defaulting to
`string`, and implement the four members over the internal `Map`:

- `set(key, value)` stores a value
- `get(key)` returns it, or `undefined` for a key that was never set
- `has(key)` returns a boolean
- `size` (a getter) returns how many keys are stored

```ts
const scores = new Registry<number>();
scores.set("ada", 90);
scores.get("ada");      // 90, typed number | undefined
scores.get("nobody");   // undefined
new Registry().get("ts");  // typed string | undefined - the default
```

Setting the same key twice replaces the value; the size stays at 1.

```
uv run dojo test typescript 07_generics_2 ex3
```

## Exercise 4 — indexBy

Edit `ex4/solution.ts`. Rewrite `indexBy` so it returns a `Map` keyed by the
chosen property:

- `indexBy(learners, "id")` → a `Map<string, Learner>` where `get("a")` is the
  whole learner object
- `indexBy(learners, "streak")` → a `Map<number, Learner>`
- when two items share a key, the **last** one wins (a `Map` overwrites)
- `indexBy(learners, "missing")` must not compile

```
uv run dojo test typescript 07_generics_2 ex4
```

## Challenge — getIn (harder)

Edit `challenge/solution.ts`. Implement a two-level typed getter:

```ts
const config = {
  server: { host: "localhost", port: 8080 },
  logging: { level: "debug", json: false },
};

getIn(config, "server", "port");     // 8080, typed number
getIn(config, "logging", "level");   // "debug", typed string
getIn(config, "server", "colour");   // must not compile
```

Honest difficulty note: three type parameters, and the third one's constraint
mentions the second (`K2 extends keyof T[K1]`). The body is one expression;
everything hard is in the signature, and getting it wrong produces error
messages that are worth reading slowly.

```
uv run dojo test typescript 07_generics_2 challenge
```

## Review — firstWith

Edit `review1/solution.ts`. Implement `firstWith(items, key, value)`, returning
the first item whose property equals the value:

- `firstWith(learners, "name", "Eli")` → the Eli object
- `firstWith(learners, "streak", 12)` → the Ada object
- `firstWith(learners, "name", "Grace")` → `undefined`
- `firstWith(learners, "streak", "twelve")` must not compile — the value's type
  comes from the key

```
uv run dojo test typescript 07_generics_2 review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/07_generics_2. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { pluck } from "./ex1/solution";
import { longest } from "./ex2/solution";
import { Registry } from "./ex3/solution";
import { indexBy } from "./ex4/solution";
import { getIn } from "./challenge/solution";
import { firstWith } from "./review1/solution";

const learners = [
  { id: "a", name: "Ada", streak: 12 },
  { id: "b", name: "Eli", streak: 3 },
];

describe("07_generics_2", () => {
  test("ex1 - pluck() collects one property from every item", () => {
    expect(pluck(learners, "name"), "the names, in input order").toEqual(["Ada", "Eli"]);
    expect(pluck(learners, "streak"), "the streaks, as numbers").toEqual([12, 3]);
    expect(pluck([], "name"), "no items means no values").toEqual([]);
  });

  test("ex2 - longest() compares by length", () => {
    expect(longest("abc", "de"), "'abc' is longer than 'de'").toBe("abc");
    expect(longest([1, 2], [3]), "arrays have a length too - the constraint covers both").toEqual([
      1, 2,
    ]);
    expect(
      longest("ab", "cd"),
      "on a tie the FIRST argument wins - reread README ex2 and check your operator",
    ).toBe("ab");
  });

  test("ex3 - Registry stores and returns values of its own type", () => {
    const scores = new Registry<number>();
    scores.set("ada", 90);
    expect(scores.get("ada"), "what went in comes back out").toBe(90);
    expect(scores.has("ada"), "has() reports a key that was set").toBe(true);
    expect(scores.has("nobody"), "and reports a key that was not").toBe(false);
    expect(
      scores.get("nobody"),
      "a missing key is undefined, which is why get() returns T | undefined",
    ).toBeUndefined();
    scores.set("ada", 95);
    expect(scores.size, "setting the same key twice replaces it - size stays 1").toBe(1);

    const titles = new Registry();
    titles.set("ts", "TypeScript");
    expect(titles.get("ts"), "with no type argument the default kicks in").toBe("TypeScript");
  });

  test("ex4 - indexBy() builds a lookup keyed by a property", () => {
    const byId = indexBy(learners, "id");
    expect(byId.get("a"), "the whole item is the value, not just the key").toEqual({
      id: "a",
      name: "Ada",
      streak: 12,
    });
    expect(byId.size, "two items means two entries").toBe(2);
    const collided = indexBy(
      [
        { id: "a", name: "first" },
        { id: "a", name: "second" },
      ],
      "id",
    );
    expect(
      collided.get("a"),
      "when two items share a key the LAST one wins - a Map overwrites (README ex4)",
    ).toEqual({ id: "a", name: "second" });
  });

  test("challenge - getIn() reaches two levels down", () => {
    const config = {
      server: { host: "localhost", port: 8080 },
      logging: { level: "debug", json: false },
    };
    expect(getIn(config, "server", "port"), "two keys, one value: 8080").toBe(8080);
    expect(getIn(config, "logging", "level"), "and again on the other branch").toBe("debug");
    expect(getIn(config, "logging", "json"), "false is a value, not a miss").toBe(false);
  });

  test("review1 - firstWith() finds by a named property", () => {
    expect(firstWith(learners, "name", "Eli"), "the whole matching item comes back").toEqual({
      id: "b",
      name: "Eli",
      streak: 3,
    });
    expect(firstWith(learners, "streak", 12), "searching a numeric property works the same").toEqual(
      { id: "a", name: "Ada", streak: 12 },
    );
    expect(
      firstWith(learners, "name", "Grace"),
      "no match means undefined - find() already returns exactly that",
    ).toBeUndefined();
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/07_generics_2. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { pluck } from "./ex1/solution";
import { longest } from "./ex2/solution";
import { Registry } from "./ex3/solution";
import { indexBy } from "./ex4/solution";
import { getIn } from "./challenge/solution";
import { firstWith } from "./review1/solution";

interface Learner {
  id: string;
  name: string;
  streak: number;
}

const learners: Learner[] = [{ id: "a", name: "Ada", streak: 12 }];

describe("07_generics_2", () => {
  test("ex1 - pluck() returns the type stored at the key", () => {
    expectTypeOf(pluck(learners, "name")).toEqualTypeOf<string[]>();
    expectTypeOf(pluck(learners, "streak")).toEqualTypeOf<number[]>();
    // @ts-expect-error - "nickname" is not a key of Learner.
    pluck(learners, "nickname");
  });

  test("ex2 - longest() only accepts things with a length", () => {
    expectTypeOf(longest("a", "bb")).toEqualTypeOf<string>();
    expectTypeOf(longest([1], [2, 3])).toEqualTypeOf<number[]>();
    // @ts-expect-error - a number has no length, so the constraint rejects it.
    longest(1, 2);
  });

  test("ex3 - Registry<T> defaults to string", () => {
    const scores = new Registry<number>();
    expectTypeOf(scores.get("ada")).toEqualTypeOf<number | undefined>();
    expectTypeOf(scores.has("ada")).toEqualTypeOf<boolean>();
    expectTypeOf(scores.size).toEqualTypeOf<number>();
    const titles = new Registry();
    expectTypeOf(titles.get("ts")).toEqualTypeOf<string | undefined>();
    // @ts-expect-error - a Registry<number> stores numbers.
    scores.set("ada", "ninety");
  });

  test("ex4 - indexBy() keys the map by the property type", () => {
    expectTypeOf(indexBy(learners, "id")).toEqualTypeOf<Map<string, Learner>>();
    expectTypeOf(indexBy(learners, "streak")).toEqualTypeOf<Map<number, Learner>>();
    // @ts-expect-error - "missing" is not a key of Learner.
    indexBy(learners, "missing");
  });

  test("challenge - getIn() chains two keyof constraints", () => {
    const config = { server: { host: "localhost", port: 8080 } };
    expectTypeOf(getIn(config, "server", "port")).toEqualTypeOf<number>();
    expectTypeOf(getIn(config, "server", "host")).toEqualTypeOf<string>();
    // @ts-expect-error - "colour" is not a key of config.server.
    getIn(config, "server", "colour");
  });

  test("review1 - firstWith() types the search value by the key", () => {
    expectTypeOf(firstWith(learners, "name", "Ada")).toEqualTypeOf<Learner | undefined>();
    // @ts-expect-error - streak is a number, so a string cannot match it.
    firstWith(learners, "streak", "twelve");
  });
});
```

In plain English:

- **ex1** checks two plucks and an empty list, then asserts the *element type* of
  the result — `string[]` for `"name"`, `number[]` for `"streak"` — and that an
  unknown key is a compile error.
- **ex2** checks strings, arrays and the tie, and proves `longest(1, 2)` is
  rejected by the constraint.
- **ex3** exercises all four members plus the replace-a-key case, then checks
  `Registry<number>.get` is `number | undefined` and that a bare `new Registry()`
  is a registry of strings.
- **ex4** checks the lookup, the size, and the last-wins collision rule; the type
  gate proves the map's key type follows the property.
- **challenge** reaches into two branches of a config object, including a
  `false` value that a truthiness bug would swallow.
- **review1** checks the hit, the numeric-property hit and the miss, and proves
  the search value is typed by the key.

## The teaching point

`<T, K extends keyof T>` is worth memorising as a phrase, because it is the
skeleton of an enormous amount of real library code. Every typed
`get`/`set`/`pick`/`orderBy`/`groupBy` you have used — Lodash's typings, a form
library's `register("user.email")`, an ORM's `select(["id", "name"])` — is that
signature with more decoration. Once you can write it from memory, reading those
libraries' `.d.ts` files stops being intimidating.

The other lesson is subtler and shows up in code review: prefer the *narrowest*
type parameter that does the job. `key: keyof T` and `key: K extends keyof T`
both compile, and only the second gives callers a precise result. The same
instinct applies to constraints — `T extends { length: number }` accepts strings
and arrays, while `T extends string | unknown[]` would accept the same values
and tell the compiler more than it needs to know. Constrain to the shape you
actually use, and no more.

Next: **08_utility_types**, where the standard library's own type helpers —
`Partial`, `Pick`, `Omit`, `Record`, `ReturnType` — turn out to be short
programs written in exactly the syntax you have just learned.
