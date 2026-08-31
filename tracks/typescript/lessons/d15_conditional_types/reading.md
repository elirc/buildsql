# Reading - typescript/d15_conditional_types

The debrief. Per problem: what the conditional was really asking, the version
that looks right and is not, and one sentence on the model answer.

## Notes

**A conditional type is one question - "is `X` assignable to `Y`?" - and two
answers.** Everything else in this set is a consequence of that. The question
is assignability, not equality and not "what is it really", which is why a
literal answers yes to its base type (ex5), an array answers yes to `object`
(ex4), and `any` answers yes to everything at once (ex7).

**Distribution is the rule that makes conditionals feel haunted.** When the
checked type is a bare type parameter, the conditional is applied to each
member of a union separately and the results are unioned back. That gives you
`ToArray<string | number>` as `string[] | number[]` for free (ex2), and it
gives you `IsNever<never>` as `never` for free too (ex6) - because the union
with no members distributes into no results, and the union of no results is
`never`.

**So the first thing to decide about any conditional you write is whether you
want distribution.** If you do, keep the parameter naked. If you do not, wrap
both sides in a tuple: `[T] extends [U]`. That is the whole of ex3, and it is
the reason the tuple wrapper appears in every type-level library you will read.

**The last three problems are the standard probes**, and they are a family:
`IsNever` needs distribution switched off, `IsAny` needs the parameter out of
the checked position entirely, and `Equals` needs two conditionals the compiler
refuses to evaluate. Each one is a workaround for a place where the ordinary
rules cannot express the question - which is the useful thing to remember about
them, more than the syntax.

## ex1 - is it an array

What this was testing: that a conditional type is a *question about
assignability*, and that its branches may be literal types rather than
`boolean`. `boolean` is the union `true | false` - answering with it is
answering "yes and no".

The classic mistake is writing `T extends unknown[]`, which says `false` for
`readonly number[]` because a readonly array is not assignable to a mutable
one. Constraints run in the direction of assignability, and `readonly` is the
weaker requirement, so it is the one to test against.

The model answer is `T extends readonly unknown[] ? true : false` - one line,
and the tuple case falls out for free because every tuple is assignable to a
readonly array of its element union.

## ex2 - distribute over the union

What this was testing: the rule that a conditional type whose checked type is
a bare type parameter is applied to each member of a union separately and the
results are unioned back together. `ToArray<string | number>` is really two
evaluations, `string[]` and `number[]`, joined with `|`.

The classic mistake is thinking `T[]` and `ToArray<T>` are the same thing.
They agree on every non-union input and diverge on the first union anyone
passes, which is exactly the kind of bug that surfaces months later in
someone else's call site.

The model answer uses `T extends unknown ? T[] : never`: the false branch is
unreachable, and its only job is to make the type conditional so that
distribution applies - including the `never` case, where the empty union has
no members to distribute over and the result stays `never`.

## ex3 - and now do not distribute

What this was testing: the counterpart to ex2. Once you know distribution is
triggered by the bare parameter, turning it off is a syntax trick rather than
a new concept - and it is the trick that makes `IsNever` and every "compare
two types" helper possible.

The classic mistake is reaching for the tuple wrapper without understanding
it, and then writing `[T] extends [U] ? ... : ...` everywhere out of
superstition. Distribution is usually what you want; you switch it off when
the question is about the union *as a whole*.

The model answer is `[T] extends [unknown] ? T[] : never` - the condition is
still always true, but `T` is now inside a tuple, so the compiler evaluates it
once with the full union in hand.

## ex4 - name the family

What this was testing: chained conditionals, and the fact that assignability -
not some notion of "the real type" - decides which branch is taken. Every
question in the chain is `extends`, so the specific cases have to come before
the general ones.

The classic mistake is putting `T extends object` early and wondering why
arrays come back as `"object"`; the second-classic is forgetting that a
literal like `"ready"` is assignable to `string`, and adding a special case
for it that never fires.

The model answer is one nested chain from most specific to least, with `null`
and `undefined` first (they are assignable to nothing else here) and `"other"`
as the fallthrough - so adding `symbol` later means inserting one line.

## ex5 - widen a literal

What this was testing: that literal types are subtypes of their base types,
and that a conditional chain plus a fallthrough of `T` gives you a total
function over types. It is also a compact model of what the compiler does on
its own every time you write `let` instead of `const`.

The classic mistake is ending the chain with `never` or `unknown` instead of
`T`, which quietly destroys every object type passed in - the gate's
`{ id: 1 }` case exists to catch precisely that.

The model answer is a four-step chain ending in `T`, and it distributes for
free, so `Widen<"a" | 3>` comes out as `string | number` without a word about
unions anywhere in the definition.

## ex6 - is it never

What this was testing: the single most surprising consequence of distribution.
`T extends never ? true : false` applied to `never` runs the body zero times
and unions zero results, and the union of nothing is `never` - so the type
answers `never` to a yes/no question.

The classic mistake is not noticing, because `IsNever<never>` still *looks*
falsy at a glance and most call sites only ever ask about real types. It shows
up as an unreachable branch or a mysteriously empty result, usually far from
here.

The model answer is `[T] extends [never] ? true : false`: the tuple wrapper
makes the compiler compare the whole type at once, so `never` is checked
against `never` and answers `true`.

## ex7 - is it any

What this was testing: that `any` is not a type in the lattice so much as a
hole in it, and that detecting it needs a condition whose *checked* side does
not mention `T` at all. Every straightforward probe returns `boolean`, because
`any` satisfies both branches simultaneously.

The classic mistake is `T extends any ? true : false` - true for everything -
or its mirror `unknown extends T ? true : false`, which is also true for
`unknown`, and so cannot tell the two apart. The gate checks `unknown`
explicitly for that reason.

The model answer is `0 extends 1 & T ? true : false`: the intersection is
`never` for unrelated types, `1` when `T` is `1` or a supertype of it, and
`any` only when `T` is `any` - and `0` extends only that last one.

## ex8 - are these two types identical

What this was testing: the difference between mutual assignability and
identity, and the one probe that can tell them apart. `any` is the reason the
distinction matters - it is assignable in both directions to everything, so
`X extends Y ? Y extends X ? ...` reports every type as equal to `any`.

The classic mistake is shipping the two-sided `extends` version and trusting
it, usually inside a test helper. It also gets optional members wrong in the
other direction, which is why the gate compares `{ id: string }` with
`{ id?: string }`.

The model answer defers both conditionals behind a generic function type; the
compiler cannot evaluate either one, so it compares them structurally, and two
unevaluated conditionals are identical only when the types they branch on are.
That is an implementation detail rather than a documented rule, and it is worth
knowing which of the two you are relying on.

## Further reading

- [Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) - the base rule, and the section on distributive conditional types that ex2, ex3 and ex6 all turn on.
- [Handbook: Everyday Types - literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) - why `"ready" extends string` is true, which is the engine behind ex4 and ex5.
- [Handbook: `any`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any) - assignable in both directions to everything, which is exactly what ex7 and ex8 are working around.
- [TypeScript 2.8 release notes: conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html) - the original write-up, including the deferred-conditional behaviour ex8 relies on.
