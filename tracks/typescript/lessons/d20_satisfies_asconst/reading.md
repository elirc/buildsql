# Reading - typescript/d20_satisfies_asconst

The debrief. Per problem: which operator was really at stake, the annotation
that quietly destroys the answer, and one sentence on the model answer.

## Notes

**Four ways to attach a type to a value, and they are not interchangeable.** An
*annotation* (`const x: T = ...`) checks the value and then uses `T` as the
type, discarding whatever was inferred. An *assertion* (`x as T`) replaces the
type and checks almost nothing - `as` only requires the two types to overlap. A
*const assertion* (`x as const`) checks nothing and preserves everything: no
widening, and `readonly` on every member. And `satisfies T` checks fully and
preserves the inferred type. Most of the stubs in this set are annotations, and
most of the fixes are one of the other three.

**Widening is the default and it is usually right.** `let mode = "strict"` gives
`string`, because you are going to reassign it. It is wrong exactly when the
value *is* the specification - a config object, a route table, a plan matrix -
and `as const` is how you say so.

**`satisfies` exists because annotations are a trade.** Before it, checking an
object against a shape meant accepting that shape as the object's type, which
is why so many codebases have a `Record<string, string>` sitting on top of a
constant whose three keys everyone wanted to know about. `satisfies` removes the
trade: full checking, no loss.

**They compose, in one order.** `expr as const satisfies T` freezes first and
checks second, which is what ex4, ex7 and ex8 all need. The other order is
legal and useless, and the frozen value forces the target type to be readonly -
a readonly tuple is not assignable to a mutable array, which is the error most
people meet first here.

**And `const` type parameters move the decision to the callee.** `<const T>`
infers as though the caller had written `as const`, so a helper can insist on
literal inference instead of documenting a convention. It is the newest piece
in this set and the one most likely to be missing from code you inherit.

**The payoff, in every case, is derivation.** `keyof typeof`, `[number]` and
indexed access turn a frozen table into the unions and mapped types around it -
so the data and the types cannot drift, because there is only one of them.

## ex1 - freeze a config object

What this was testing: that an annotation and a const assertion pull in
opposite directions. `const RETRY: { attempts: number } = { attempts: 3 }`
throws away the one fact worth keeping - that the value is 3 - and hands back
something writable.

The classic mistake is thinking `const` already prevents this. `const` protects
the binding, not the object: without an assertion, `RETRY.attempts` is a
mutable `number`, because that is what the compiler infers for a property of an
object literal.

The model answer is the same literal with `as const` after it, which freezes
the values as literal types and marks every member `readonly` - one operator,
both effects.

## ex2 - return a pair, not an array

What this was testing: that `as const` applies to any literal expression, not
only to a top-level declaration - and that on an array literal it produces a
tuple, which is what makes `const [low, high] = minMax(rows)` typecheck without
either element being `number | undefined`.

The classic mistake is annotating the return type as `number[]` and then
wondering why destructuring gives possibly-undefined elements. The second is
writing the tuple type out by hand, which works until the body changes and the
two drift.

The model answer omits the return type and puts `as const` on the returned
array literal, so the signature is derived from the implementation and says
exactly what the caller gets.

## ex3 - check without erasing

What this was testing: the core of `satisfies` - a check that does not become
the type. The annotation `Record<string, string>` is a strictly worse
description of this object than the one the compiler would have worked out on
its own, and swapping it for a `satisfies` clause is the whole fix.

The classic mistake is believing that an annotation is the only way to get a
value validated, and accepting the loss of key information as the price. The
second is dropping the constraint entirely, which keeps the keys and stops
checking the values.

The model answer keeps the object literal exactly as written and appends a
`satisfies` clause naming the hex-string record, so a mistyped colour is caught
at the declaration and the three key names stay in the type.

## ex4 - a route table that publishes its paths

What this was testing: the `as const satisfies` pair, and indexed access with
`[number]` to turn a tuple of objects into a union of one of their fields. This
is how a route table, a menu definition or a migration list can be the single
source of truth for the types around it.

The classic mistake is picking one operator. `as const` alone leaves the entries
unchecked, so a typo in `method` is only caught wherever the value is used;
`satisfies` alone (without `as const`) leaves `path` widened to `string`, and
`RoutePath` becomes useless.

The model answer freezes first and checks second, so the literals survive into
`typeof ROUTES` and the derived unions come out of the data rather than being
maintained beside it.

## ex5 - satisfies against as

What this was testing: the three-way difference between an annotation, an
assertion and `satisfies`. An annotation checks and replaces. An assertion
replaces and barely checks - `as` only requires the two types to overlap, so it
will happily accept a value with a missing field if the shapes are close
enough. `satisfies` checks fully and replaces nothing.

The classic mistake is reaching for `as` to silence an error, which is the one
option that can make a genuine mistake invisible. The second is expecting
`satisfies` to preserve every literal; it preserves what the target type leaves
room for, which is why `retries` comes out as `number`.

The model answer swaps `as Settings` for `satisfies Settings` and changes
nothing else - the value is validated more strictly than before, and the
inferred type is more precise than before.

## ex6 - as const on the callee side

What this was testing: `const` type parameters, which move the decision about
widening from the caller to the function. Before them, a helper that wanted
literal inference had to document "call me with `as const`" and hope; now the
signature can ask for it.

The classic mistake is putting `as const` inside the body - `return values as
const` - which does nothing, because the widening already happened during
inference at the call site. By the time the body runs, `T` has been decided.

The model answer adds one keyword to the type parameter and returns the
argument, and the gate's three assertions all change from widened arrays to
readonly tuples of literals.

## ex7 - derive two unions from one table

What this was testing: `as const satisfies` on a nested structure, and a
three-step indexed access that turns a table into a union of leaf values. The
result is that adding a fourth plan with a new feature updates `Feature`
automatically, which is the entire argument for keeping data and types in one
place.

The classic mistake is the stub's annotation, which is easy to defend
("`Record` documents the shape") and destroys both derived types at once -
`keyof` an index signature is `string`, so `PlanName` says nothing and `Feature`
follows it down.

The model answer freezes the table, checks it, and lets the two derived types do
their work: `keyof typeof` for the names, and
`[PlanName]["features"][number]` for the features - a union of unions of
unions, deduplicated by the type system for free.

## ex8 - a flag spec that types its own defaults

What this was testing: the whole set, plus d14 and d15. A frozen, checked spec;
`keyof typeof` for the names; a mapped type over those names; a conditional type
that reads each entry's `kind` to pick a member type; and a function whose
return type is the result. Nothing here is new - the point is that they compose
into a small typed CLI with one source of truth.

The classic mistake is the annotation on `FLAGS`, and it is worth being precise
about the damage: `FlagName` becomes `string`, so the mapped type becomes an
index signature, so `Flags` accepts any key with the wrong type, so
`defaults()` typechecks while returning nonsense. One annotation, four
consequences.

The model answer freezes and checks the spec, leaves the two derived types
untouched, and reads the defaults straight back out of `FLAGS` - so adding a
fourth flag means editing one object and nothing else.

## Further reading

- [Handbook: const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) - what `as const` does to literals, arrays and objects.
- [TypeScript 4.9 release notes: the satisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) - the motivating examples, including the palette in ex3.
- [TypeScript 5.0 release notes: const type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters) - the `<const T>` modifier from ex6.
- [Handbook: Literal types and widening](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference) - why `const` on the binding does not stop the properties widening.
- [Handbook: keyof and Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) - the `[number]` and `[PlanName]` steps that derive the unions in ex4, ex7 and ex8.
