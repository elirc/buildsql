# Reading - typescript/d03_objects_shapes

The debrief. What each shape was really testing, the mistake that keeps
appearing in code review, and one sentence on the model answer.

## Notes

**The skill this set drills is saying exactly what an object has.** Not
roughly, not "some strings" - exactly. Which members are required, which may be
absent, which must not be reassigned, and whether the key set is fixed at all.
Every problem here is a different answer to that last question: a fixed set of
named members (ex1-ex4, ex6), an open set described by an index signature (ex5,
ex7, ex8), or a fixed set that nests into itself (ex7).

**Optional is a statement about the key, not about the value.** `explicit?:
boolean` says the property may be *absent*; `explicit: boolean | undefined`
says it must be present and may hold `undefined`. They behave almost
identically in your `if`, and completely differently to `in`,
`Object.keys`, spread, and anyone reading your API. Reach for `?` unless you
have a reason.

**A default fires for `undefined` and for nothing else.** This is the single
most repeated bug in this set, and ex2 makes it explicit: `year = 0` keeps the
zero, `label = ""` keeps the empty string, and `||` would silently replace
both. `??` and destructuring defaults are the nullish tools; `||` is the
falsiness tool, and the two agree only when your data has no zeroes, no empty
strings and no `false`.

**`readonly` is compile-time only, and it is shallow.** `readonly tracks:
readonly string[]` needs the modifier twice for a reason: the first stops you
reassigning the property, the second stops you pushing into the array behind
it. Nothing is frozen at runtime, and a `readonly` object can always be passed
to something that expects a mutable one via a cast - the value is entirely in
the errors you get for free while writing.

**And an index signature is a promise about every key, including the ones that
are not there.** `{ [artist: string]: Totals }` says any string key yields a
`Totals` - which is a lie the moment you read a key that was never set, and
which is why `noUncheckedIndexedAccess` exists and why the model answers here
create the entry before touching it.

## ex1 - one track, one line

What this was testing: an object type used as a parameter, and the difference
between "the property is missing" and "the property is `false`". The gate asks
for the same output in both cases, which is only easy if you check truthiness
rather than presence.

The classic mistake is `"explicit" in track ? " [E]" : ""`, which is a presence
check and renders the suffix for `explicit: false`. The mirror-image mistake is
`track.explicit!` to silence the compiler, which converts a type question into
a runtime one for no benefit.

The model answer compares against `true` (or uses plain truthiness) and builds
the suffix as a separate `const`, so the template literal at the end reads as
one line rather than as a nested ternary.

## ex2 - defaults that respect zero

What this was testing: that you know which operator fires on which values.
Destructuring defaults and `??` both trigger on `undefined` alone; `||`
triggers on every falsy value, which here means `0` and `""`.

The classic mistake is `input.label || "independent"`, which passes three of the
four assertions and quietly rewrites an intentionally empty label. The gate
includes `{ title: "Bootleg", label: "" }` for exactly that reason.

The model answer destructures with a default for `label` and handles `year`
with an explicit `undefined` check, because the year needs a *different* string
when absent rather than a different number - and a default cannot express that.

## ex3 - append without mutating

What this was testing: `readonly` in both of the places it is needed, and the
copy-then-change habit. The type gate pushes into `playlist.tracks` and assigns
to `playlist.id`, and both have to be compile errors before the exercise counts.

The classic mistake is `playlist.tracks.push(title); return playlist;` - which
returns the right data, passes a naive equality check, and fails the two
assertions that the caller's array and object are untouched. The second-classic
is `{ ...playlist, tracks: playlist.tracks }`, a new object sharing the old
array, which fails only the array identity check.

The model answer spreads both levels: a new object literal, and a new array
built with `[...playlist.tracks, title]`. Two spreads, one line.

## ex4 - two optional levels deep

What this was testing: optional chaining through more than one level, and
knowing that `?.` short-circuits the whole chain rather than one step. The extra
twist is that a present-but-blank value has to be treated as absent, which `?.`
alone will not do for you.

The classic mistake is `playlist.owner?.contact.email`, which the compiler
accepts (the `?.` covered `owner`, so `contact` looks safe) and which throws at
runtime when the owner exists without a contact. Every hop that can be missing
needs its own `?.`.

The model answer trims into two locals first, so the fallbacks are decided by a
single truthiness check each rather than by a chain of `??` that would keep the
whitespace.

## ex5 - a tally of objects

What this was testing: an index signature whose value type is itself an object,
and the "create the bucket before you use it" pattern. `unknown` as the value
type - what the stub ships - is the anti-pattern, because it makes every read
require a cast.

The classic mistake is `totals[artist].count += 1` on a key that has never been
seen, which is `undefined.count` at runtime. The type system does not stop it,
because an index signature claims every key is present.

The model answer uses `totals[artist] ??= { count: 0, seconds: 0 }` and keeps a
reference to the entry, so the bucket is created exactly once and updated in
place - one lookup instead of three.

## ex6 - keep only the tags that exist

What this was testing: iterating an object with optional members, where
`Object.entries` hands you `string | undefined` values and you have to narrow
before you can trim. It is the inverse of ex2: instead of filling holes, you are
removing them.

The classic mistake is `if (value)`, which is nearly right and drops nothing
that should survive here - but would drop a legitimate `0` in any version of
this function whose values are numbers. Being explicit (`typeof value ===
"string" && value.trim() !== ""`) documents the rule.

The model answer builds a fresh `Record<string, string>` rather than deleting
from a copy, because `delete` on a typed object fights the type system and
leaves the result's type claiming members that are gone.

## ex7 - flatten a recursive shape

What this was testing: a self-referential interface, and a walk that carries a
prefix. `interface MetaTree { [key: string]: string | MetaTree }` is legal and
lazy - the interface may mention itself because interfaces are resolved by name.

The classic mistake is emitting a key for a branch: `{ a: {} }` producing
`{ "a": {} }` or `{ "a.": "" }`. A branch contributes nothing of its own; only
leaves produce entries, which falls out naturally if the only place you write
into the accumulator is the string case.

The model answer passes the accumulated path down rather than returning partial
objects and merging them, so there is one object, one write per leaf, and no
allocation per level.

## ex8 - diff two records

What this was testing: two passes over two key sets, and a deterministic output.
Sorting is not cosmetic here - a diff that reports the same change in a
different order every run is unusable in a log or a test.

The classic mistake is a single pass over `after`, which finds everything added
and changed and silently misses everything removed. The second-classic is
comparing with `==`, which would call `1` and `"1"` equal and lose a real change.

The model answer walks `after` for added-and-changed, walks `before` for
removed, uses `in` rather than `!== undefined` (so a key explicitly set to
`undefined` still counts as present), and sorts each list before returning.

## Further reading

- [Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) - optional members, `readonly`, index signatures, and excess property checks, in one page.
- [Handbook: Index signatures](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures) - what they promise, and why the promise is optimistic.
- [TSConfig: noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess) - the flag that makes the ex5 trap a compile error instead of a crash.
- [MDN: Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) - how far `?.` short-circuits, which is the whole of ex4.
- [MDN: Nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) - `??` against `||`, with the falsy-value table ex2 is built on.
