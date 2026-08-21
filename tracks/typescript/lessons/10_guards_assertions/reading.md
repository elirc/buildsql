# Reading - typescript/10_guards_assertions

The boundary between typed code and untyped data — and the four tools that make
crossing it honest.

## Notes

**`any` vs `unknown` vs `never`, the interview answer.** `any` is the top type
with checking disabled: every operation on it compiles, and the looseness
propagates to anything derived from it. `unknown` is the top type with checking
enabled: every value is assignable *to* it, and it is assignable *from* nothing
until you narrow. `never` is the bottom type: no value has it, it is assignable
to everything, and it appears as the return type of functions that never finish
and as the result of impossible narrowing. A crisp one-liner: "`any` says stop
checking, `unknown` says check later, `never` says this cannot happen."

**A type predicate is a promise the compiler does not verify.** `value is
Lesson` tells the checker what a `true` return means, and nothing validates that
your body actually establishes it. `function isLesson(v: unknown): v is Lesson
{ return true; }` compiles. That is deliberate — the compiler cannot follow
arbitrary runtime logic — and it is why guards deserve unit tests of their own.
TypeScript 5.5 added *inferred* type predicates for simple cases (a function
whose body is just `return typeof x === "string"` may get a predicate
automatically), which is a nice improvement and does not remove the need to
write them explicitly for anything real.

**Assertion signatures have two syntactic traps.** They cannot be inferred, so
`export const assertX = (v: unknown): asserts v is T => {...}` is an error
("Assertions require every name in the call target to be declared with an
explicit type annotation") unless the *variable* carries the annotation. And
the assertion is only sound if the function throws on failure — a function
declared `asserts value is string[]` that quietly returns has told the compiler
a falsehood for the rest of the scope.

**Narrowing has limits that matter in real code.** It does not survive a
closure that might run later (`if (x) { setTimeout(() => x.foo) }` complains,
because `x` could change); it is lost for a mutable object property between the
check and the use (narrow into a `const` local instead); and `Array.prototype
.filter` does not narrow element types unless the predicate is a type guard —
`items.filter((i): i is Lesson => isLesson(i))` is the spelling that does.

**`satisfies` versus annotation versus `as`.** An annotation (`const x: T = ...`)
checks *and* widens the value to `T`. `satisfies` checks and keeps the inferred
type. `as` neither checks nor infers — it asserts, and the only safety rail is
that TypeScript refuses casts between types with no overlap (which people route
around with `as unknown as T`, the two-step cast that should always come with a
comment). Reach for `satisfies` on configuration objects, `as const satisfies T`
when you want literals *and* validation, and `as` only where you genuinely know
something the compiler cannot.

**Where schema libraries fit.** `zod`, `valibot`, `ArkType` and friends let you
declare a schema once and get both a runtime validator and a static type
(`z.infer<typeof schema>`). That is the same idea as this lesson's exercises with
the duplication removed, and it is what most production codebases use at
boundaries. Writing the hand-rolled version once — as you just did — is what
makes the library's value obvious, and what lets you debug it when the inferred
type is not what you expected.

## ex1 — a type guard

The three failing cases in the gate are the three that a careless
implementation gets wrong. `null` passes `typeof value === "object"`, which is
the oldest wart in JavaScript and the reason every object check needs
`&& value !== null`. A missing member and a member of the wrong type both need
`typeof` on the property, not just `"slug" in value` — `in` proves presence, not
type. And a bare string has no properties to check, so the object test has to
come first or the property reads throw.

The `as Record<string, unknown>` step after the object check is worth
justifying, because it looks like the cast this lesson warns about. It is
narrow, local, and true: after `typeof value === "object" && value !== null`, the
value really is an object with unknown-valued properties, and TypeScript's own
narrowing takes `unknown` to `object`, which has no index signature to read
through. The alternative is `"slug" in value &&` chains, which narrow properly
in modern TypeScript but read worse for four fields.

Extra members passing is structural typing being consistent: a guard checks
that what you need is there, not that nothing else is. If you need the stricter
version — no unknown keys — you must check `Object.keys` yourself, which is
exactly what `zod`'s `.strict()` does.

## ex2 — an assertion function

Guards and assertions are the same idea with different control flow. A guard
returns a boolean and the caller branches; an assertion throws and the caller
continues. Use a guard when both outcomes are ordinary (validation, filtering,
routing); use an assertion when the failure means the program is broken
(invariants, internal consistency, "this cannot happen" checks).

The empty-array case is a genuine JavaScript trap.
`[].every(x => typeof x === "string")` is `true` — vacuous truth — and so is
`![].some(...)`. That is correct set theory and occasionally the wrong business
rule, and the gate checks it so you have to decide rather than discover.

One more practical note: `Array.isArray` is the right check, not
`value instanceof Array`, because `instanceof` fails across realms (an array
from an iframe or a Node `vm` context has a different `Array` constructor).
`Array.isArray` was added to the language for exactly that reason.

## ex3 — `unknown`, not `any`

`JSON.parse` returning `any` is a deliberate, and much-criticised, decision in
the standard library. Its designers had no choice — the parsed shape is genuinely
unknown — but `any` means the hole propagates silently. Wrapping it in a function
that declares `unknown` is a one-line fix and a good habit; some codebases go
further and ban raw `JSON.parse` with a lint rule.

`readTitle` is what `unknown` costs, and it is the honest cost. Six lines of
checking replace an invisible assumption. Notice how the checks compose: object,
non-null, property is a string — each one narrows a little further, and only the
final `typeof` lets the value be returned as a `string`. That staircase is what
every validator, hand-written or generated, is doing underneath.

The design question in the hint — who catches `SyntaxError` — is worth having an
opinion about. `parseJson` that never throws (returning `null` or a `Result`) is
easier to compose; `parseJson` that throws matches the standard library and
keeps the error where it happened. Either is fine as long as the name says
which.

## ex4 — `satisfies`

`satisfies` closed a real gap. Before TypeScript 4.9 you had to choose between
annotating (validated, but every member widened to the annotation) and not
annotating (precise, but unchecked). The classic demonstration is a palette:

```ts
const palette = { red: [255, 0, 0], green: "#00ff00" } satisfies Record<string, string | number[]>;
palette.green.toUpperCase();   // green is string
palette.red.length;            // red is number[]
```

Both the constraint and the precision, at once.

The typo probe in the type gate makes the second half of the point. With
`: Record<string, Setting>`, `settings.retires` compiles, because an index
signature accepts every string key — the same lie lesson 03 warned about. With
`satisfies`, the object's own inferred type has exactly three keys, so the typo
is caught. That is the difference between "this value is a lookup table" and
"this value is checked against a lookup table's rules".

Pair it with `as const` when you want both immutability and validation:
`{ ... } as const satisfies Config` is the idiom for route tables, feature
flags and design tokens.

## challenge — a validator that collects everything

Returning at the first error is a guard; collecting all of them is a validator,
and a form that shows one error at a time is the user-facing symptom of getting
that wrong. The `Validated<T>` union is lesson 04's `Result` made generic, and it
composes: `Validated<Submission[]>`, `Validated<T>` returned from a parser, and
so on.

The casts when building the success value are the interesting part. You *have*
proved that `candidate.slug` is a string — but you proved it about a
`Record<string, unknown>`, and narrowing a property of a wide record does not
carry into a freshly-built object literal. Three small type guards would remove
the casts, at the cost of three more functions; a schema library removes them by
generating both halves from one declaration. All three approaches are defensible
and it is worth having written the manual one to know what you are buying.

The message ordering being part of the spec is deliberate. When errors are data
— shown in a UI, compared in tests, logged and grouped — their order and wording
are an API, and "the tests check exact strings" is a fair model of an API
consumer.

## Further reading

- [Handbook: Narrowing — using type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) — the official treatment of `value is T`, plus assertion functions.
- [Handbook: `unknown`](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown) — why `unknown` exists and how it differs from `any`.
- [TypeScript 4.9 release notes: the `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — the palette example and the motivation.
- [TypeScript 5.5 release notes: inferred type predicates](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates) — when the compiler now writes the predicate for you.
- [Zod documentation](https://zod.dev/) — the schema-first version of everything in this lesson, and the standard answer in production code.
