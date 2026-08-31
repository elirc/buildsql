# Reading - typescript/d10_generic_constraints

The debrief. Per problem: what the constraint was buying, the mistake that
loosens or tightens it wrongly, and one sentence on the model answer.

## Notes

**The skill this set drills is writing the smallest constraint that lets the
body work.** `T extends { amount: number }` says two things at once: the body
may read `.amount`, and a caller without one is turned away at the call site
rather than at runtime. Widen it to `T extends object` and the body stops
compiling; narrow it to a concrete type and the function stops being generic.
The right constraint is exactly the members you touch.

**A constraint is not the same as the parameter type.** `sumOf<T extends
{ amount: number }>(items: readonly T[])` and `sumOf(items: readonly
{ amount: number }[])` accept the same arguments; only the first remembers what
came in. That memory matters the moment the function returns elements rather
than a number - which is why ex2 and ex8 are generic and ex1 barely needs to be.

**Constraints are what keep literal types alive.** `K extends string` in ex3
tells inference to prefer the literal union `"a" | "b"` over `string`, which is
what makes `Record<K, number>` an exhaustive table instead of an open bag. A
plain `K` (or `keys: string[]`) loses that, and the gate's `toEqualTypeOf`
catches it.

**A default type parameter is a promise about the common case.**
`K extends string | number = string` means "keys are strings unless you say
otherwise", and it has to come after the constraint. Defaults are how a generic
API stays one type argument wide for the ninety percent and still opens up for
the rest.

**And an intersection is the honest return type for a merge.** `A & B` says the
result has everything from both, which is what a spread produces at runtime.
One `as` on the way out is expected - TypeScript cannot verify that
`{ ...a, ...b }` is an `A & B` when the keys overlap - and saying so out loud is
better than pretending the cast is not there.

## ex1 - sum whatever has an amount

What this was testing: the smallest possible constraint, and the fact that
structural typing lets any object with an `amount` through, extra members
included. The gate passes objects with three members precisely to make that
point.

The classic mistake is `T extends object`, which compiles as a signature and
then refuses `item.amount` in the body - and the fix people reach for is a cast,
which throws away the check the constraint was there to provide.

The model answer constrains to exactly `{ amount: number }` and loops; an
interviewer would then ask why it is generic at all, and the honest answer is
that here it barely needs to be - the shape becomes essential in ex2.

## ex2 - replace by id

What this was testing: a constraint that lets the body compare a member *and* a
return type that gives the caller back their own element type. Both halves are
needed - `{ id: string }[]` in and out would lose `qty`.

The classic mistake is `items.map((item) => (item.id === updated.id ? updated : item))`
without the append case, which silently drops an insert; the second-classic is
`items.push(updated)` on the parameter, which mutates the caller's array.

The model answer finds the index once, then either spreads with the new item
appended or maps by index - so the "replaced in place" and "appended at the end"
cases are visibly two different returns.

## ex3 - a tally with declared buckets

What this was testing: `K extends string` as an inference hint. Constraining to
`string` is what makes TypeScript keep `"a" | "b"` instead of widening to
`string`, and `Record<K, number>` is only useful because of it.

The classic mistake is `const counts: Record<K, number> = {}`, which does not
compile - an empty object is not a complete record. `{} as Record<K, number>` is
the accepted cast, and it is safe because the very next loop fills every key.

The model answer seeds every declared bucket at zero first and only then counts,
which is what makes `{ a: 2, b: 0 }` come out with `b` present and the unlisted
`c` ignored.

## ex4 - defaults under a value

What this was testing: two independent constrained parameters and an
intersection return. `A & B` is the type of `{ ...defaults, ...value }`, and the
order of the spreads is the whole behaviour.

The classic mistake is `{ ...value, ...defaults }`, which lets the defaults win -
correct-looking, backwards, and caught by the very first assertion. The
second-classic is `value.a || defaults.a` thinking, which the gate punishes with
`{ a: 0 }`.

The model answer spreads defaults first, value second, and casts once on the way
out - because TypeScript will not verify the intersection for overlapping keys,
and pretending otherwise would need a much larger type-level detour.

## ex5 - a cache with a default key type

What this was testing: a default type parameter, and the ordering rule that
comes with it - `K extends string | number = string`, constraint first, default
second. It also tests that state lives per call, not per module.

The classic mistake is putting the value type second (`makeCache<K, V>`), which
forces every caller to write both arguments and defeats the default entirely.
The parameter you want inferred or defaulted goes last.

The model answer closes over one `Map` per call and returns an object literal of
four methods, so two caches are two closures - which the gate checks by making
two and comparing their sizes.

## ex6 - group into a Map

What this was testing: constraining a *derived* type. `G` is not the element
type; it is whatever the callback returns, and `string | number` is the
constraint that keeps it usable as a key.

The classic mistake is `Map<string, T[]>` with `String(groupOf(item))` inside,
which silently stringifies numeric groups and makes `map.get(2)` a miss. Let `G`
be `G`.

The model answer creates the bucket on first sight (`map.get(key) ?? []`,
`map.set`) so groups come out in first-seen order, which is what `Map` preserves
and a plain object does not for numeric-looking keys.

## ex7 - merge two objects, deeply

What this was testing: recursion under a constraint, plus a definition of "plain
object" precise enough to keep arrays and `null` out. `typeof value === "object"`
is true for both of them, which is the whole trap.

The classic mistake is recursing into arrays, which merges `[1, 2]` with `[3]`
into `[3, 2]` - almost never what anyone wants, and the gate has a case for it.
The second-classic is mutating `a` instead of copying it, which the last two
assertions catch at depth.

The model answer copies the first object, walks the second's entries, and
recurses only when both sides are plain objects - one guard function, used
twice, keeps that rule in one place.

## ex8 - a store that refuses stale writes

What this was testing: a constrained *class* type parameter, where the
constraint has to name every member the class body reads. `id` alone is not
enough once `put` compares versions.

The classic mistake is `current.version > item.version` for the refusal, which
lets an equal version overwrite - the gate writes the same version twice to
check. Last-write-wins on equal versions is a defensible policy, but it is not
the one the prompt describes.

The model answer keeps a `Map<string, T>`, refuses when the stored version is
greater **or equal**, and sorts in `all()` rather than on every write - because
reads are where the order is wanted and writes are where the cost would be.

## Further reading

- [Handbook: Generic constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints) - `extends` in a type parameter list, and using one parameter to constrain another.
- [Handbook: Generic parameter defaults](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-parameter-defaults) - the `= string` in ex5 and the ordering rules around it.
- [Handbook: Intersection types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types) - the `A & B` returned by ex4 and ex7.
- [Handbook: Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) - and why a literal key union makes it exhaustive.
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) - insertion order, and why numeric keys survive a `Map` and not an object.
