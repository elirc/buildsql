# d18 - Guards, harder (drill set)

Eight problems on predicates that carry real information: guards that prove a
list has a head, guards that add a key, assertion functions, and two
combinators that build guards out of other guards. They drill lesson
**10_guards_assertions**; go back if `value is T` still looks like a return
type.

Both gates run here. `gate.test.ts` checks what the guard *does* at runtime and
`gate.test-d.ts` checks what it *proves* to the compiler - and an exercise is
green only when both agree. That pairing is the point of the set: a guard that
lies is worse than no guard, and only one of the two gates can catch a liar.

## ex1 - prove the list has a head

`isNonEmpty(values)` returns `true` when the array has at least one element,
and narrows it to the tuple type `[T, ...T[]]` so that `values[0]` is a `T`
rather than a `T | undefined`.

- `isNonEmpty([1])` -> `true`, `isNonEmpty([])` -> `false`
- `isNonEmpty([undefined])` -> `true` - one element is one element

The signature is the exercise as much as the body is.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex1
```

## ex2 - prove a key exists

`hasKey(value, key)` reports whether `value` has `key` as its **own** property,
and narrows `value` so that `value[key]` is readable as `unknown`.

- `hasKey({ total: 3 }, "total")` -> `true`, `hasKey({ total: 3 }, "missing")` -> `false`
- `hasKey({ total: undefined }, "total")` -> `true` - the key exists
- an inherited property is **not** an own property, so `in` is the wrong operator

`key` is generic and constrained to `PropertyKey`; the narrowed type is
`Record<K, unknown>`.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex2
```

## ex3 - narrow a string to a list

`isOneOf(allowed, value)` reports whether the string `value` appears in
`allowed`, and narrows it from `string` to the union of the list's literal
types.

- with `const permissions = ["read", "write"] as const`, a `string` that passes
  `isOneOf(permissions, raw)` is `"read" | "write"` inside the branch
- `isOneOf([], "read")` -> `false`

`allowed` is `readonly T[]` where `T extends string`; `value` is a plain
`string`.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex3
```

## ex4 - assert a row or throw

`Row` is `{ id: string; amount: number }`. `assertRow(value)` takes an
`unknown` and either returns normally - after which `value` is a `Row` for the
rest of the scope - or throws a `TypeError` whose message **names the field
that failed**.

- a valid row passes silently
- `{ id: 1, amount: 12 }` throws, and the message contains `id`
- `{ id: "r1" }` throws, and the message contains `amount`
- `null` and `[]` both throw

The signature is `asserts value is Row`, which is a different animal from
`value is Row`: the caller gets narrowing without a branch.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex4
```

## ex5 - filter a discriminated union

`Task` is the union
`{ kind: "email"; to: string } | { kind: "sms"; number: string } | { kind: "push"; token: string }`.

`onlyKind(tasks, kind)` returns the tasks with that discriminant, in input
order - and the return type is the *matching member only*, not `Task[]`.

- `onlyKind(tasks, "email")` -> `{ kind: "email"; to: string }[]`
- `onlyKind([], "email")` -> `[]`
- `onlyKind(tasks, "fax")` is a compile error

The input is never modified.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex5
```

## ex6 - two guards, one built on the other

Two guards in one file.

`isRecord(value)` is `true` for any non-null, non-array object, and narrows to
`Record<string, unknown>`.

- `isRecord({})` -> `true`, `isRecord(null)` -> `false`, `isRecord([1, 2])` -> `false`

`isStringRecord(value)` is `true` when `value` is a record **and every one of
its values is a string**, and narrows to `Record<string, string>`.

- `isStringRecord({ a: "x" })` -> `true`, `isStringRecord({ a: 1 })` -> `false`
- `isStringRecord({})` -> `true` - vacuously

Build the second on the first.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex6
```

## ex7 - lift a guard over a list

`everyIs(guard)` takes a guard for one value and returns a guard for a whole
list: the returned function is `true` when **every** element passes, and it
narrows `readonly T[]` to `readonly S[]`.

- `everyIs(isString)(["a", "b"])` -> `true`, `everyIs(isString)(["a", 1])` -> `false`
- `everyIs(isString)([])` -> `true` - vacuously, like `Array.prototype.every`

The signature has two type parameters, `T` and `S extends T`, and the returned
function's own return type is a type predicate.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex7
```

## ex8 - a guard built from a shape

`objectOf(shape)` takes an object whose values are guards and returns a guard
for an object of the corresponding types.

```ts
const isUser = objectOf({ id: isString, age: isNumber });
```

- `isUser({ id: "u1", age: 30 })` -> `true`, and inside the branch the value is
  `{ id: string; age: number }`
- `isUser({ id: "u1", age: "30" })` -> `false`, `isUser({ id: "u1" })` -> `false`
- `isUser({ id: "u1", age: 30, extra: true })` -> `true` - extra keys are fine
- `isUser(null)` and `isUser([])` -> `false`
- `objectOf({})` accepts any object

`Guard<T>` is given in the stub. You will need a second type that reads the
narrowed type back out of a guard, and a mapped type that applies it to every
member of the shape.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d18_guards_advanced ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Runtime gate for typescript/d18_guards_advanced. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { isNonEmpty } from "./ex1/solution";
import { hasKey } from "./ex2/solution";
import { isOneOf } from "./ex3/solution";
import { assertRow } from "./ex4/solution";
import type { Task } from "./ex5/solution";
import { onlyKind } from "./ex5/solution";
import { isRecord, isStringRecord } from "./ex6/solution";
import { everyIs } from "./ex7/solution";
import { objectOf } from "./ex8/solution";

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number";

const tasks: Task[] = [
  { kind: "email", to: "ada@example.com" },
  { kind: "sms", number: "555-0100" },
  { kind: "email", to: "grace@example.com" },
  { kind: "push", token: "abc" },
];

describe("d18_guards_advanced", () => {
  test("ex1 - isNonEmpty() is true exactly when there is a first element", () => {
    expect(isNonEmpty([1]), "one element is not empty").toBe(true);
    expect(isNonEmpty([]), "an empty array has no first element").toBe(false);
    expect(isNonEmpty([undefined]), "a single undefined is still one element - " +
      "the guard counts entries, it does not judge them (README ex1)").toBe(true);
    expect(isNonEmpty(["a", "b"]), "two elements is also not empty").toBe(true);
  });

  test("ex2 - hasKey() looks at own properties only", () => {
    expect(hasKey({ total: 3 }, "total"), "the key is there").toBe(true);
    expect(hasKey({ total: 3 }, "missing"), "and this one is not").toBe(false);
    expect(hasKey({ total: undefined }, "total"), "a key whose value is undefined " +
      "is still a key - ask whether the property exists, not what it holds").toBe(true);
    const inherited = Object.create({ fromPrototype: 1 }) as object;
    expect(hasKey(inherited, "fromPrototype"), "an inherited property is not an own " +
      "property - the in operator would have said true here (README ex2)").toBe(false);
  });

  test("ex3 - isOneOf() checks membership in a list", () => {
    const permissions = ["read", "write"] as const;
    expect(isOneOf(permissions, "read"), "read is in the list").toBe(true);
    expect(isOneOf(permissions, "delete"), "delete is not").toBe(false);
    expect(isOneOf([], "read"), "an empty list allows nothing").toBe(false);
    expect(isOneOf(permissions, ""), "the empty string is not a permission either").toBe(false);
  });

  test("ex4 - assertRow() throws with the offending field named", () => {
    expect(() => assertRow({ id: "r1", amount: 12 }), "a valid row passes silently").not.toThrow();
    expect(() => assertRow({ id: 1, amount: 12 }), "the message has to name the field " +
      "that failed, so the learner reading the log knows where to look").toThrow(/id/);
    expect(() => assertRow({ id: "r1", amount: "12" }), "and the same for amount").toThrow(
      /amount/,
    );
    expect(() => assertRow(null), "null is not a row").toThrow();
    expect(() => assertRow([]), "and neither is an array").toThrow();
    expect(() => assertRow({ id: "r1" }), "a missing field is as bad as a wrong one").toThrow(
      /amount/,
    );
  });

  test("ex5 - onlyKind() keeps the matching members in order", () => {
    expect(onlyKind(tasks, "email"), "both email tasks, in input order").toEqual([
      { kind: "email", to: "ada@example.com" },
      { kind: "email", to: "grace@example.com" },
    ]);
    expect(onlyKind(tasks, "sms"), "one sms task").toEqual([
      { kind: "sms", number: "555-0100" },
    ]);
    expect(onlyKind([], "email"), "no tasks means no matches, not a crash").toEqual([]);
    expect(onlyKind(tasks, "email").length, "filtering does not mutate the input").toBe(2);
    expect(tasks.length, "and the original list still has all four").toBe(4);
  });

  test("ex6 - isRecord() and isStringRecord() agree about what an object is", () => {
    expect(isRecord({ a: 1 }), "a plain object is a record").toBe(true);
    expect(isRecord({}), "including an empty one").toBe(true);
    expect(isRecord(null), "typeof null is object, which is the oldest trap in " +
      "JavaScript - the guard has to rule it out explicitly (README ex6)").toBe(false);
    expect(isRecord([1, 2]), "an array is not a record here").toBe(false);
    expect(isRecord("a"), "and neither is a string").toBe(false);
    expect(isStringRecord({ a: "x", b: "y" }), "every value is a string").toBe(true);
    expect(isStringRecord({}), "an empty record vacuously has only string values").toBe(true);
    expect(isStringRecord({ a: "x", b: 1 }), "one non-string value fails the whole check").toBe(
      false,
    );
    expect(isStringRecord(null), "and it inherits the null case from isRecord").toBe(false);
  });

  test("ex7 - everyIs() lifts a guard over a list", () => {
    const allStrings = everyIs(isString);
    expect(allStrings(["a", "b"]), "every element is a string").toBe(true);
    expect(allStrings(["a", 1]), "one number spoils it").toBe(false);
    expect(allStrings([]), "an empty list passes vacuously - every() on nothing is " +
      "true, and that is the behaviour the prompt asks for (README ex7)").toBe(true);
    const allNumbers = everyIs(isNumber);
    expect(allNumbers([1, 2, 3]), "the same combinator with a different guard").toBe(true);
    expect(allNumbers([1, "2"]), "and it is still strict").toBe(false);
  });

  test("ex8 - objectOf() builds a guard out of a shape", () => {
    const isUser = objectOf({ id: isString, age: isNumber });
    expect(isUser({ id: "u1", age: 30 }), "both fields match their guards").toBe(true);
    expect(isUser({ id: "u1", age: "30" }), "a wrong field type fails").toBe(false);
    expect(isUser({ id: "u1" }), "a missing field fails").toBe(false);
    expect(isUser({ id: "u1", age: 30, extra: true }), "extra keys are allowed - the " +
      "guard checks the shape it was given and ignores the rest (README ex8)").toBe(true);
    expect(isUser(null), "null is not an object").toBe(false);
    expect(isUser([]), "and an array is not one either").toBe(false);
    const isEmpty = objectOf({});
    expect(isEmpty({ anything: 1 }), "an empty shape accepts any object").toBe(true);
    expect(isEmpty("nope"), "but still not a string").toBe(false);
  });
});
```

This is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d18_guards_advanced. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { isNonEmpty } from "./ex1/solution";
import { hasKey } from "./ex2/solution";
import { isOneOf } from "./ex3/solution";
import type { Row } from "./ex4/solution";
import { assertRow } from "./ex4/solution";
import type { Task } from "./ex5/solution";
import { onlyKind } from "./ex5/solution";
import { isRecord, isStringRecord } from "./ex6/solution";
import { everyIs } from "./ex7/solution";
import { objectOf } from "./ex8/solution";

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number";

describe("d18_guards_advanced", () => {
  test("ex1 - isNonEmpty() narrows to a tuple with a head", () => {
    const rows: number[] = [1, 2];
    if (isNonEmpty(rows)) {
      expectTypeOf(rows).toEqualTypeOf<[number, ...number[]]>();
      expectTypeOf(rows[0]).toEqualTypeOf<number>();
    }
    const names: string[] = [];
    if (isNonEmpty(names)) {
      expectTypeOf(names[0]).toEqualTypeOf<string>();
    }
  });

  test("ex2 - hasKey() puts the key into the type", () => {
    const payload: object = { total: 3 };
    if (hasKey(payload, "total")) {
      expectTypeOf(payload.total).toEqualTypeOf<unknown>();
    }
    const other: object = {};
    // @ts-expect-error - nothing has been proved about this object yet.
    other.total;
  });

  test("ex3 - isOneOf() narrows a string to the allowed union", () => {
    const permissions = ["read", "write"] as const;
    const raw: string = "read";
    if (isOneOf(permissions, raw)) {
      expectTypeOf(raw).toEqualTypeOf<"read" | "write">();
    }
    const levels = ["low", "high"] as const;
    const level: string = "low";
    if (isOneOf(levels, level)) {
      expectTypeOf(level).toEqualTypeOf<"low" | "high">();
    }
  });

  test("ex4 - assertRow() narrows for the rest of the scope", () => {
    const value: unknown = { id: "r1", amount: 12 };
    assertRow(value);
    expectTypeOf(value).toEqualTypeOf<Row>();
    expectTypeOf(value.amount).toEqualTypeOf<number>();
    expectTypeOf(value.id).toEqualTypeOf<string>();
  });

  test("ex5 - onlyKind() returns only the matching member type", () => {
    const tasks: Task[] = [];
    expectTypeOf(onlyKind(tasks, "email")).toEqualTypeOf<{ kind: "email"; to: string }[]>();
    expectTypeOf(onlyKind(tasks, "sms")).toEqualTypeOf<{ kind: "sms"; number: string }[]>();
    expectTypeOf(onlyKind(tasks, "push")).toEqualTypeOf<{ kind: "push"; token: string }[]>();
    // @ts-expect-error - fax is not one of the task kinds.
    onlyKind(tasks, "fax");
  });

  test("ex6 - isRecord() and isStringRecord() narrow to indexable types", () => {
    const value: unknown = { a: 1 };
    if (isRecord(value)) {
      expectTypeOf(value).toEqualTypeOf<Record<string, unknown>>();
      expectTypeOf(value.a).toEqualTypeOf<unknown>();
    }
    const other: unknown = { a: "x" };
    if (isStringRecord(other)) {
      expectTypeOf(other).toEqualTypeOf<Record<string, string>>();
      expectTypeOf(other.a).toEqualTypeOf<string>();
    }
  });

  test("ex7 - everyIs() returns a guard over the whole list", () => {
    const allStrings = everyIs(isString);
    const values: readonly unknown[] = ["a"];
    if (allStrings(values)) {
      expectTypeOf(values).toEqualTypeOf<readonly string[]>();
    }
    const allNumbers = everyIs(isNumber);
    const counts: readonly unknown[] = [1];
    if (allNumbers(counts)) {
      expectTypeOf(counts).toEqualTypeOf<readonly number[]>();
    }
  });

  test("ex8 - objectOf() derives the narrowed type from the shape", () => {
    const isUser = objectOf({ id: isString, age: isNumber });
    const value: unknown = { id: "u1", age: 30 };
    if (isUser(value)) {
      expectTypeOf(value).toEqualTypeOf<{ id: string; age: number }>();
      expectTypeOf(value.age).toEqualTypeOf<number>();
    }
    const isPoint = objectOf({ x: isNumber, y: isNumber });
    const point: unknown = { x: 1, y: 2 };
    if (isPoint(point)) {
      expectTypeOf(point).toEqualTypeOf<{ x: number; y: number }>();
    }
  });
});
```

An exercise is green only when both gates agree about it.
