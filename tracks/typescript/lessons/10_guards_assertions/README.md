# 10 — Guards, assertions, `unknown` and `satisfies`

Everything you have typed so far, you wrote. The types were true because you
made them true, and the compiler checked your work against itself.

Now the data comes from outside: `JSON.parse`, a `fetch` response, a form, a
database driver, `localStorage`, a library with optimistic typings. None of it
has been checked, and none of it will be — types are erased, so nothing at
runtime is enforcing the interface you declared. There are exactly two honest
options at that boundary. You can *check* the value, in code, and tell the
compiler what your check proved. Or you can lie with a cast and hope.

This lesson is the three tools for option one — type predicates, assertion
functions, and `unknown` — plus `satisfies`, which is how you check a value you
*did* write without losing what the compiler knew about it.

## Concept — telling the compiler what you proved

**`unknown` is the honest top type.** `any` and `unknown` both accept every
value; the difference is what you can do next:

```ts
const a: any = JSON.parse(text);
a.user.profile.name;        // compiles. Explodes at runtime, maybe.

const u: unknown = JSON.parse(text);
u.user;                     // Error: 'u' is of type 'unknown'.
```

`any` switches checking off — and it spreads, because everything derived from an
`any` is an `any`. `unknown` keeps checking on and forces a narrowing step. The
whole point of the two is that only one of them makes you look.

**Type predicates** let a *function* narrow, which `typeof` alone cannot do
across a call boundary:

```ts
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

if (isNonEmptyString(title)) {
  title.toUpperCase();   // title: string, inside this block
}
```

The `value is Lesson` return type is a promise the compiler takes at face value.
It does not check that your body actually establishes it — a predicate returning
`true` unconditionally compiles fine and is a lie. That is the trade: you get to
extend narrowing, and you own the correctness of the check.

**Assertion functions** narrow for the rest of the scope, with no `if`:

```ts
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") throw new Error("not a number");
}

assertIsNumber(input);
input.toFixed(2);   // input: number, from here on
```

Two rules bite everyone once. The function has to be a `function` declaration or
a variable with an explicit type annotation — TypeScript will not infer an
`asserts` signature. And it must throw when the assertion fails; returning
normally makes the narrowing false for the rest of the function.

**`satisfies`** checks a value against a type *without* replacing its inferred
type:

```ts
type Endpoint = string | number;

const annotated: Record<string, Endpoint> = { host: "localhost", port: 8080 };
annotated.host.trim();   // Error: host is Endpoint, not string
annotated.hsot;          // no error - the index signature accepts anything

const checked = { host: "localhost", port: 8080 } satisfies Record<string, Endpoint>;
checked.host.trim();     // fine: host is string
checked.hsot;            // Error: no such property
```

The annotation says "treat this as `Record<string, Setting>` from now on"; the
`satisfies` says "check it against that, then carry on knowing exactly what it
is". Since TypeScript 4.9 it has been the right default for configuration
objects, palettes, route tables and anything else where you want validation
without amnesia.

The mental model to leave with: **narrow at the boundary, once, and let the rest
of your program work with real types.** Every `as` deeper than that boundary is
a place where you have decided to be right without checking.

## Exercise 1 — a type guard

Edit `ex1/solution.ts`. Change `isLesson` into a type predicate and implement
it:

- `isLesson({ slug: "01_types", exercises: 4 })` → `true`
- `isLesson({ slug: "01_types", exercises: 4, extra: true })` → `true` — extra
  members are fine
- `isLesson({ slug: "01_types" })` → `false`
- `isLesson({ slug: 1, exercises: 4 })` → `false`
- `isLesson(null)` → `false` — remember `typeof null === "object"`
- `isLesson("01_types")` → `false`

The type gate calls it inside an `if` and checks that `value` narrows to
`Lesson` in the true branch and stays `unknown` in the false one.

```
uv run dojo test typescript 10_guards_assertions ex1
```

## Exercise 2 — an assertion function

Edit `ex2/solution.ts`. Give `assertIsStringArray` an assertion signature and
implement it:

- `["a", "b"]` and `[]` pass silently
- `["a", 1]` and `"a"` throw an `Error` whose message is exactly
  `expected an array of strings`

After the call, the value must be narrowed to `string[]` for the rest of the
scope — that is what the type gate checks.

```
uv run dojo test typescript 10_guards_assertions ex2
```

## Exercise 3 — `unknown`, not `any`

Edit `ex3/solution.ts`. Two functions:

1. `parseJson(text)` returns the parsed value typed **`unknown`**. The type gate
   requires that reading a property off the result does not compile.
2. `readTitle(value)` digs a `title` out of an unknown value:
   - `readTitle(parseJson('{"title":"Unions"}'))` → `"Unions"`
   - `readTitle(parseJson('{"title":5}'))` → `null`
   - `readTitle(parseJson("{}"))` → `null`
   - `readTitle(null)` → `null`, `readTitle("Unions")` → `null`

```
uv run dojo test typescript 10_guards_assertions ex3
```

## Exercise 4 — `satisfies`

Edit `ex4/solution.ts`. Replace the `: Record<string, Setting>` annotation with
a `satisfies` clause, then implement `describeSettings()`:

- it returns `"NIGHTLY x3 (verbose)"` — the label upper-cased, the retry count
  after an `x`, and `" (verbose)"` appended only when `verbose` is true

`settings.label.toUpperCase()` is the tell: it compiles only when `label` has
kept its own type instead of widening to the union.

```
uv run dojo test typescript 10_guards_assertions ex4
```

## Challenge — a validator that collects everything (harder)

Edit `challenge/solution.ts`. Finish the `Validated<T>` union and implement
`validateSubmission(input)`:

- valid input → `{ ok: true, value: { slug, attempts, passed } }`
- `{ slug: 1, attempts: "two", passed: true }` →
  `{ ok: false, errors: ["slug must be a string", "attempts must be a number"] }`
- `{}` → all three messages, in the order `slug`, `attempts`, `passed`
- `"nope"` and `null` → `{ ok: false, errors: ["expected an object"] }`

Honest difficulty note: the logic is straightforward; the discipline is
collecting *every* error rather than returning at the first one, and getting the
messages exactly right. This is also the shape of what `zod` does for you, which
is worth appreciating from the other side once.

```
uv run dojo test typescript 10_guards_assertions challenge
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/10_guards_assertions. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { isLesson } from "./ex1/solution";
import { assertIsStringArray } from "./ex2/solution";
import { parseJson, readTitle } from "./ex3/solution";
import { describeSettings, settings } from "./ex4/solution";
import { validateSubmission } from "./challenge/solution";

describe("10_guards_assertions", () => {
  test("ex1 - isLesson() recognises the shape and rejects the rest", () => {
    expect(isLesson({ slug: "01_types", exercises: 4 }), "the right shape passes").toBe(true);
    expect(
      isLesson({ slug: "01_types", exercises: 4, extra: true }),
      "extra members are fine - structural typing asks what is there, not what is not",
    ).toBe(true);
    expect(isLesson({ slug: "01_types" }), "a missing member fails").toBe(false);
    expect(isLesson({ slug: 1, exercises: 4 }), "a member of the wrong type fails").toBe(false);
    expect(
      isLesson(null),
      "null is the classic miss: typeof null is 'object', so check for it explicitly",
    ).toBe(false);
    expect(isLesson("01_types"), "a string is not a lesson").toBe(false);
  });

  test("ex2 - assertIsStringArray() throws on anything else", () => {
    expect(() => assertIsStringArray(["a", "b"]), "an array of strings passes silently").not.toThrow();
    expect(
      () => assertIsStringArray([]),
      "an empty array passes: every one of its zero elements is a string",
    ).not.toThrow();
    expect(
      () => assertIsStringArray(["a", 1]),
      "one bad element is enough to fail, with that exact message",
    ).toThrow("expected an array of strings");
    expect(() => assertIsStringArray("a"), "a bare string is not an array of strings").toThrow(
      "expected an array of strings",
    );
  });

  test("ex3 - parseJson() and readTitle() handle data nobody typed", () => {
    expect(parseJson('{"title":"Unions"}'), "the parse itself is unchanged").toEqual({
      title: "Unions",
    });
    expect(readTitle(parseJson('{"title":"Unions"}')), "a string title comes back").toBe("Unions");
    expect(
      readTitle(parseJson('{"title":5}')),
      "a title that is not a string is not a title - return null",
    ).toBeNull();
    expect(readTitle(parseJson("{}")), "a missing title is null").toBeNull();
    expect(readTitle(null), "null in, null out - and no exception").toBeNull();
    expect(readTitle("Unions"), "a bare string has no title property").toBeNull();
  });

  test("ex4 - describeSettings() reads members that kept their own types", () => {
    expect(
      describeSettings(),
      "the label upper-cased, the retry count after an x, and the verbose suffix",
    ).toBe("NIGHTLY x3 (verbose)");
    expect(settings.retries, "satisfies changes types, not values").toBe(3);
  });

  test("challenge - validateSubmission() collects every problem", () => {
    expect(
      validateSubmission({ slug: "ex1", attempts: 2, passed: true }),
      "a valid submission comes back as the success variant",
    ).toEqual({ ok: true, value: { slug: "ex1", attempts: 2, passed: true } });
    expect(
      validateSubmission({ slug: 1, attempts: "two", passed: true }),
      "TWO problems means two messages, in the order the README lists them",
    ).toEqual({ ok: false, errors: ["slug must be a string", "attempts must be a number"] });
    expect(
      validateSubmission({}),
      "an empty object is missing all three members",
    ).toEqual({
      ok: false,
      errors: ["slug must be a string", "attempts must be a number", "passed must be a boolean"],
    });
    expect(
      validateSubmission("nope"),
      "a non-object fails with the single 'expected an object' message",
    ).toEqual({ ok: false, errors: ["expected an object"] });
    expect(
      validateSubmission(null),
      "and null takes the same path - typeof null is 'object', so it needs its own check",
    ).toEqual({ ok: false, errors: ["expected an object"] });
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/10_guards_assertions. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Lesson } from "./ex1/solution";
import { isLesson } from "./ex1/solution";
import { assertIsStringArray } from "./ex2/solution";
import { parseJson } from "./ex3/solution";
import { settings } from "./ex4/solution";
import type { Submission, Validated } from "./challenge/solution";
import { validateSubmission } from "./challenge/solution";

describe("10_guards_assertions", () => {
  test("ex1 - isLesson() narrows unknown for its caller", () => {
    function use(value: unknown): void {
      if (isLesson(value)) {
        expectTypeOf(value).toEqualTypeOf<Lesson>();
        expectTypeOf(value.exercises).toEqualTypeOf<number>();
      } else {
        expectTypeOf(value).toEqualTypeOf<unknown>();
      }
    }
    use({});
  });

  test("ex2 - assertIsStringArray() narrows for the rest of the scope", () => {
    function use(value: unknown): void {
      assertIsStringArray(value);
      expectTypeOf(value).toEqualTypeOf<string[]>();
    }
    use(["a"]);
  });

  test("ex3 - parseJson() returns unknown, not any", () => {
    expectTypeOf(parseJson("{}")).toEqualTypeOf<unknown>();
    // @ts-expect-error - unknown has to be narrowed before it can be read.
    parseJson('{"title":"x"}').title;
  });

  test("ex4 - satisfies keeps every member own type", () => {
    expectTypeOf(settings.label).toEqualTypeOf<string>();
    expectTypeOf(settings.retries).toEqualTypeOf<number>();
    expectTypeOf(settings.verbose).toBeBoolean();
    // @ts-expect-error - satisfies does not add an index signature, so a typo is caught.
    settings.retires;
  });

  test("challenge - Validated<T> narrows on ok", () => {
    function use(result: Validated<Submission>): void {
      if (result.ok) {
        expectTypeOf(result.value).toEqualTypeOf<Submission>();
      } else {
        expectTypeOf(result.errors).toEqualTypeOf<string[]>();
      }
    }
    use(validateSubmission({}));
  });
});
```

In plain English:

- **ex1** checks six values, including the two that catch a sloppy
  implementation (`null` and a bare string), and the type gate proves the
  predicate narrows in the `if` and leaves `unknown` alone in the `else`.
- **ex2** checks that valid input passes silently and invalid input throws with
  the exact message; the type gate proves the narrowing persists after the call
  with no `if` in sight.
- **ex3** checks the digging function in six situations and requires
  `parseJson("{}").title` to be a compile error — which is only true if you
  declared `unknown`.
- **ex4** checks one rendered string and asserts the three member types survived
  the constraint; the typo probe proves no index signature crept in.
- **challenge** checks the success variant, a two-error case, a three-error case
  and both non-object cases.

## The teaching point

Types are a compile-time story about runtime values, and at the boundary that
story has to be *earned*. The most common serious bug in TypeScript codebases is
not a wrong type — it is a `fetch(...).then(r => r.json() as User)`, where a
cast asserts something nobody checked, and the wrongness surfaces three
components away as `cannot read properties of undefined`.

The discipline is: `unknown` at the door, one narrowing step, real types
everywhere inside. Whether that narrowing step is hand-written predicates (this
lesson) or a schema library like `zod` (which generates both the check and the
type from one declaration) matters less than *having* one. When you review
TypeScript, the question worth asking about every `as` is: "what would happen if
this were wrong?" — and if the answer is "we would never find out", that is where
a guard belongs.

Next: **11_async_and_modules**, the last teaching lesson — promises, async
iteration, module boundaries, and a capstone that pulls the whole track
together.
