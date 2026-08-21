# 04 — Unions and narrowing

Up to now every value you have typed has been exactly one thing. Real values
are not so tidy. A cell in a report is a string, a number or a boolean. A
failure is an `Error`, or an HTTP response, or a timeout. A lesson event is a
pass, a fail or a hint, and each one carries different data.

TypeScript's answer is the **union type**, `A | B | C`: a value that is one of
these, and the compiler does not yet know which. What makes unions more than
notation is what happens next — until you *prove* which member you have,
TypeScript only lets you touch what all members share. Proving it is called
**narrowing**, and it is done with the JavaScript you already write: `typeof`,
`instanceof`, `in`, `===`, truthiness, and a plain `switch`.

If you have worked through the SQL track, you have met the shape of this idea
already. `NULL` there is a third possibility that infects every expression
until you handle it explicitly with `IS NULL` or `COALESCE`; `string | null`
here is the same bargain, made by a compiler instead of a query planner. Both
languages are telling you the same thing: the case you did not think about is
the one in production.

## Concept — the compiler follows your control flow

Start with what a union offers before you narrow it:

```ts
function shout(value: string | number) {
  value.toUpperCase();   // Property 'toUpperCase' does not exist on type 'string | number'
  value.toString();      // fine - every member has toString
}
```

That error is not obstruction, it is arithmetic: the union's members are
`string` and `number`, and only their *common* members are available. Prove
which one you have and the whole type opens up:

```ts
function shout(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();   // value: string
  }
  return value.toFixed(2);        // value: number - the only member left
}
```

Notice the second line. After the `if` returns, TypeScript knows the `string`
case is gone and narrows the rest of the function to `number` on its own. This
is **control flow analysis**, and it is the reason TypeScript feels less like
casting and more like reading.

The narrowing tools, and what each is for:

| you write | it narrows | use it for |
|---|---|---|
| `typeof x === "string"` | primitives | `string`, `number`, `boolean`, `bigint`, `symbol`, `undefined`, `function` |
| `x instanceof Error` | class instances | anything built by a constructor |
| `"code" in x` | object shapes | plain objects that differ by property |
| `x.kind === "circle"` | discriminated unions | the workhorse — see below |
| `if (x)` / `x != null` | nullability | dropping `null` and `undefined` |

**The discriminated union** is the pattern worth building a habit around.
Several object types, each with the same property name pinned to a different
*literal* type:

```ts
type Answer =
  | { kind: "yes"; because: string }
  | { kind: "no" };

function render(answer: Answer): string {
  switch (answer.kind) {
    case "yes":
      return `yes, ${answer.because}`;   // narrowed: because is available
    case "no":
      return "no";                       // narrowed: because is not
  }
}
```

The discriminant does not have to be called `kind` and does not have to be a
string — a literal `true`/`false` works just as well, which is how the
`Result` type in this lesson's challenge is built. What matters is that each
member pins it to one literal value, so comparing it tells the compiler which
member it is looking at.

**Exhaustiveness, and why `never` is the hero.** Add a fourth member to
`Answer` and the `switch` above silently starts returning `undefined` for it.
You can make that a compile error instead:

```ts
function assertNever(value: never): never {
  throw new Error(`unhandled variant: ${JSON.stringify(value)}`);
}
```

In a `default` branch of an exhaustive `switch`, the value has been narrowed to
`never` — every member handled, nothing left — so `assertNever(answer)`
compiles. Miss a case, and the value is not `never` any more, so the call fails
with an error naming the type you forgot. That is a compile-time to-do list you
get for free, and it is the single most valuable habit in this lesson.

## Exercise 1 — one parameter, three types

Edit `ex1/solution.ts`. Widen `formatCell` to accept a `string`, a `number` or
a `boolean`, and render each:

- `formatCell("ada")` → `"ada"`
- `formatCell(3)` → `"3.0"` — one decimal place
- `formatCell(9.96)` → `"10.0"`
- `formatCell(true)` → `"yes"`, `formatCell(false)` → `"no"`

`null` is not a member, and the type gate proves it still is not.

```
uv run dojo test typescript 04_unions_narrowing ex1
```

## Exercise 2 — a discriminated union

Edit `ex2/solution.ts`. Finish the `DojoEvent` union — one variant is written
for you, two are missing — and implement `describeEvent(event)`:

- `{ kind: "pass", exercise: "ex2", attempts: 3 }` → `"ex2 passed after 3 attempts"`
- `{ kind: "fail", exercise: "ex2", message: "wrong shape" }` → `"ex2 failed: wrong shape"`
- `{ kind: "hint", exercise: "ex1", tier: 2 }` → `"ex1 revealed hint 2"`

Every variant carries `kind` and `exercise`; each one carries exactly one
member of its own. The type gate checks that `event.tier` exists only in the
`hint` branch and that `{ kind: "skipped" }` is rejected outright.

```
uv run dojo test typescript 04_unions_narrowing ex2
```

## Exercise 3 — narrowing without a discriminant

Edit `ex3/solution.ts`. Widen `Failure` to cover the three things that go wrong
in this program, and implement `explainFailure(failure)`:

- `new Error("boom")` → `"caught: boom"`
- `{ code: 404, detail: "not found" }` → `"http 404: not found"`
- `{ timeoutMs: 250 }` → `"timed out after 250ms"`

None of these has a `kind`, so `switch` has nothing to switch on. Use
`instanceof` for the class and `in` for the plain objects — and think about the
order, because the checks are tried top to bottom.

```
uv run dojo test typescript 04_unions_narrowing ex3
```

## Exercise 4 — make the compiler check your cases

Edit `ex4/solution.ts`. The `Shape` union is complete. Two things are not:

1. `assertNever` currently takes `unknown`, which accepts anything and proves
   nothing. Change its parameter type to `never`.
2. Implement `area(shape)` — `Math.PI * r * r`, `side * side`,
   `width * height` — with a `default` branch that calls `assertNever`.

The gate then smuggles a `{ kind: "triangle" }` past the type system with a
cast and checks that your code throws `unhandled variant: ...` rather than
returning `undefined`. Types are erased at runtime; the assertion is what
survives.

```
uv run dojo test typescript 04_unions_narrowing ex4
```

## Challenge — Result, by hand (moderate)

Edit `challenge/solution.ts`. Finish the `Result` union and the `Partitioned`
interface, then implement both functions:

- `unwrapOr({ ok: true, value: "green" }, "fallback")` → `"green"`
- `unwrapOr({ ok: false, error: "boom" }, "fallback")` → `"fallback"`
- `partition([{ ok: true, value: "a" }, { ok: false, error: "x" }, { ok: true, value: "b" }])`
  → `{ values: ["a", "b"], errors: ["x"] }`
- `partition([])` → `{ values: [], errors: [] }`

This is the type half of the JavaScript world's alternative to exceptions, and
you will meet it again in Rust, Go, and every `neverthrow`-shaped library.
Honest difficulty note: the code is short; the thing to get right is that the
discriminant is a *literal* `true` and a *literal* `false`, not `boolean` in
both variants. Write it the wrong way once and read the error — it is
instructive.

```
uv run dojo test typescript 04_unions_narrowing challenge
```

## Review — describePayment

Edit `review1/solution.ts`. Finish the `Payment` union and implement
`describePayment(payment)`:

- `{ method: "cash" }` → `"cash"`
- `{ method: "card", last4: "4242" }` → `"card ending 4242"`
- `{ method: "transfer", iban: "DE89 3704 0044" }` → `"transfer to DE89 3704 0044"`

```
uv run dojo test typescript 04_unions_narrowing review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/04_unions_narrowing. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { formatCell } from "./ex1/solution";
import { describeEvent } from "./ex2/solution";
import { explainFailure } from "./ex3/solution";
import { area } from "./ex4/solution";
import type { Shape } from "./ex4/solution";
import { partition, unwrapOr } from "./challenge/solution";
import { describePayment } from "./review1/solution";

describe("04_unions_narrowing", () => {
  test("ex1 - formatCell() handles all three member types", () => {
    expect(formatCell("ada"), "a string comes back untouched").toBe("ada");
    expect(
      formatCell(3),
      "numbers get exactly one decimal place: toFixed(1) turns 3 into '3.0'",
    ).toBe("3.0");
    expect(formatCell(9.96), "9.96 to one decimal place rounds up to '10.0'").toBe("10.0");
    expect(formatCell(true), "true renders as 'yes'").toBe("yes");
    expect(
      formatCell(false),
      "false renders as 'no' - and note this is the branch a truthiness check " +
        "on the wrong variable would get wrong",
    ).toBe("no");
  });

  test("ex2 - describeEvent() renders each variant of the union", () => {
    expect(
      describeEvent({ kind: "pass", exercise: "ex2", attempts: 3 }),
      "a pass reads '<exercise> passed after <n> attempts'",
    ).toBe("ex2 passed after 3 attempts");
    expect(
      describeEvent({ kind: "fail", exercise: "ex2", message: "wrong shape" }),
      "a fail reads '<exercise> failed: <message>'",
    ).toBe("ex2 failed: wrong shape");
    expect(
      describeEvent({ kind: "hint", exercise: "ex1", tier: 2 }),
      "a hint reads '<exercise> revealed hint <tier>' - reread README ex2",
    ).toBe("ex1 revealed hint 2");
  });

  test("ex3 - explainFailure() narrows without a discriminant", () => {
    expect(
      explainFailure(new Error("boom")),
      "an Error is recognised with instanceof, and only its message is used",
    ).toBe("caught: boom");
    expect(
      explainFailure({ code: 404, detail: "not found" }),
      "the HTTP-shaped object reads 'http <code>: <detail>' - lowercase http",
    ).toBe("http 404: not found");
    expect(
      explainFailure({ timeoutMs: 250 }),
      "the timeout object reads 'timed out after <n>ms'",
    ).toBe("timed out after 250ms");
  });

  test("ex4 - area() covers every shape, and says so when it cannot", () => {
    expect(area({ kind: "square", side: 3 }), "a square of side 3 has area 9").toBe(9);
    expect(area({ kind: "rect", width: 3, height: 4 }), "3 by 4 is 12").toBe(12);
    expect(
      area({ kind: "circle", radius: 2 }),
      "pi r squared - use Math.PI, not 3.14",
    ).toBeCloseTo(12.566, 3);
    const smuggled = { kind: "triangle", base: 3, height: 4 } as unknown as Shape;
    expect(
      () => area(smuggled),
      "a variant the type system never allowed still has to fail loudly at " +
        "runtime: assertNever throws 'unhandled variant: ...' (README ex4)",
    ).toThrow(/unhandled variant/);
  });

  test("challenge - Result narrows on a boolean discriminant", () => {
    expect(
      unwrapOr({ ok: true, value: "green" }, "fallback"),
      "a success unwraps to its value",
    ).toBe("green");
    expect(
      unwrapOr({ ok: false, error: "boom" }, "fallback"),
      "a failure produces the fallback, never the error text",
    ).toBe("fallback");
    expect(
      partition([
        { ok: true, value: "a" },
        { ok: false, error: "x" },
        { ok: true, value: "b" },
      ]),
      "partition keeps both lists in input order: values ['a','b'], errors ['x']",
    ).toEqual({ values: ["a", "b"], errors: ["x"] });
    expect(
      partition([]),
      "an empty input still returns both arrays, empty - not undefined",
    ).toEqual({ values: [], errors: [] });
  });

  test("review1 - describePayment() renders three methods", () => {
    expect(describePayment({ method: "cash" }), "cash carries no extra data").toBe("cash");
    expect(
      describePayment({ method: "card", last4: "4242" }),
      "a card reads 'card ending <last4>'",
    ).toBe("card ending 4242");
    expect(
      describePayment({ method: "transfer", iban: "DE89 3704 0044" }),
      "a transfer reads 'transfer to <iban>'",
    ).toBe("transfer to DE89 3704 0044");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/04_unions_narrowing. Quoted verbatim in README.md.
//
// Each test narrows inside a function that *takes* the union, because a `const`
// annotated with a union is immediately narrowed by control flow analysis to
// whatever you assigned it - which would make these checks prove nothing.
import { describe, expectTypeOf, test } from "vitest";

import { formatCell } from "./ex1/solution";
import type { DojoEvent } from "./ex2/solution";
import type { Failure } from "./ex3/solution";
import { assertNever } from "./ex4/solution";
import type { Result } from "./challenge/solution";
import type { Payment } from "./review1/solution";

describe("04_unions_narrowing", () => {
  test("ex1 - formatCell() accepts exactly three primitive types", () => {
    expectTypeOf(formatCell).parameters.toEqualTypeOf<[value: string | number | boolean]>();
    // @ts-expect-error - null is not one of the three members.
    formatCell(null);
  });

  test("ex2 - DojoEvent narrows on its kind", () => {
    function inspect(event: DojoEvent): void {
      if (event.kind === "hint") {
        expectTypeOf(event.tier).toEqualTypeOf<number>();
      } else if (event.kind === "pass") {
        expectTypeOf(event.attempts).toEqualTypeOf<number>();
      } else {
        expectTypeOf(event.message).toEqualTypeOf<string>();
      }
      expectTypeOf(event.exercise).toEqualTypeOf<string>();
    }
    inspect({ kind: "pass", exercise: "ex1", attempts: 1 });
    // @ts-expect-error - "skipped" is not one of the three kinds.
    inspect({ kind: "skipped", exercise: "ex1" });
    // @ts-expect-error - a pass event carries attempts, not a message.
    inspect({ kind: "pass", exercise: "ex1", message: "no" });
  });

  test("ex3 - Failure is three unrelated shapes", () => {
    function inspect(failure: Failure): void {
      if (failure instanceof Error) {
        expectTypeOf(failure.message).toEqualTypeOf<string>();
      } else if ("code" in failure) {
        expectTypeOf(failure.detail).toEqualTypeOf<string>();
      } else {
        expectTypeOf(failure.timeoutMs).toEqualTypeOf<number>();
      }
    }
    inspect(new Error("boom"));
    inspect({ code: 500, detail: "server" });
    inspect({ timeoutMs: 10 });
  });

  test("ex4 - assertNever() only accepts a value that cannot exist", () => {
    expectTypeOf(assertNever).parameters.toEqualTypeOf<[value: never]>();
    // @ts-expect-error - a string is a value, and never has none.
    assertNever("triangle");
  });

  test("challenge - the Result discriminant is a literal true/false", () => {
    function inspect(result: Result): void {
      if (result.ok) {
        expectTypeOf(result.value).toEqualTypeOf<string>();
      } else {
        expectTypeOf(result.error).toEqualTypeOf<string>();
      }
    }
    inspect({ ok: true, value: "green" });
    inspect({ ok: false, error: "boom" });
    // @ts-expect-error - a success has no error member.
    inspect({ ok: true, value: "x", error: "y" });
  });

  test("review1 - Payment narrows on its method", () => {
    function inspect(payment: Payment): void {
      if (payment.method === "card") {
        expectTypeOf(payment.last4).toEqualTypeOf<string>();
      } else if (payment.method === "transfer") {
        expectTypeOf(payment.iban).toEqualTypeOf<string>();
      }
    }
    inspect({ method: "cash" });
    // @ts-expect-error - cheque is not a supported method.
    inspect({ method: "cheque" });
  });
});
```

A detail in that file worth stealing: every narrowing check happens inside a
small function that *takes* the union as a parameter. Write
`const event: DojoEvent = { kind: "hint", ... }` instead and control flow
analysis immediately narrows the constant to the one variant you assigned, so
the other branches become unreachable and the checks prove nothing. Narrowing
is about what the compiler does not yet know.

In plain English:

- **ex1** renders all five values and then pins the parameter list to exactly
  `string | number | boolean`; `formatCell(null)` must still be rejected.
- **ex2** renders the three variants, then narrows a `DojoEvent` inside two
  `if`s and reads a member that only exists in that branch. The two
  `@ts-expect-error` lines prove an unknown `kind` and a wrong member are both
  compile errors.
- **ex3** checks all three failure renderings, and the type gate walks the same
  `instanceof` / `in` / else chain to prove each branch narrowed properly.
- **ex4** checks three areas, then casts a triangle past the compiler to prove
  your `default` branch throws. The type gate insists `assertNever` takes
  `never` — with `unknown`, `assertNever("triangle")` would compile and the
  `@ts-expect-error` above it would fail.
- **challenge** unwraps both cases, partitions three results in order, and
  survives an empty list.
- **review1** is ex2 again with a different discriminant name.

## The teaching point

Narrowing is why TypeScript is pleasant to use rather than merely correct.
Other type systems make you cast — "trust me, this is a `Circle`" — and every
cast is a place where you can be wrong. TypeScript instead reads the check you
were going to write anyway and updates what it believes. The code you end up
with is the code you would have written in JavaScript, minus the cases you
would have forgotten.

That last clause is the real payoff, and `assertNever` is how you collect it.
Union types describe *closed* sets — three kinds of event, four shapes, two
outcomes — and closed sets grow. When they do, an exhaustive `switch` with an
`assertNever` default turns "somewhere in this codebase, something now returns
`undefined`" into a list of compile errors pointing at every place that needs a
decision. Teams that use this pattern add union members with confidence; teams
that do not, do not.

Next: **05_literals_enums**, where the string `"circle"` becomes a type in its
own right, and you decide whether you ever need an `enum` again.
