# Reading - typescript/00_hello_dojo

The loop you just ran — write, grade, read the evidence — is the whole course.
This page is the other half of every lesson: the *why* behind the problems you
just solved. It is meant to be read **after** you attempt a problem, whether
the gate went green or red. Failing first and reading second is not a
consolation prize; it is the version of studying that actually sticks.

## Notes

**What TypeScript actually is.** TypeScript is JavaScript plus a type
checker, and the checker runs at build time only. There is no TypeScript at
runtime: `tsc` (or in this course, vite, which vitest uses under the hood)
erases every annotation and emits plain JavaScript. That single fact explains
most of the language's design and most of the confusion around it. Types
cannot validate data arriving from a network call, because by the time the
data arrives the types are gone. Types cannot make a division by zero throw.
What they *can* do is prove, before you run anything, that the pieces of your
own program fit together — and that turns out to be worth an enormous amount
once a codebase outgrows one person's memory.

**Structural typing, in one paragraph.** Most typed languages you may have
met — Java, C# — are *nominal*: two types are the same if they have the same
name. TypeScript is *structural*: two types are the same if they have the
same shape. An object with a `name: string` property satisfies any type
asking for `{ name: string }`, regardless of what either was called or who
declared it first. This is why TypeScript feels so different from C# even
though the syntax rhymes, and it is a top-five interview question for this
stack. You will meet it properly in `03_objects_interfaces`; know now that it
is the reason "it just worked" happens as often as it does.

**Inference is the default, annotation is the exception.** The idiom in good
TypeScript is: annotate the *boundaries* — function parameters, exported
function return types, anything crossing a module edge — and let inference
handle everything inside. Annotating a local `const noun: string = "lesson"`
adds nothing except a place for a future edit to become inconsistent. The one
place people under-annotate is exported return types, which is exactly what
ex3 was about: without an annotation, a refactor inside the function silently
changes the type every caller sees.

**Why `strict` is on and staying on.** `tracks/tsconfig.base.json` turns on
`strict`, which is really a bundle of flags — `noImplicitAny`,
`strictNullChecks`, and several more. Learning TypeScript with strict off is
learning a different, worse language: `strictNullChecks` in particular is the
flag that makes `undefined` a value the compiler tracks rather than a landmine
it ignores. Every real codebase worth working in has it on, and every one that
doesn't is trying to turn it on.

## ex1 — your first typed function

The interesting part of this exercise is the part you didn't have to do. The
signature `(name: string): string` was written for you, so the only decision
left was the body — and yet the gate still checks the signature afterwards.
That is not busywork. The most common way a beginner "fixes" a type error is
to widen the type until the error goes away: `name: any`, or deleting the
return annotation. Both make the red squiggle vanish and both delete the
guarantee you were being given. The type gate exists so that this course
notices when you do it.

The other thing hiding here is template literals. `` `Hello, ${name}!` `` is
JavaScript, not TypeScript, but TypeScript types it precisely — and in
`05_literals_enums` you will meet *template literal types*, where the type
system itself can compute `` `Hello, ${string}` ``. Filing that away now
costs you nothing and makes lesson 05 feel inevitable.

## ex2 — a decision the type system cannot make for you

Pluralisation is a deliberately unglamorous problem, chosen because it splits
cleanly into "what the types guarantee" and "what they don't". The types
guarantee you were handed a `string` and a `number` and must hand back a
`string`. They have nothing whatsoever to say about whether `0` is plural.
Beginners frequently expect a type system to catch this class of bug and are
disappointed; the honest framing is that types eliminate a *category* of
mistakes — wrong shape, missing property, null where a value was assumed —
and leave logic entirely to you and your tests.

The classic mistake here is `lessons > 1 ? "lessons" : "lesson"`, which is
right for 15, right for 1, and wrong for 0. English pluralises on "is it
exactly one", so the condition to write is `lessons === 1`. Interviewers use
almost exactly this question — usually as "write a function that renders
'1 file' / '2 files'" — precisely because the zero case separates people who
tested their function from people who eyeballed it.

## ex3 — a type that was not true

`never` is the type with no values. Nothing is of type `never`, which is
exactly why *everything* accepts it: a function that can never return can be
substituted anywhere without ever producing a wrong value, because it never
produces a value at all. So when TypeScript infers `never` for your stub, it
is being precise and unhelpful in the same breath — precise because a body
that only throws truly never returns, unhelpful because every caller then
compiles regardless of what they expected.

Annotating `: number` inverts the relationship. Now the annotation is a claim
the compiler checks *your body* against, rather than a summary it derives
*from* your body. That is the whole argument for annotating exported return
types: an inferred type describes the code as it is today, and an annotated
one describes the contract the code has to keep tomorrow.

Two smaller traps live in this exercise. `Number.parseInt("07", 10)` is `7`,
not `07` and not an error — leading zeros are just digits — but always pass
the radix; `parseInt("08")` was a genuine source of production bugs in older
JavaScript engines that treated a leading zero as octal. And `toBe` is `===`,
so returning the string `"7"` fails against `7`. TypeScript would have caught
that one for you the moment you annotated the return type, which is the point.

## Further reading

- [The TypeScript Handbook — The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) — the official on-ramp. Twenty minutes, and it is written unusually well.
- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — annotations, inference, unions and literal types in one page. This is the page to reread after lessons 01–04.
- [`tsconfig` reference: `strict`](https://www.typescriptlang.org/tsconfig/#strict) — what the flag actually turns on, one sub-flag at a time.
- [MDN: template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) — the JavaScript half of ex1 and ex2, including the tagged-template form you will meet again much later.
- [Vitest: `expectTypeOf`](https://vitest.dev/api/expect-typeof) — the API the type gate is written in, so you can read the gates in later lessons without guessing.
