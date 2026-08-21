# 00 — Hello, Dojo (TypeScript)

Welcome to the TypeScript track. This course teaches you TypeScript by making
you write it — every line, yourself. Nothing here autocompletes an answer or
fills in a type for you. You edit a `.ts` file, you run one command, and an
automated gate tells you whether you were right; when you weren't, it shows
you the evidence and the sentence you need to reread.

TypeScript is unusual among the things you can be graded on, because there
are two ways to be wrong. Your code can produce the wrong *value* — a bug you
could have written in plain JavaScript. Or your code can produce the right
value with the wrong *type* — a function that happens to return `7` but is
declared to return `never`, or `any`, or `string | number`. The second kind
compiles, runs, passes a naive test, and then explodes six months later in a
file nobody has opened since. So this track grades both, in one command, from
the very first lesson.

That is what makes lesson 00 worth three exercises instead of one. By the end
of it you will have seen a gate fail on a value, a gate fail on a *type*, and
the difference between the two written in your own terminal.

## The loop

Every lesson is a directory under `tracks/typescript/lessons/`. Inside:

- `README.md` — this file. Read it top to bottom before you write anything.
- `reading.md` — the theory. Read it *after* you attempt the exercises.
- `ex1/`, `ex2/`, … — one directory per exercise. You edit `exN/solution.ts`
  and nothing else.
- `gate.test.ts` — the runtime gate: does your code do the right thing?
- `gate.test-d.ts` — the type gate: does your code *declare* the right thing?
  It never runs; `tsc` reads it.

Both gate files are quoted verbatim at the bottom of this README, and always
will be. You are never graded by a program you have not been shown.

The commands you will live in:

```
uv run dojo test typescript 00_hello_dojo        # grade the whole lesson
uv run dojo test typescript 00_hello_dojo ex2    # grade just one exercise
uv run dojo hint typescript 00_hello_dojo ex2    # stuck? reveal the next tier
uv run dojo read typescript 00_hello_dojo ex2    # the theory behind it
uv run dojo status typescript                    # the progress dashboard
uv run dojo next typescript                      # what should I do now?
```

`typescript` also answers to `ts`, so `uv run dojo test ts 00 ex2` is the same
command with less typing. Every one of these works on the other tracks too —
`uv run dojo status` on its own shows all six.

Before you write a single line, run the gate and watch it fail:

```
uv run dojo test typescript 00_hello_dojo
```

Three red tests, one type error. That is the correct state of a fresh
checkout, and reading a failure you *expected* is the cheapest way to learn to
read the ones you don't.

## Concept — a type annotation is a promise you make to the compiler

Here is a function with no annotations at all:

```ts
function double(n) {
  return n * 2;
}
```

Under this course's settings (`strict: true`, see `tracks/tsconfig.base.json`)
that will not compile: TypeScript refuses to guess what `n` is. Annotate the
parameter and it does compile:

```ts
function double(n: number) {
  return n * 2;
}
```

Notice what you did *not* have to write: the return type. TypeScript worked
out that `n * 2` is a `number` and inferred `double: (n: number) => number`.
Inference is the whole reason TypeScript is bearable to write — you annotate
the edges, it fills in the middle.

But inference is only as good as the body it reads. Consider:

```ts
function explode(n: number) {
  throw new Error("nope");
}
```

The body never returns, so TypeScript infers the return type `never`. That is
technically correct and practically useless: `never` is assignable to
everything, so every caller compiles no matter what they expect back. A stub
that throws is a *type-level lie* waiting to be told, and exercise 3 is about
catching one.

Two more things you will need below. Template literals interpolate with
backticks and `${}`:

```ts
const track = "react";
const line = `${track} has ${11 + 1} lessons`;   // "react has 12 lessons"
```

…and the conditional operator picks between two values inline:

```ts
const label = count === 1 ? "item" : "items";
```

Neither is a TypeScript feature — both are plain JavaScript that TypeScript
happens to type well. A lot of this course is like that.

## Exercise 1 — your first typed function

Edit `ex1/solution.ts`. Implement `greet` so that it returns a greeting built
from the `name` it is given:

- `greet("Eli")` must return `"Hello, Eli! Welcome to the dojo."`
- `greet("Ada")` must return `"Hello, Ada! Welcome to the dojo."`

Exact string, including the comma, the exclamation mark and the final full
stop. The signature is already written for you — `(name: string): string` —
and the type gate checks it is still that when you are done, so don't widen
it to `any` to make a red squiggle go away.

```
uv run dojo test typescript 00_hello_dojo ex1
```

## Exercise 2 — two parameters, and a decision

Edit `ex2/solution.ts`. Implement `describeTrack(name, lessons)` so it
returns a one-line summary:

- `describeTrack("typescript", 15)` → `"typescript: 15 lessons"`
- `describeTrack("react", 1)` → `"react: 1 lesson"`
- `describeTrack("csharp", 0)` → `"csharp: 0 lessons"`

Read those three lines again. Two of them are the same shape and one is not:
English pluralises on "exactly one", not on "more than one", so zero is
plural. Your function has to make that decision at runtime — there is no
single template literal that produces all three.

```
uv run dojo test typescript 00_hello_dojo ex2
```

## Exercise 3 — make the type true

Edit `ex3/solution.ts`. Implement `parseLessonNumber(slug)`, which takes a
lesson slug and returns its number:

- `parseLessonNumber("07_generics_2")` → `7`
- `parseLessonNumber("00_hello_dojo")` → `0`
- `parseLessonNumber("13_async_await")` → `13`

Two things make this more than string surgery. First, the slug can contain
more than one underscore, so take the *first* segment rather than everything
before the last one. Second — and this is the actual lesson — the stub has
**no return type annotation**, so TypeScript currently infers `never` from
the `throw`. Part of your job is to declare what this function returns.

The gate checks the value *and* the declared type, separately. Getting `7`
back from a function typed `never` is not a pass here, and that is deliberate:
in a real codebase it is the version that hurts.

```
uv run dojo test typescript 00_hello_dojo ex3
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import { greet } from "./ex1/solution";
import { describeTrack } from "./ex2/solution";
import { parseLessonNumber } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - greet() builds a greeting from a name", () => {
    expect(
      greet("Eli"),
      'greet("Eli") must return exactly "Hello, Eli! Welcome to the dojo." - ' +
        "compare it character by character, punctuation included",
    ).toBe("Hello, Eli! Welcome to the dojo.");
    expect(
      greet("Ada"),
      "the name has to come from the parameter, not be hard-coded - reread README ex1",
    ).toBe("Hello, Ada! Welcome to the dojo.");
  });

  test("ex2 - describeTrack() agrees with its own number", () => {
    expect(
      describeTrack("typescript", 15),
      'describeTrack("typescript", 15) must return "typescript: 15 lessons"',
    ).toBe("typescript: 15 lessons");
    expect(
      describeTrack("react", 1),
      'one lesson is a "lesson", not "lessons" - the plural is a decision your ' +
        "code has to make, not a template literal you can write once",
    ).toBe("react: 1 lesson");
    expect(
      describeTrack("csharp", 0),
      "zero is plural in English: expect \"csharp: 0 lessons\"",
    ).toBe("csharp: 0 lessons");
  });

  test("ex3 - parseLessonNumber() returns a number, not a string", () => {
    expect(
      parseLessonNumber("07_generics_2"),
      'parseLessonNumber("07_generics_2") must return the number 7 - note "07" ' +
        "has a leading zero, and toBe uses ===, so the string \"07\" will not pass",
    ).toBe(7);
    expect(
      parseLessonNumber("00_hello_dojo"),
      'the first lesson is number 0, not NaN - what does Number.parseInt("00") give?',
    ).toBe(0);
    expect(
      typeof parseLessonNumber("11_async_and_modules"),
      "the runtime type must be 'number' - a string of digits is not a number",
    ).toBe("number");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
import { describe, expectTypeOf, test } from "vitest";

import { greet } from "./ex1/solution";
import { parseLessonNumber } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - greet() is (name: string) => string", () => {
    expectTypeOf(greet).parameters.toEqualTypeOf<[name: string]>();
    expectTypeOf(greet).returns.toEqualTypeOf<string>();
  });

  test("ex3 - parseLessonNumber() is declared to return a number", () => {
    expectTypeOf(parseLessonNumber).returns.toEqualTypeOf<number>();
    // @ts-expect-error - a slug is a string; passing a number must not compile.
    parseLessonNumber(7);
  });
});
```

In plain English:

- **ex1** calls your `greet` twice with different names and compares the
  strings exactly; the type gate then checks the signature is still
  `(name: string) => string`.
- **ex2** calls `describeTrack` three times — plural, singular, and zero.
- **ex3** compares three parsed numbers with `toBe`, which is `===`, so
  `"7"` is not `7`; `typeof` catches a value that only looks numeric; and the
  type gate insists the declared return type is exactly `number`. The
  `@ts-expect-error` line is an assertion in reverse: it passes only if the
  line below it *fails* to compile, which proves your parameter is still
  `string` and not `any`.

One quirk worth knowing now: `tsc` typechecks a whole file at once, so while
ex3 is unfinished you will see its type error even on a run filtered to
`ex1`. The per-exercise verdict printed by `dojo test` is still exact — read
that line, not the noise above it.

## The teaching point

The habit this lesson is building is *predicting the failure*. You ran the
gate before writing anything, so you knew what red looked like; now every red
run you see is a comparison against something, not a surprise.

The second habit is treating a type as a claim that has to be true, not as
decoration you add until the editor stops complaining. `parseLessonNumber`
returning `never` was not a warning about style — it was the compiler
truthfully reporting that this function, as written, never returns. Most real
TypeScript bugs are exactly that: a type that was accurate when it was
written and quietly stopped being accurate later.

Next: **01_primitives_and_inference**, where you find out how much TypeScript
already knows without being told.
