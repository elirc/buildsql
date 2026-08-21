# i1 — Interview concepts

You can write TypeScript now. This part of the track is about *saying* it out
loud, under time pressure, to someone who is deciding whether to hire you.

Those are different skills. In an interview nobody watches you narrow a union
in an editor — they ask "what is the difference between `any` and `unknown`?"
and listen to thirty seconds of speech. The candidates who do well are not the
ones who know more; they are the ones who have said the answer before, have a
concrete example ready, and can name the follow-up question themselves.

So this lesson has two halves. `reading.md` is a bank of **60 questions with
model answers**, grouped by topic and tagged by how often they actually come up
(⭐ occasionally, ⭐⭐ regularly, ⭐⭐⭐ expect it). Each answer is written the way
a strong candidate would say it — three to six sentences, one example, and the
follow-up named — and each is cross-referenced to the lesson to redo if it does
not feel solid. The four exercises here spot-check the concepts that can be
checked in code, because knowing an answer and being able to write it are not
the same thing either.

## How to use the question bank

Open it with:

```
uv run dojo read typescript i1_interview_concepts
```

Then work like this, out loud:

1. Read the question. **Cover the answer.**
2. Say your answer to the wall, in full sentences, including an example. Aim for
   thirty seconds — long enough to show depth, short enough that the interviewer
   can steer.
3. Uncover and compare. Not word by word: check that you named the same
   *mechanism*, gave a concrete example, and did not say anything wrong.
4. If a question needed a second attempt, note the lesson it points at and redo
   that lesson's review exercise.

Do the ⭐⭐⭐ questions until they are boring. Those are the ones that will be
asked, and a hesitant answer to a ⭐⭐⭐ question costs you more than a blank on
a ⭐ one — because the interviewer reads it as "has not thought about this".

Two habits worth building while you practise. Say **"it depends, and here is
what it depends on"** when that is the truth: "`interface` or `type`? For an
object shape they are nearly the same; I use `interface` when it might be
extended or merged, `type` for unions and anything computed." And volunteer the
trade-off — "the cost of a string enum is that data from `JSON.parse` needs a
cast at every boundary". Interviewers are listening for judgement, not recall.

## Exercise 1 — `any` versus `unknown`, in code

Edit `ex1/solution.ts`. `lengthOf` currently takes `any`. Change it to
`unknown` and implement it so the body earns its way to an answer:

- `lengthOf("hello")` → `5`, `lengthOf([1, 2, 3])` → `3`
- `lengthOf({ a: 1, b: 2 })` → `2` (its key count)
- `lengthOf(null)` → `0`, `lengthOf(42)` → `0`, `lengthOf(undefined)` → `0`

The type gate checks the parameter is exactly `unknown`. Being able to *say* why
that matters is the point: `any` disables checking and spreads, `unknown` keeps
it and forces one narrowing step.

```
uv run dojo test typescript i1_interview_concepts ex1
```

## Exercise 2 — make the union exhaustive

Edit `ex2/solution.ts`. A fourth state (`failed`) was added to `JobState` and
`describeJob` was never updated — and nothing complained, because of a
catch-all `default`. Fix both halves:

- add the missing branch: `{ status: "failed", message: "gate red" }` →
  `"failed: gate red"`
- replace the `default` with an `assertNever` call so the *next* variant is a
  compile error instead of a wrong string

The other three renderings must keep working: `"queued"`, `"running (40%)"`,
`"done in 120ms"`.

```
uv run dojo test typescript i1_interview_concepts ex2
```

## Exercise 3 — declaration merging

Edit `ex3/solution.ts`. Add a **second** `interface DojoEvents` declaration —
do not edit the first — carrying a `fail` event with `exercise` and `message`,
then implement `describeEvent`:

- `describeEvent("pass", { exercise: "ex1" })` → `"pass ex1"`
- `describeEvent("fail", { exercise: "ex2", message: "wrong shape" })` →
  `"fail ex2: wrong shape"`

This is the answer to "what can an `interface` do that a `type` alias cannot?",
written as code. The type gate checks `keyof DojoEvents` is `"pass" | "fail"`.

```
uv run dojo test typescript i1_interview_concepts ex3
```

## Exercise 4 — what a `catch` actually gives you

Edit `ex4/solution.ts`. `errorMessage` claims its parameter is an `Error`. It
is not — `throw` accepts any value. Change the parameter to `unknown` and
implement it:

- `new Error("boom")` → `"boom"`, `new TypeError("bad type")` → `"bad type"`
- `"just a string"` → `"just a string"`
- `42` and `null` → `"unknown error"`

```
uv run dojo test typescript i1_interview_concepts ex4
```

## Review — safeGet

Edit `review1/solution.ts`. Both `any`s have to go. Implement
`safeGet(source, key)` taking `unknown` and returning `unknown`:

- `safeGet({ title: "Unions" }, "title")` → `"Unions"`
- `safeGet({ count: 0 }, "count")` → `0`
- `safeGet({}, "title")`, `safeGet(null, "title")`, `safeGet("a string", "title")`
  → `undefined`

```
uv run dojo test typescript i1_interview_concepts review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/i1_interview_concepts. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { lengthOf } from "./ex1/solution";
import { describeJob } from "./ex2/solution";
import { describeEvent } from "./ex3/solution";
import { errorMessage } from "./ex4/solution";
import { safeGet } from "./review1/solution";

describe("i1_interview_concepts", () => {
  test("ex1 - lengthOf() checks before it acts", () => {
    expect(lengthOf("hello"), "a string's length is its character count").toBe(5);
    expect(lengthOf([1, 2, 3]), "an array's length is its element count").toBe(3);
    expect(lengthOf({ a: 1, b: 2 }), "an object's length is how many keys it has").toBe(2);
    expect(lengthOf(null), "null is not an object for this purpose - typeof lies").toBe(0);
    expect(lengthOf(42), "a number has no length: 0").toBe(0);
    expect(lengthOf(undefined), "and neither does undefined").toBe(0);
  });

  test("ex2 - describeJob() covers every state", () => {
    expect(describeJob({ status: "queued" }), "queued renders as 'queued'").toBe("queued");
    expect(describeJob({ status: "running", percent: 40 }), "running shows the percent").toBe(
      "running (40%)",
    );
    expect(describeJob({ status: "done", durationMs: 120 }), "done shows the duration").toBe(
      "done in 120ms",
    );
    expect(
      describeJob({ status: "failed", message: "gate red" }),
      "the fourth variant needs its own branch: 'failed: <message>' - a default " +
        "that returns 'unknown' is the bug this exercise is about",
    ).toBe("failed: gate red");
  });

  test("ex3 - describeEvent() sees both merged declarations", () => {
    expect(
      describeEvent("pass", { exercise: "ex1" }),
      "a pass reads 'pass <exercise>'",
    ).toBe("pass ex1");
    expect(
      describeEvent("fail", { exercise: "ex2", message: "wrong shape" }),
      "the fail event only exists if your second interface declaration merged - " +
        "'fail <exercise>: <message>'",
    ).toBe("fail ex2: wrong shape");
  });

  test("ex4 - errorMessage() survives anything a catch can hand it", () => {
    expect(errorMessage(new Error("boom")), "a real Error contributes its message").toBe("boom");
    expect(
      errorMessage(new TypeError("bad type")),
      "every built-in error subclass is still an Error",
    ).toBe("bad type");
    expect(errorMessage("just a string"), "JavaScript can throw a string, and code does").toBe(
      "just a string",
    );
    expect(errorMessage(42), "anything else falls back to a fixed message").toBe("unknown error");
    expect(errorMessage(null), "including null, which is a legal thing to throw").toBe(
      "unknown error",
    );
  });

  test("review1 - safeGet() reads a key off something unknown", () => {
    expect(safeGet({ title: "Unions" }, "title"), "a present key gives its value").toBe("Unions");
    expect(safeGet({ count: 0 }, "count"), "a falsy value is still a value").toBe(0);
    expect(safeGet({}, "title"), "a missing key is undefined").toBeUndefined();
    expect(safeGet(null, "title"), "null in gives undefined out, with no exception").toBeUndefined();
    expect(safeGet("a string", "title"), "and so does a primitive").toBeUndefined();
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/i1_interview_concepts. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { lengthOf } from "./ex1/solution";
import type { JobState } from "./ex2/solution";
import { describeJob } from "./ex2/solution";
import type { DojoEvents } from "./ex3/solution";
import { describeEvent } from "./ex3/solution";
import { errorMessage } from "./ex4/solution";
import { safeGet } from "./review1/solution";

describe("i1_interview_concepts", () => {
  test("ex1 - lengthOf() takes unknown, not any", () => {
    expectTypeOf(lengthOf).parameters.toEqualTypeOf<[value: unknown]>();
    expectTypeOf(lengthOf).returns.toEqualTypeOf<number>();
  });

  test("ex2 - describeJob() still accepts every state", () => {
    expectTypeOf(describeJob).parameters.toEqualTypeOf<[job: JobState]>();
    // @ts-expect-error - "paused" is not one of the four states.
    describeJob({ status: "paused" });
  });

  test("ex3 - the merged interface has both events", () => {
    expectTypeOf<keyof DojoEvents>().toEqualTypeOf<"pass" | "fail">();
    expectTypeOf<DojoEvents["fail"]>().toEqualTypeOf<{ exercise: string; message: string }>();
    // @ts-expect-error - a fail payload needs a message.
    describeEvent("fail", { exercise: "ex2" });
    // @ts-expect-error - "skip" was never declared.
    describeEvent("skip", { exercise: "ex2" });
  });

  test("ex4 - errorMessage() accepts anything, because throw does", () => {
    expectTypeOf(errorMessage).parameters.toEqualTypeOf<[error: unknown]>();
    expectTypeOf(errorMessage).returns.toEqualTypeOf<string>();
  });

  test("review1 - safeGet() hands back unknown, not any", () => {
    expectTypeOf(safeGet).parameters.toEqualTypeOf<[source: unknown, key: string]>();
    expectTypeOf(safeGet({}, "k")).toEqualTypeOf<unknown>();
    // @ts-expect-error - the result is unknown until you narrow it.
    safeGet({}, "k").length;
  });
});
```

In plain English:

- **ex1** checks six values including the two that catch a lazy implementation
  (`null` and `undefined`), and the type gate insists the parameter is `unknown`
  rather than `any`.
- **ex2** checks all four renderings; the fourth is the one the shipped code gets
  wrong, and the `@ts-expect-error` proves the union is still closed.
- **ex3** calls both events. The type gate reads `keyof DojoEvents` — which is
  `"pass"` alone unless your second declaration merged — and proves a fail
  payload without a message is rejected.
- **ex4** checks two error subclasses, a thrown string, a number and `null`.
- **review1** checks a present key, a falsy value, a missing key and two
  non-objects, and requires the result type to be `unknown`.

## The teaching point

The best preparation for a TypeScript interview is not more TypeScript — it is
rehearsal. Every question in the bank has an answer you already know from this
track; what you are practising is compressing it into thirty seconds with an
example attached, and knowing which trade-off to volunteer.

One more thing worth internalising: interviewers are usually probing for
*judgement*, not trivia. "Should this be an enum or a union?" has no correct
answer, and a candidate who says "union by default, because it is erased and
survives JSON; enum when I want nominal typing and one import" has said more
than a candidate who recites both definitions perfectly. Every ⭐⭐⭐ answer in
the bank ends with a trade-off for exactly that reason.

Next: **i2_interview_drills**, where you sit down and write the code, on the
clock.
